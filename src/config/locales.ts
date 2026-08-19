/**
 * Locales soportados por la aplicación, usados por `i18n/routing.ts` para
 * generar las rutas con prefijo `/[locale]/...`.
 * @typedef {("es"|"en")} AppLocale
 */
export type AppLocale = "es" | "en";

/** Catálogo de locales soportados, en el orden en que se muestran en `ChangeLocale`. */
export const SUPPORTED_LOCALES: AppLocale[] = ["es", "en"];

/**
 * Locale servido sin prefijo en la URL (`localePrefix: "as-needed"` en
 * `i18n/routing.ts`/`proxy.ts`) y usado como fallback cuando no hay
 * preferencia guardada (cookie) ni negociación de `Accept-Language` posible.
 * Configurable por despliegue vía `NEXT_PUBLIC_FALLBACK_LOCALE`; si no está
 * definida o no es un locale soportado, cae en `"es"`.
 */
export const DEFAULT_LOCALE: AppLocale = isSupportedLocale(
  process.env.NEXT_PUBLIC_FALLBACK_LOCALE,
)
  ? process.env.NEXT_PUBLIC_FALLBACK_LOCALE
  : "es";

/**
 * Comprueba si un valor arbitrario (p. ej. `preferences.language` del JWT) es
 * uno de los locales soportados por la aplicación.
 * @param {string | undefined} value - Valor a comprobar
 * @returns {boolean} `true` si `value` es un {@link AppLocale} soportado
 */
export function isSupportedLocale(value: string | undefined): value is AppLocale {
  return !!value && SUPPORTED_LOCALES.includes(value as AppLocale);
}

/**
 * Nombre de la cookie donde next-intl guarda el idioma elegido.
 *
 * El nombre lo fija next-intl (`NEXT_LOCALE`); aquí está para que el proxy, `routingUtils` y
 * `i18n/request` se refieran todos a la misma y no lo lleven escrito a mano cada uno.
 */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";
