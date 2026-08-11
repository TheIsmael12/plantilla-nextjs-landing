import type {
  CommunityLockStatus,
  IncidentPriority,
  IncidentStatus,
  KeyMatrixCellState,
  LockAccessResult,
  LockCredentialStatus,
  ResidentInvitationStatus,
  ResidentMembershipStatus,
} from "@/types/client-portal/community";
import type { BadgeVariant } from "@/types/ui/buttons/badge";

/** Variante de `Badge` por estado de pertenencia de un vecino. */
export const MEMBERSHIP_STATUS_VARIANTS: Record<ResidentMembershipStatus, BadgeVariant> = {
  ACTIVE: "success",
  REVOKED: "danger",
};

/** Variante de `Badge` por estado de una invitación. */
export const INVITATION_STATUS_VARIANTS: Record<ResidentInvitationStatus, BadgeVariant> = {
  PENDING: "pending",
  ACCEPTED: "success",
  REVOKED: "danger",
  EXPIRED: "neutral",
};

/** Variante de `Badge` por estado operativo de una cerradura. */
export const LOCK_STATUS_VARIANTS: Record<CommunityLockStatus, BadgeVariant> = {
  ACTIVE: "success",
  OFFLINE: "warning",
  MAINTENANCE: "info",
  RETIRED: "neutral",
};

/**
 * Variante de `Badge` por estado de una credencial. `PARTIALLY_SYNCED` y
 * `PENDING_REVOKE` son de aviso a propósito: la credencial todavía abre en
 * alguna puerta aunque el usuario crea que ya no.
 */
export const CREDENTIAL_STATUS_VARIANTS: Record<LockCredentialStatus, BadgeVariant> = {
  PENDING_SYNC: "pending",
  ACTIVE: "success",
  PARTIALLY_SYNCED: "warning",
  PENDING_REVOKE: "warning",
  REVOKED: "danger",
  EXPIRED: "neutral",
};

/** Variante de `Badge` por prioridad de una incidencia. */
export const INCIDENT_PRIORITY_VARIANTS: Record<IncidentPriority, BadgeVariant> = {
  LOW: "neutral",
  NORMAL: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

/** Variante de `Badge` por estado de una incidencia. */
/**
 * Los estados de una incidencia en el orden de su ciclo de vida, de abierta a cerrada.
 *
 * Existe como lista y no se deduce de las claves de {@link INCIDENT_STATUS_VARIANTS} porque el orden de las
 * claves de un objeto es una casualidad del sitio donde se escribieron: hoy coincide, y el día que alguien
 * ordene ese objeto alfabéticamente —algo que nadie consideraría un cambio de comportamiento— el reparto por
 * estado del panel empezaría a contar la historia al revés, sin que fallara nada.
 */
export const INCIDENT_STATUS_ORDER: IncidentStatus[] = [
  "NUEVA",
  "EN_CURSO",
  "ESPERANDO_TERCERO",
  "RESUELTA",
  "CERRADA",
  "RECHAZADA",
];

export const INCIDENT_STATUS_VARIANTS: Record<IncidentStatus, BadgeVariant> = {
  NUEVA: "info",
  EN_CURSO: "pending",
  ESPERANDO_TERCERO: "warning",
  RESUELTA: "success",
  CERRADA: "neutral",
  RECHAZADA: "danger",
};

/** Variante de `Badge` por resultado de un intento de acceso. */
export const ACCESS_RESULT_VARIANTS: Record<LockAccessResult, BadgeVariant> = {
  GRANTED: "success",
  GRANTED_BYPASS: "warning",
  GRANTED_RELEASED: "info",
  DENIED_UNKNOWN: "danger",
  DENIED_EXPIRED: "danger",
  DENIED_LOCK_SCHEDULE: "neutral",
  DENIED_CREDENTIAL_SCHEDULE: "neutral",
  DENIED_LOCK_DISABLED: "danger",
  ERROR: "error",
};

/** Modificador BEM de la celda de la matriz de llaves, por estado. */
export const KEY_MATRIX_STATE_MODIFIERS: Record<KeyMatrixCellState, string> = {
  GRANTED: "granted",
  PENDING: "pending",
  EXPIRED: "expired",
  OUT_OF_SCHEDULE: "out-of-schedule",
  NONE: "none",
};

/**
 * Glifo de cada estado de la matriz de llaves. El color por sí solo no
 * distingue los estados para quien no lo percibe, así que cada celda lleva
 * además un símbolo propio.
 */
export const KEY_MATRIX_STATE_GLYPHS: Record<KeyMatrixCellState, string> = {
  GRANTED: "✓",
  PENDING: "…",
  EXPIRED: "!",
  OUT_OF_SCHEDULE: "◷",
  NONE: "–",
};

/**
 * Formatea una fecha con su hora en el locale activo. Los listados de accesos
 * y credenciales necesitan la hora, que `formatBillingDate` omite.
 * @param {string | null | undefined} value - Fecha en ISO 8601
 * @param {string} locale - Locale activo
 * @param {string} fallback - Texto a devolver cuando no hay fecha
 * @returns {string} La fecha y hora formateadas, o `fallback` si no hay valor
 */
export function formatCommunityDateTime(
  value: string | null | undefined,
  locale: string,
  fallback: string,
): string {
  if (!value) return fallback;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * Convierte un `Date` al valor que espera un `<input type="datetime-local">`,
 * que exige hora local sin zona (`YYYY-MM-DDTHH:mm`) y no acepta un ISO en UTC.
 * @param {Date} date - Momento a representar
 * @returns {string} El valor listo para el input
 */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
