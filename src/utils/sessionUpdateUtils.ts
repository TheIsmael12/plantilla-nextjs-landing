import { isSupportedLocale } from "@/config/locales";

import type {
  PortalFirstDayOfWeek,
  PortalPreferences,
  PortalTheme,
  PortalTimeFormat,
} from "@/types/client-portal/preferences";

/*
 * Lo que `useSession().update(data)` puede cambiar del JWT de sesión, y nada más.
 *
 * `update()` es una llamada `POST /api/auth/session` que puede hacer **cualquier script del navegador** con
 * el cuerpo que quiera. El callback `jwt` hacía `{ ...token, ...session }` con ese cuerpo, así que un cliente
 * podía reescribir su propio token: `id`, `clientCode`, `accessTokenExpires`, `backendTokens`... Los datos de
 * identidad que pinta la app (y los que el servidor usa para decidir si un 401 es revocación, ver
 * `getPortalSessionStatus`) quedaban a merced del navegador.
 *
 * Hoy lo único que la app manda por `update()` son las preferencias recién guardadas (`PortalThemeSection`,
 * `PortalLocaleSection`, `PortalDateTimeSection`), para que el tema, el idioma y los formatos se apliquen sin
 * volver a identificarse. Así que eso es lo único que se acepta, campo a campo y con su formato: lo que no
 * cuadre se descarta en silencio y se conserva lo que ya había.
 */

const THEMES: readonly PortalTheme[] = ["light", "dark"];
const TIME_FORMATS: readonly PortalTimeFormat[] = ["12h", "24h"];
const FIRST_DAYS_OF_WEEK: readonly PortalFirstDayOfWeek[] = ["MONDAY", "SUNDAY"];

/**
 * Patrón de fecha admitido: solo los tokens de día/mes/año y separadores habituales (`DD/MM/YYYY`,
 * `YYYY-MM-DD`, `MM.DD.YYYY`...). Es un texto que acaba en el formateador de fechas de toda la app; con el
 * límite de longitud y de caracteres no cabe nada que no sea un patrón.
 */
const DATE_FORMAT_PATTERN = /^[DMY]{1,4}([/.\- ][DMY]{1,4}){2}$/;

/**
 * `true` si `value` es una zona horaria IANA que el runtime reconoce (`Europe/Madrid`, `UTC`...).
 * @param {unknown} value - Valor recibido
 * @returns {boolean} Si es una zona horaria válida
 */
function isValidTimezone(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) return false;

  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/**
 * `true` si `value` es un objeto plano (no `null`, no array).
 * @param {unknown} value - Valor recibido
 * @returns {boolean} Si es un objeto plano
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Aplica sobre las preferencias actuales solo los campos válidos de las recibidas.
 * @param {PortalPreferences | null} current - Preferencias que ya tiene el token
 * @param {Record<string, unknown>} incoming - Preferencias recibidas del navegador
 * @returns {PortalPreferences | null} Las preferencias resultantes; `null` si no había ni llega nada completo
 */
function mergePreferences(
  current: PortalPreferences | null,
  incoming: Record<string, unknown>,
): PortalPreferences | null {
  const accepted: Partial<PortalPreferences> = {};

  if (typeof incoming.language === "string" && isSupportedLocale(incoming.language)) {
    accepted.language = incoming.language;
  }
  if (isValidTimezone(incoming.timezone)) accepted.timezone = incoming.timezone;
  if (typeof incoming.dateFormat === "string" && DATE_FORMAT_PATTERN.test(incoming.dateFormat)) {
    accepted.dateFormat = incoming.dateFormat;
  }
  if (TIME_FORMATS.includes(incoming.timeFormat as PortalTimeFormat)) {
    accepted.timeFormat = incoming.timeFormat as PortalTimeFormat;
  }
  if (FIRST_DAYS_OF_WEEK.includes(incoming.firstDayOfWeek as PortalFirstDayOfWeek)) {
    accepted.firstDayOfWeek = incoming.firstDayOfWeek as PortalFirstDayOfWeek;
  }
  if (THEMES.includes(incoming.theme as PortalTheme)) {
    accepted.theme = incoming.theme as PortalTheme;
  }
  if (typeof incoming.inAppNotifications === "boolean") {
    accepted.inAppNotifications = incoming.inAppNotifications;
  }

  if (current) return { ...current, ...accepted };

  /*
   * Sin preferencias previas (el login no pudo leerlas) solo se aceptan si llegan completas: un objeto a
   * medias rompería a quien lee `preferences.theme` dando por hecho que están todas.
   */
  const complete = [
    "language",
    "timezone",
    "dateFormat",
    "timeFormat",
    "firstDayOfWeek",
    "theme",
    "inAppNotifications",
  ].every((key) => key in accepted);

  return complete ? (accepted as PortalPreferences) : null;
}

/**
 * Lo que `update(data)` puede cambiar del JWT de sesión: hoy, solo `preferences`, validadas campo a campo.
 * Cualquier otra clave del cuerpo (identidad, caducidad, tokens) se ignora.
 * @param {PortalPreferences | null} currentPreferences - Preferencias que ya tiene el token
 * @param {unknown} data - Cuerpo recibido en `update(data)`, sin validar
 * @returns {{ preferences: PortalPreferences | null } | null} Los campos a aplicar al token, o `null` si no hay nada válido
 */
export function sanitizeSessionUpdate(
  currentPreferences: PortalPreferences | null,
  data: unknown,
): { preferences: PortalPreferences | null } | null {
  if (!isPlainObject(data) || !isPlainObject(data.preferences)) return null;

  return { preferences: mergePreferences(currentPreferences, data.preferences) };
}
