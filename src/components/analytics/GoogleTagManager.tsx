'use client';

import { useEffect, useRef } from 'react';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

import { ENV } from '@/config/env';
import { GTM_PAGE_TITLE_TIMEOUT_MS } from '@/config/settings';
import { subscribeToCookieConsent } from '@/lib/cookieConsent';
import {
  buildGtmBootstrap,
  isValidGtmContainerId,
  pushConsentUpdate,
  pushToDataLayer,
} from '@/lib/gtm';

/**
 * Contenedor de Google Tag Manager de las páginas públicas.
 *
 * **Sin `NEXT_PUBLIC_GTM_ID` configurada no pinta nada**, igual que
 * {@link Captcha}: la plantilla arranca en local sin medición y sin tener
 * que tocar código. Solo se monta en el layout público, así que el área
 * privada del cliente queda fuera de la medición.
 *
 * Va acompañado de tres cosas que el contenedor da por hechas:
 *
 * - El consentimiento: el script de arranque declara el `consent default`
 *   antes de cargar `gtm.js`, y aquí se escuchan los cambios del banner para
 *   mandar el `consent update` correspondiente (`lib/gtm.ts`).
 * - Las navegaciones de cliente: en el App Router no hay recarga entre
 *   páginas, así que a partir de la segunda se empuja un evento `page_view`
 *   propio. La primera no se empuja: de esa ya se encarga la etiqueta de
 *   configuración del contenedor al inicializarse, y duplicarla contaría
 *   dos veces cada entrada al sitio.
 * - No se incluye el `<noscript>` con el iframe de GTM: ese no puede llevar
 *   señal de consentimiento, así que dispararía las etiquetas sin permiso
 *   justo para quien no puede ni ver el banner.
 * @returns {JSX.Element | null} El script de arranque del contenedor, o `null` si no hay contenedor configurado
 */
export default function GoogleTagManager() {
  const containerId = ENV.GTM_ID;
  const isEnabled = isValidGtmContainerId(containerId);

  const pathname = usePathname();
  const isFirstView = useRef(true);
  const measuredTitle = useRef('');

  useEffect(() => {
    if (!isEnabled) return;

    return subscribeToCookieConsent(pushConsentUpdate);
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    if (isFirstView.current) {
      isFirstView.current = false;
      measuredTitle.current = document.title;
      return;
    }

    const pushPageView = () => {
      measuredTitle.current = document.title;

      pushToDataLayer({
        event: 'page_view',
        page_path: `${pathname}${window.location.search}`,
        page_location: window.location.href,
        page_title: document.title,
      });
    };

    // El título de la página nueva no se aplica en el mismo commit que su
    // contenido, así que aquí `document.title` puede ser todavía el de la
    // página anterior, o estar vacío. Se espera a que cambie —y, como
    // mucho, `GTM_PAGE_TITLE_TIMEOUT_MS`— para no mandar a la analítica
    // visitas con el título equivocado.
    if (document.title && document.title !== measuredTitle.current) {
      pushPageView();
      return;
    }

    const observer = new MutationObserver(() => {
      if (!document.title || document.title === measuredTitle.current) return;

      observer.disconnect();
      clearTimeout(timeout);
      pushPageView();
    });

    const timeout = setTimeout(() => {
      observer.disconnect();
      pushPageView();
    }, GTM_PAGE_TITLE_TIMEOUT_MS);

    observer.observe(document.head, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [isEnabled, pathname]);

  if (!isEnabled) return null;

  return (
    <Script
      id="gtm-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: buildGtmBootstrap(containerId) }}
    />
  );
}
