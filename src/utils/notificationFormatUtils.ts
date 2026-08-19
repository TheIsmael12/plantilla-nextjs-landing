import esMessages from "@/i18n/locales/es/views.json";

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
 * Tipos de notificación para los que hay texto traducido.
 *
 * Sale de las propias traducciones y **no** de una lista escrita a mano. La lista a mano se quedó atrás en
 * cuanto la API empezó a emitir los avisos de incidencias: los textos estaban escritos, pero como el tipo
 * no figuraba aquí, la campana pintaba `INCIDENT_COMMENTED_PORTAL` en crudo y el aviso emergente ni salía.
 * Derivándola, añadir el texto es lo único que hay que hacer para que el tipo funcione.
 *
 * Se lee del castellano porque es el idioma en el que se escriben los textos primero; que `en` no se quede
 * atrás lo cubre el test de paridad de claves, no esta constante.
 */
const TRANSLATED_TYPES = new Set(
  Object.keys(esMessages.Views.ClientArea.Notifications.Types),
);

/**
 * Si sabemos escribir esta notificación con palabras propias.
 *
 * Lo usa el aviso emergente para decidir si sale: en la campana, una notificación de un tipo que nadie ha
 * traducido todavía se aguanta con su código en crudo —es una lista, y un `INCIDENT_COMMENT_ADDED` suelto es
 * feo pero informa de que algo ha pasado—. Un cartel que aparece encima de la pantalla, no: si no se puede
 * redactar, mejor que solo suba el contador de la campana.
 * @param {NotificationResponseDto} notification - La notificación recibida
 * @returns {boolean} `true` si trae texto propio o su tipo tiene traducción
 */
export function isPhrasableNotification(notification: NotificationResponseDto): boolean {
  return Boolean(notification.titleOverride) || TRANSLATED_TYPES.has(notification.type);
}

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
