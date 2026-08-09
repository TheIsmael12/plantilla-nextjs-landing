/**
 * Datos de `GET client/me` (`PortalClientMeResponseDto`): perfil del cliente
 * del portal, de solo lectura — el backend no expone ningún `PATCH`/`PUT`
 * para editar estos campos desde el portal, los gestiona el backoffice.
 * @interface PortalClientMeResponseData
 * @property {string} id - Identificador del cliente
 * @property {string} clientCode - Código de cliente (`CLI-000001`)
 * @property {string} name - Nombre o razón social del cliente
 * @property {string} [email] - Email de contacto, si tiene uno registrado
 * @property {string} [phone] - Teléfono de contacto, si tiene uno registrado
 */
export interface PortalClientMeResponseData {
  id: string;
  clientCode: string;
  name: string;
  email?: string;
  phone?: string;
}
