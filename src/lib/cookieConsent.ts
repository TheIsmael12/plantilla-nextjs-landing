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

/**
 * Punto de partida mientras no haya decisión.
 *
 * `functional: true` porque, por decisión del sitio, las cookies funcionales
 * (p. ej. el mapa de contacto) se tratan como **necesarias/obligatorias**: no
 * se pueden rechazar y van activas desde el primer momento. Solo la analítica
 * queda por decidir, y arranca denegada.
 */
export const DENIED_CONSENT: CookieConsentCategories = {
  analytics: false,
  functional: true,
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
 * La decisión vigente, cacheada, para poder devolver **siempre la misma referencia** mientras no
 * cambie.
 *
 * `readCookieConsent` interpreta el JSON en cada llamada, así que devuelve un objeto nuevo cada vez.
 * Para una lectura suelta da igual, pero `useSyncExternalStore` compara la referencia para decidir si
 * repintar: con un objeto nuevo en cada lectura entra en un bucle infinito y React corta con «The
 * result of getSnapshot should be cached».
 *
 * `undefined` significa «todavía no se ha leído del almacenamiento»; `null`, «leído y no hay
 * decisión». Son dos estados distintos y por eso no vale con uno.
 */
let cachedConsent: CookieConsentData | null | undefined;

/**
 * La decisión vigente, con referencia estable entre lecturas.
 *
 * Pensada para `useSyncExternalStore` (ver `useCookieConsent`). Quien solo quiera leer una vez puede
 * seguir usando {@link readCookieConsent}.
 * @returns {CookieConsentData | null} Las preferencias, o `null` si el visitante no ha decidido
 */
export function getCookieConsentSnapshot(): CookieConsentData | null {
  if (cachedConsent === undefined) cachedConsent = readCookieConsent();
  return cachedConsent;
}

/**
 * Lo que se sirve desde el servidor: no hay decisión.
 *
 * Tiene que ser una función aparte y devolver algo estable, porque en el servidor no hay
 * `localStorage` y rellenar allí con otra cosa daría un HTML distinto al que pinta el navegador —un
 * desajuste de hidratación—.
 * @returns {null} Siempre `null`
 */
export function getServerCookieConsentSnapshot(): null {
  return null;
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

  /*
   * La caché se actualiza aquí y no releyendo el almacenamiento, precisamente por el caso de arriba:
   * si el `setItem` falló, releer devolvería la decisión anterior y la nueva no se aplicaría en esta
   * visita, que es justo lo que el `catch` quiere evitar.
   */
  cachedConsent = data;

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
    // La decisión llega de fuera de esta pestaña, así que la caché se refresca aquí: quien lea el
    // snapshot después del aviso tiene que ver lo que se aceptó en la otra.
    cachedConsent = consent;

    if (consent) listener(consent);
  };

  window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleLocalChange);
  window.addEventListener("storage", handleOtherTab);

  return () => {
    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, handleLocalChange);
    window.removeEventListener("storage", handleOtherTab);
  };
}
