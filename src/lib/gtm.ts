import { GTM_CONSENT_WAIT_FOR_UPDATE_MS } from "@/config/settings";
import { COOKIE_CONSENT_STORAGE_KEY, type CookieConsentCategories } from "@/lib/cookieConsent";

/**
 * Capa de datos de Google Tag Manager y traducción del banner de cookies al
 * Consent Mode v2 de Google.
 *
 * El contenedor se carga siempre, pero arranca con todas las señales
 * denegadas salvo `security_storage`: hasta que llega un `consent update`,
 * GTM no escribe cookies ni manda identificadores, solo pings sin datos
 * personales. Es la pauta que Google exige para el EEE y la que permite que
 * el contenedor esté listo antes de que el visitante decida, en vez de
 * inyectar el script a posteriori y perder la primera página.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Valor que admite cada señal de consentimiento de Google. */
export type ConsentSignal = "granted" | "denied";

/** Las siete señales del Consent Mode v2 que entiende el contenedor. */
export type GoogleConsentState = Record<
  | "ad_storage"
  | "ad_user_data"
  | "ad_personalization"
  | "analytics_storage"
  | "functionality_storage"
  | "personalization_storage"
  | "security_storage",
  ConsentSignal
>;

/**
 * Qué decide cada señal de Google. Cada una sigue una categoría del banner,
 * o va fijada:
 *
 * - `"granted"` — siempre concedida. `security_storage` cubre cosas como la
 *   prevención de fraude: no es opcional y no requiere consentimiento.
 * - `"denied"` — siempre denegada, porque **no hay categoría que la
 *   gobierne**. Es el caso de las tres señales de publicidad: el banner ya no
 *   pregunta por marketing (ver `lib/cookieConsent.ts`), así que nadie puede
 *   concederlas y ninguna etiqueta de anuncios puede escribir nada. El día que
 *   haya una integración de publicidad real, vuelven a apuntar a la categoría
 *   que se reintroduzca.
 *
 * Es la **única** definición del mapeo: la usan tanto la traducción en
 * cliente ({@link toGoogleConsentState}) como el script de arranque
 * ({@link buildGtmBootstrap}), para que no puedan divergir.
 */
export const CONSENT_SIGNAL_RULE: Record<
  keyof GoogleConsentState,
  keyof CookieConsentCategories | ConsentSignal
> = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "analytics",
  functionality_storage: "functional",
  personalization_storage: "functional",
  security_storage: "granted",
};

/**
 * Distingue una señal fijada de una que sigue al banner.
 * @param {keyof CookieConsentCategories | ConsentSignal} rule - Valor de {@link CONSENT_SIGNAL_RULE}
 * @returns {boolean} `true` si la señal va fijada y no depende de lo que elija el visitante
 */
function isFixedSignal(rule: keyof CookieConsentCategories | ConsentSignal): rule is ConsentSignal {
  return rule === "granted" || rule === "denied";
}

/** Formato de un identificador de contenedor válido (`GTM-` y su código). */
const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/**
 * Comprueba que el identificador de contenedor tiene la forma esperada.
 *
 * No es cosmético: ese valor se interpola en un script en línea, así que un
 * valor con formato raro (una variable de entorno mal copiada) no debe
 * llegar nunca al HTML.
 * @param {string} containerId - Valor de `NEXT_PUBLIC_GTM_ID`
 * @returns {boolean} `true` si es un identificador de contenedor utilizable
 */
export function isValidGtmContainerId(containerId: string): boolean {
  return GTM_CONTAINER_ID_PATTERN.test(containerId);
}

/**
 * Traduce las categorías del banner a las señales de Google.
 * @param {CookieConsentCategories} consent - Lo que el visitante ha aceptado
 * @returns {GoogleConsentState} Las siete señales, concedidas o denegadas
 */
export function toGoogleConsentState(consent: CookieConsentCategories): GoogleConsentState {
  const entries = Object.entries(CONSENT_SIGNAL_RULE).map(([signal, rule]) => [
    signal,
    isFixedSignal(rule) ? rule : consent[rule] ? "granted" : "denied",
  ]);

  return Object.fromEntries(entries) as GoogleConsentState;
}

