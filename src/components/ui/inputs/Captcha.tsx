'use client';

import '@/styles/04-components/ui/inputs/captcha.scss';

import { useEffect, useRef } from 'react';

import { ENV } from '@/config/env';

const TURNSTILE_SCRIPT_URL = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

/**
 * Carga el script de Turnstile una sola vez, aunque el componente se monte
 * varias veces: dos etiquetas del mismo script harían que el segundo
 * `render` se quejase de un contenedor ya inicializado.
 * @param {string} url - URL del script de Turnstile
 * @returns {Promise<void>} Resuelve cuando el script está cargado
 */
function loadScript(url: string): Promise<void> {
  const existing = document.querySelector<HTMLScriptElement>(`script[src="${url}"]`);

  if (existing) {
    return existing.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise((resolve, reject) => {
          existing.addEventListener('load', () => resolve());
          existing.addEventListener('error', () => reject(new Error(url)));
        });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    });
    script.addEventListener('error', () => reject(new Error(url)));
    document.head.appendChild(script);
  });
}

/**
 * Widget de Cloudflare Turnstile del formulario de contacto público.
 *
 * **Si no hay `NEXT_PUBLIC_TURNSTILE_SITE_KEY` configurada, este componente
 * no pinta nada** y no estorba: el backend acepta envíos sin `captchaToken`
 * (solo lo valida si se envía), así que el formulario sigue funcionando en
 * desarrollo sin captcha configurado. Tampoco bloquea el envío si el script
 * falla al cargar (CDN caído, bloqueador de contenido...): se avisa por
 * consola y se deja pasar — es el backend quien decide si un envío sin
 * token es aceptable.
 * @param {CaptchaProps} props - Propiedades del componente
 * @returns {JSX.Element | null} El contenedor del widget, o `null` si el captcha no está configurado
 */
export default function Captcha({ onVerify, onExpire, className }: CaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const isEnabled = ENV.TURNSTILE_SITE_KEY.length > 0;

  useEffect(() => {
    if (!isEnabled) return;

    let isActive = true;

    loadScript(TURNSTILE_SCRIPT_URL)
      .then(() => {
        const api = (window as unknown as Record<string, CaptchaWidgetApi | undefined>).turnstile;

        if (!isActive || !api || !containerRef.current || widgetIdRef.current) return;

        widgetIdRef.current = api.render(containerRef.current, {
          sitekey: ENV.TURNSTILE_SITE_KEY,
          callback: onVerify,
          'expired-callback': onExpire,
          'error-callback': onExpire,
        });
      })
      .catch(() => {
        console.warn('No se pudo cargar Turnstile; el envío continuará sin token de captcha.');
      });

    return () => {
      isActive = false;
    };
  }, [isEnabled, onVerify, onExpire]);

  if (!isEnabled) return null;

  return <div ref={containerRef} className={`captcha${className ? ` ${className}` : ''}`} />;
}
