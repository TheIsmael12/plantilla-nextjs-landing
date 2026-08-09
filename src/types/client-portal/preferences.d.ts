/** Tema visual del portal, mismos valores que acepta el backend. */
export type PortalTheme = "light" | "dark";

/** Formato de hora preferido. */
export type PortalTimeFormat = "12h" | "24h";

/** Primer día de la semana al pintar calendarios. */
export type PortalFirstDayOfWeek = "MONDAY" | "SUNDAY";

/**
 * Preferencias del cliente, tal y como las devuelve `GET client/me/preferences`.
 * @interface PortalPreferences
 * @property {string} language - Idioma de la interfaz (`"es"`/`"en"`)
 * @property {string} timezone - Zona horaria IANA (p. ej. `"Europe/Madrid"`)
 * @property {string} dateFormat - Patrón de fecha (p. ej. `"DD/MM/YYYY"`)
 * @property {PortalTimeFormat} timeFormat - Formato de hora
 * @property {PortalFirstDayOfWeek} firstDayOfWeek - Primer día de la semana
 * @property {PortalTheme} theme - Tema visual guardado
 * @property {boolean} inAppNotifications - Si la campana debe avisar de notificaciones nuevas. Sin campo de email: los tipos de notificación del portal solo llevan canal `IN_APP` hoy.
 */
export interface PortalPreferences {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: PortalTimeFormat;
  firstDayOfWeek: PortalFirstDayOfWeek;
  theme: PortalTheme;
  inAppNotifications: boolean;
}

/** Cuerpo de `PATCH client/me/preferences`: actualización parcial, todos los campos opcionales. */
export type UpdatePortalPreferencesPayload = Partial<PortalPreferences>;