/**
 * Devuelve el `gtag` global, creándolo si el script de arranque todavía no
 * ha corrido. Empuja el objeto `arguments` —y no un array— porque es lo que
 * la API de consentimiento de Google sabe interpretar.
 * @returns {(...args: unknown[]) => void} La función `gtag` de la página
 */
function ensureGtag(): (...args: unknown[]) => void {
  window.dataLayer = window.dataLayer ?? [];

  if (!window.gtag) {
    window.gtag = function gtag() {
      (window.dataLayer ??= []).push(arguments);
    };
  }

  return window.gtag;
}

/**
 * Empuja un evento a la capa de datos, para poder dispararlo como
 * activador en el contenedor.
 * @param {Record<string, unknown>} event - Objeto del evento, con su clave `event`
 * @returns {void}
 */
export function pushToDataLayer(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  (window.dataLayer ??= []).push(event);
}

/**
 * Comunica a Google una decisión nueva del banner y deja constancia en la
 * capa de datos, por si el contenedor quiere activar algo justo al aceptar.
 * @param {CookieConsentCategories} consent - Las preferencias recién guardadas
 * @returns {void}
 */
export function pushConsentUpdate(consent: CookieConsentCategories): void {
  if (typeof window === "undefined") return;

  const consentState = toGoogleConsentState(consent);

  ensureGtag()("consent", "update", consentState);
  pushToDataLayer({ event: "cookie_consent_update", consent: consentState });
}

/**
 * Anuncia un lead conseguido. Es el evento que el contenedor convierte en
 * conversión de GA4 y, el día que haya campañas, en conversión de Google Ads.
 *
 * Solo debe llamarse cuando el backend ha confirmado el envío, y solo si de
 * verdad hay un lead detrás: quien llame se tiene que asegurar de lo segundo,
 * porque esta función no puede saberlo.
 * @param {string} formId - Qué formulario lo originó (`form_id` en el contenedor)
 * @param {string} leadType - Qué clase de solicitud es (`lead_type` en el contenedor)
 * @returns {void}
 */
export function pushLeadGenerated(formId: string, leadType: string): void {
  pushToDataLayer({ event: "generate_lead", form_id: formId, lead_type: leadType });
}

/**
 * Script de arranque del contenedor, para inyectar en línea.
 *
 * Hace tres cosas **en este orden**, que es lo que obliga a que sea un solo
 * script y no varios: prepara la capa de datos, declara el consentimiento
 * por defecto y solo entonces carga `gtm.js`. Si el contenedor cargara
 * primero, las etiquetas se resolverían sin saber qué está permitido.
 *
 * El consentimiento por defecto no es siempre "denegado": lee la decisión ya
 * guardada en `localStorage`, así que quien ya aceptó en una visita anterior
 * se mide desde la primera página, sin esperar a `wait_for_update`. Se lee
 * aquí, en el script, y no en un efecto de React, porque un efecto correría
 * después y su `update` podría quedar por detrás de este `default` en la
 * cola de la capa de datos, dejando el consentimiento en denegado.
 * @param {string} containerId - Identificador del contenedor (`GTM-XXXXXXX`)
 * @returns {string} El código del script de arranque
 */
export function buildGtmBootstrap(containerId: string): string {
  return `(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w.gtag = w.gtag || function () { w[l].push(arguments); };

  var stored = null;
  try { stored = JSON.parse(w.localStorage.getItem(${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)}) || 'null'); } catch (e) { stored = null; }

  var rules = ${JSON.stringify(CONSENT_SIGNAL_RULE)};
  var consent = { wait_for_update: ${GTM_CONSENT_WAIT_FOR_UPDATE_MS} };
  for (var signal in rules) {
    var rule = rules[signal];
    var fixed = rule === 'granted' || rule === 'denied';
    consent[signal] = fixed ? rule : ((stored && stored[rule]) ? 'granted' : 'denied');
  }

  w.gtag('consent', 'default', consent);
  w.gtag('set', 'ads_data_redaction', true);
  w.gtag('set', 'url_passthrough', true);

  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  var f = d.getElementsByTagName(s)[0];
  var j = d.createElement(s);
  var dl = l !== 'dataLayer' ? '&l=' + l : '';
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
  if (f && f.parentNode) { f.parentNode.insertBefore(j, f); } else { d.head.appendChild(j); }
})(window, document, 'script', 'dataLayer', ${JSON.stringify(containerId)});`;
}
