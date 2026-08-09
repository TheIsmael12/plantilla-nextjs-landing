import type { BadgeVariant } from "@/types/ui/buttons/badge";
import type {
  NotificationResponseDto,
  NotificationSeverity,
} from "@/types/client-portal/notifications";

/**
 * Color de la insignia de cada severidad, con la misma paleta semántica que
 * usan el resto de listados del portal.
 */
export const NOTIFICATION_SEVERITY_VARIANTS: Record<NotificationSeverity, BadgeVariant> = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  CRITICAL: "danger",
};

/**
 * Tipos de notificación para los que hay texto traducido. El backend puede
 * emitir otros: los que no estén aquí caen en el texto de respaldo en vez de
 * reventar la traducción con una clave inexistente.
 */
const TRANSLATED_TYPES = new Set([
  "QUOTE_SENT",
  "QUOTE_EXPIRING_SOON",
  "INVOICE_ISSUED",
  "INVOICE_OVERDUE_PORTAL",
  "INVOICE_PAID_PORTAL",
]);

/**
 * Valores de `data` que next-intl puede interpolar. El backend manda
 * `Record<string, unknown>`, y pasar un objeto anidado como parámetro haría
 * fallar el formateo, así que solo sobreviven los primitivos.
 * @param {Record<string, unknown>} data - Parámetros de la notificación
 * @returns {Record<string, string | number>} Los parámetros que se pueden interpolar
 */
function toTranslationValues(
  data: Record<string, unknown>,
): Record<string, string | number> {
  const values: Record<string, string | number> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string" || typeof value === "number") values[key] = value;
  }

  return values;
}

/**
 * Título y cuerpo ya legibles de una notificación.
 *
 * Prioridad: el texto que venga escrito del backend (`titleOverride`/
 * `bodyOverride`, propio de los avisos manuales), después la traducción por
 * `type` interpolando `data`, y como último recurso el propio `type` en
 * crudo. Ese respaldo es deliberado: un tipo nuevo en el backend tiene que
 * aparecer en la campana aunque nadie haya escrito todavía su traducción, en
 * vez de romper el listado entero.
 * La comprobación se hace contra una lista propia y no contra `t.has()`
 * porque este último solo acepta claves conocidas en tiempo de compilación, y
 * aquí la clave se compone con un `type` que llega del backend.
 * @param {NotificationResponseDto} notification - La notificación a formatear
 * @param {(key: string, values?: Record<string, string | number>) => string} translate - Traductor de `Views.ClientArea.Notifications`
 * @returns {{title: string, body: string | null}} Textos listos para pintar
 */
export function resolveNotificationText(
  notification: NotificationResponseDto,
  translate: (key: string, values?: Record<string, string | number>) => string,
): { title: string; body: string | null } {
  if (notification.titleOverride) {
    return { title: notification.titleOverride, body: notification.bodyOverride };
  }

  if (!TRANSLATED_TYPES.has(notification.type)) {
    return { title: notification.type, body: notification.bodyOverride };
  }

  const values = toTranslationValues(notification.data);

  return {
    title: translate(`Types.${notification.type}.title`, values),
    body: translate(`Types.${notification.type}.body`, values),
  };
}
