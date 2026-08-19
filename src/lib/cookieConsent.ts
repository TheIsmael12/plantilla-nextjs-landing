/**
 * Estado de consentimiento de cookies, compartido por el banner que lo pide
 * ({@link CookieConsentController}) y por quien lo consume (el arranque de
 * Google Tag Manager). Vive aquí, y no dentro del banner, porque el
 * contenedor de GTM tiene que poder leer la decisión ya guardada **antes**
 * de que el banner se monte: si cada uno tuviera su propia copia de la clave
 * y del formato, un cambio en uno dejaría al otro leyendo un hueco.
 */

/**
 * Categorías de cookies que el visitante acepta o rechaza por separado en el banner.
 *
 * **Sin categoría `marketing`**: hoy no hay instalado ningún script de
 * publicidad (Google Ads, Meta Pixel...), y un interruptor sin nada detrás
 * obligaba al texto legal a describir proveedores que no existen en el sitio.
 * Cuando haya una integración de publicidad real se reintroduce junto con
 * ella, y con ella vuelven a colgar las señales `ad_*` de `lib/gtm.ts`, que
 * mientras tanto van denegadas siempre.
 */
export interface CookieConsentCategories {
  analytics: boolean;
  functional: boolean;
}

/** Preferencias de cookies aceptadas por el usuario, con la fecha del consentimiento. */
export interface CookieConsentData extends CookieConsentCategories {
  timestamp: number;
}

/** Clave de `localStorage` donde se persiste la decisión del visitante. */
export const COOKIE_CONSENT_STORAGE_KEY = "na:cookie-consent";

/** Evento que reabre el banner desde cualquier punto de la app (p. ej. el enlace del pie). */
export const OPEN_COOKIE_CONSENT_EVENT = "na:open-cookie-consent";

/** Evento que se emite, con las preferencias nuevas en `detail`, cada vez que el visitante las guarda. */
export const COOKIE_CONSENT_CHANGED_EVENT = "na:cookie-consent-changed";

/** Punto de partida mientras no haya decisión: nada opcional aceptado. */
export const DENIED_CONSENT: CookieConsentCategories = {
  analytics: false,
  functional: false,
};

/**
 * Lee las preferencias guardadas.
 * @returns {CookieConsentData | null} Las preferencias, o `null` si el visitante todavía no ha decidido (o el almacenamiento no está disponible)
 */
export function readCookieConsent(): CookieConsentData | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CookieConsentData) : null;
  } catch {
    return null;
  }
}

/**
 * Persiste las preferencias y avisa a quien las esté escuchando.
 *
 * El evento se emite aunque `localStorage` falle (modo privado, cuota): la
 * decisión debe aplicarse en esta visita aunque no sobreviva a la siguiente.
 * @param {CookieConsentData} data - Las preferencias elegidas, con su marca de tiempo
 * @returns {void}
 */
export function writeCookieConsent(data: CookieConsentData): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Sin almacenamiento persistente, el consentimiento vale solo para esta visita.
  }

  window.dispatchEvent(
    new CustomEvent<CookieConsentData>(COOKIE_CONSENT_CHANGED_EVENT, { detail: data }),
  );
}

/**
 * Escucha los cambios de consentimiento, tanto los de esta pestaña como los
 * hechos en otra pestaña del mismo navegador (evento `storage`), para que
 * aceptar en una no deje a las demás con el consentimiento viejo.
 * @param {(consent: CookieConsentData) => void} listener - Se llama con las preferencias nuevas
 * @returns {() => void} Función para dejar de escuchar
 */
export function subscribeToCookieConsent(
  listener: (consent: CookieConsentData) => void,
): () => void {
  const handleLocalChange = (event: Event) => {
    const { detail } = event as CustomEvent<CookieConsentData>;
    if (detail) listener(detail);
  };

  const handleOtherTab = (event: StorageEvent) => {
    if (event.key !== COOKIE_CONSENT_STORAGE_KEY) return;
    const consent = readCookieConsent();
    if (consent) listener(consent);
  };

  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleLocalChange);
  window.addEventListener("storage", handleOtherTab);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleLocalChange);
    window.removeEventListener("storage", handleOtherTab);
  };
}
