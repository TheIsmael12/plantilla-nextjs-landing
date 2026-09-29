'use client';

import { useEffect, useRef } from 'react';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

import { ENV } from '@/config/env';
import { GTM_PAGE_TITLE_TIMEOUT_MS } from '@/config/settings';
import { useIsMounted } from '@/hooks/useIsMounted';
import { subscribeToCookieConsent } from '@/lib/cookieConsent';
import {
  buildGtmBootstrap,
  isValidGtmContainerId,
  pushConsentUpdate,
  pushToDataLayer,
} from '@/lib/gtm';
import {
  isAnalyticsExcludedPath,
  sanitizeAnalyticsPathname,
  sanitizeAnalyticsSearch,
  sanitizeAnalyticsUrl,
} from '@/utils/analyticsUrlUtils';

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
 * - Las URLs con token: en las páginas a las que se llega desde un email con
 *   un token (candidatura, baja) el contenedor **no se carga** y no se empuja
 *   `page_view`, y toda URL que se manda (`page_location`, `page_path`,
 *   `page_referrer`) pasa antes por `utils/analyticsUrlUtils.ts`. El script de
 *   arranque se pinta ya montado en cliente porque es ahí donde se conoce la
 *   URL real que hay que sanear; con `afterInteractive` no se retrasa nada.
 * @returns {JSX.Element | null} El script de arranque del contenedor, o `null` si no hay contenedor configurado
 */
export default function GoogleTagManager() {
  const containerId = ENV.GTM_ID;
  const isEnabled = isValidGtmContainerId(containerId);

  const pathname = usePathname();
  const isMounted = useIsMounted();
  const isExcluded = isAnalyticsExcludedPath(pathname);
  const isFirstView = useRef(true);
  const measuredTitle = useRef('');

  useEffect(() => {
    if (!isEnabled) return;

    return subscribeToCookieConsent(pushConsentUpdate);
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;

    /*
     * La URL saneada se fija en cada navegación, también en las excluidas: si el contenedor ya estaba
     * cargado, cualquier etiqueta que se dispare por su cuenta (p. ej. una de «cambio de historial») usa
     * esta y no `document.location`.
     */
    window.gtag?.('set', {
      page_location: sanitizeAnalyticsUrl(window.location.href),
      page_path: `${sanitizeAnalyticsPathname(pathname)}${sanitizeAnalyticsSearch(window.location.search)}`,
    });

    // En una página con token no se mide nada. Tampoco cuenta como «primera vista»: si el contenedor no se
    // cargó aquí, lo hará en la siguiente página normal, y de esa ya se encarga su etiqueta de configuración.
    if (isExcluded) return;

    if (isFirstView.current) {
      isFirstView.current = false;
      measuredTitle.current = document.title;
      return;
    }

    const pushPageView = () => {
      measuredTitle.current = document.title;

      pushToDataLayer({
        event: 'page_view',
        page_path: `${sanitizeAnalyticsPathname(pathname)}${sanitizeAnalyticsSearch(window.location.search)}`,
        page_location: sanitizeAnalyticsUrl(window.location.href),
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
  }, [isEnabled, isExcluded, pathname]);

  /*
   * Sin montar no se conoce la URL que sanear, y en una página con token no se carga. Desmontar el `<Script>`
   * al entrar en una de ellas no descarga el contenedor (ni hace falta: la URL ya va saneada), y volver a
   * montarlo al salir no lo ejecuta dos veces: `next/script` recuerda los `id` que ya cargó.
   */
  if (!isEnabled || !isMounted || isExcluded) return null;

  return (
    <Script
      id="gtm-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: buildGtmBootstrap(containerId, {
          location: sanitizeAnalyticsUrl(window.location.href),
          referrer: sanitizeAnalyticsUrl(document.referrer),
        }),
      }}
    />
  );
}
