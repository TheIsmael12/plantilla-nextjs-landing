import type { AppLocale } from "@/config/locales";
import { SUPPORTED_LOCALES } from "@/config/locales";
import type { LanguageOption } from "@/types/ui/inputs/change-locale";
import type { ToastPosition } from "@/types/ui/toasts/toast";

/** Margen de seguridad (ms) antes de la caducidad real del `accessToken` para disparar su renovación en `authOptions.ts`, evitando que una petición en vuelo use un token que caduca a mitad de camino. */
export const AUTH_TOKEN_REFRESH_MARGIN_MS = 60_000;

/**
 * Cuánto se recuerda un `refreshToken` del portal de cliente ya canjeado,
 * junto con el par que salió de aquel canje (`actions/auth/client-portal-auth.ts`).
 * Cubre el hueco entre una renovación hecha en el servidor —donde no se puede
 * reescribir la cookie de sesión— y la primera lectura de `/api/auth/session`
 * que sí la actualiza; dentro de esa ventana, el token viejo que el navegador
 * sigue enviando se resuelve en memoria en vez de llegar al backend, que lo
 * leería como reutilización y revocaría la sesión entera.
 */
export const AUTH_REFRESH_GRACE_MS = 600_000;

/**
 * Cada cuánto vuelve `SessionProvider` a leer `/api/auth/session` (segundos).
 * No es solo frescura de datos: esa ruta es el **único** punto donde la
 * renovación del `accessToken` puede persistirse en la cookie de sesión,
 * porque es un route handler y puede escribir cabeceras. Sin este sondeo,
 * una sesión que solo se lee desde Server Components renueva el token en
 * memoria en cada petición pero nunca actualiza la cookie, y termina
 * cerrándose al caducar el `accessToken` (15 minutos con la configuración
 * por defecto de la API del portal).
 */
export const SESSION_REFETCH_INTERVAL_SECONDS = 300;

/**
 * Cada cuánto pregunta `usePortalSessionMonitor` si la sesión sigue viva
 * (`GET client/me/session-status`).
 *
 * La API responde 401 en cuanto la sesión se revoca, pero sin este latido el
 * navegador del cliente no se entera: seguiría mostrando el área privada hasta
 * que caduque el `accessToken`. Cerrar sesión desde otro dispositivo, o que un
 * administrador revoque el acceso, debe reflejarse en la pantalla abierta al
 * momento y no en los próximos 15 minutos.
 */
export const SESSION_HEARTBEAT_INTERVAL_MS = 15_000;

/** Milisegundos antes de que un toast (`lib/toast.ts`) se autocierre, si no se indica `duration` explícito. */
export const TOAST_DEFAULT_DURATION_MS = 4000;

/** Esquina/lado de la pantalla donde `Toaster` apila los toasts por defecto (montado una vez en `app/[locale]/layout.tsx`). */
export const TOAST_DEFAULT_POSITION: ToastPosition = "bottom-center";

/** Milisegundos de debounce antes de reflejar el texto de búsqueda en la URL (`useFilters`), para no disparar una navegación/refetch por cada pulsación. */
export const SEARCH_DEBOUNCE_MS = 400;

/** Longitud exacta del código exigido por `OtpCodeModal` (verificación 2FA/MFA de 6 dígitos). */
export const OTP_CODE_LENGTH = 6;

/** Nombre visible de cada idioma soportado, en su propio idioma (endónimo), tal y como lo usa `ChangeLocale`. */
const LANGUAGE_LABELS: Record<AppLocale, string> = {
  es: "Español",
  en: "English",
};

/** Ruta de la bandera de cada idioma soportado, dentro de `public/images/assets/flags/`. */
const LANGUAGE_FLAGS: Record<AppLocale, string> = {
  es: "/images/assets/flags/es.svg",
  en: "/images/assets/flags/en.svg",
};

/**
 * Catálogo de idiomas disponibles en {@link ChangeLocale}, construido a partir
 * de `SUPPORTED_LOCALES` (`config/locales.ts`) para no duplicar la lista de
 * locales soportados por la aplicación.
 */
export const LANGUAGES: LanguageOption[] = SUPPORTED_LOCALES.map((locale) => ({
  value: locale,
  label: LANGUAGE_LABELS[locale],
  flag: LANGUAGE_FLAGS[locale],
}));

/**
 * Versión de la información de privacidad que muestra el formulario de
 * contacto público.
 *
 * Viaja con cada envío y el backend la guarda en `Lead.privacyNoticeVersion`
 * y en el `LeadConsentLog`: es lo que permite acreditar **qué texto exacto**
 * se le mostró al interesado, no solo que se le mostró algo. **Al cambiar
 * el texto legal de `/privacy-policy` hay que subir esta versión**, o el
 * histórico dirá que aceptó un texto que nunca vio.
 */
export const PRIVACY_NOTICE_VERSION = "privacidad-2026-01";

/**
 * Nombre del campo trampa del formulario de contacto público: si llega con
 * contenido, el backend descarta el envío en silencio (responde igual que
 * un envío legítimo, para no delatar al bot que el filtro existe).
 */
export const HONEYPOT_FIELD_NAME = "website_url_confirm";
