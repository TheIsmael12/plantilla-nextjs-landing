import type { MouseEventHandler } from "react";

/**
 * Sesión activa de un usuario, tal y como la devuelve `GET /me/sessions`.
 * @interface UserSession
 * @property {string} id - Identificador único de la sesión
 * @property {string} [device] - Categoría de dispositivo ya resuelta por el backend (p. ej. "Desktop"/"Mobile"/"Tablet")
 * @property {string} [os] - Sistema operativo ya resuelto por el backend
 * @property {string} [browser] - Navegador ya resuelto por el backend
 * @property {string} [ip] - Dirección IP desde la que se inició la sesión
 * @property {string} [status] - Estado de la sesión (p. ej. "ACTIVE"). Opcional: el portal de cliente no lo devuelve, porque allí una sesión listada es por definición una sesión activa
 * @property {string} createdAt - Fecha ISO de creación de la sesión
 * @property {string} lastActivityAt - Fecha ISO de la última actividad registrada
 * @property {string} expiresAt - Fecha ISO de expiración de la sesión
 * @property {boolean} isCurrent - Si es la sesión desde la que se hace la petición actual
 */
export interface UserSession {
  id: string;
  device?: string;
  os?: string;
  browser?: string;
  ip?: string;
  status?: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Props de {@link SessionCard}.
 * @interface SessionCardProps
 * @property {UserSession} session - Sesión a representar (forma devuelta por `GET /me/sessions`)
 * @property {MouseEventHandler<HTMLButtonElement>} [onRevoke] - Handler de click del botón de revocar; si se omite (o la sesión es la actual) no se muestra el botón
 * @property {boolean} [isRevoking] - Muestra el estado de carga del botón de revocar mientras la revocación está en curso
 */
export interface SessionCardProps {
  session: UserSession;
  onRevoke?: MouseEventHandler<HTMLButtonElement>;
  isRevoking?: boolean;
}
