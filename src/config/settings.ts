import type { AppLocale } from "@/config/locales";
import { SUPPORTED_LOCALES } from "@/config/locales";
import type { LanguageOption } from "@/types/ui/inputs/change-locale";
import type { ToastPosition } from "@/types/ui/toasts/toast";

/** Margen de seguridad (ms) antes de la caducidad real del `accessToken` para disparar su renovación en `authOptions.ts`, evitando que una petición en vuelo use un token que caduca a mitad de camino. */
export const AUTH_TOKEN_REFRESH_MARGIN_MS = 60_000;

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
