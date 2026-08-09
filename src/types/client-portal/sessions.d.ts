/**
 * Sesión abierta del portal de cliente, tal y como la devuelve
 * `GET client/me/sessions`. El `id` es el identificador estable de la sesión
 * (`sid` del JWT), que sobrevive a las renovaciones del `accessToken`: por eso
 * un refresh silencioso no añade filas nuevas a este listado.
 * @interface PortalSession
 * @property {string} id - Identificador de la sesión
 * @property {string} [device] - Categoría de dispositivo ya resuelta por el backend
 * @property {string} [os] - Sistema operativo ya resuelto por el backend
 * @property {string} [browser] - Navegador ya resuelto por el backend
 * @property {string} [ip] - Dirección IP desde la que se inició la sesión
 * @property {string} createdAt - Fecha ISO de inicio de la sesión
 * @property {string} lastActivityAt - Fecha ISO de la última actividad registrada
 * @property {string} expiresAt - Fecha ISO de expiración de la sesión
 * @property {boolean} isCurrent - Si es la sesión desde la que se hace la petición
 */
export interface PortalSession {
  id: string;
  device?: string;
  os?: string;
  browser?: string;
  ip?: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

/**
 * Respuesta del latido de sesión (`GET client/me/session-status`).
 * @interface PortalSessionStatus
 * @property {boolean} revoked - `true` si la sesión ya no vale y hay que cerrarla en el navegador
 */
export interface PortalSessionStatus {
  revoked: boolean;
}
