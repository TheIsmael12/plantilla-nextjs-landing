"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CommunityInvitationsQuery,
  CommunityResidentsQuery,
  CreateResidentInvitationsDto,
  PortalResident,
  ResidentInvitation,
  UpdateResidentMembershipDto,
} from "@/types/client-portal/community";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

const CATALOG_LIMIT = 100;

/**
 * Construye el query string de un listado del portal, omitiendo los valores
 * vacíos/`undefined` para no mandar filtros sin valor al backend.
 * @param {Record<string, string | number | boolean | undefined>} params - Filtros activos
 * @returns {string} El query string, incluyendo el `?` inicial, o cadena vacía si no hay filtros
 */
function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const search = query.toString();
  return search ? `?${search}` : "";
}

/**
 * Página de vecinos de una comunidad
 * (`GET client/me/communities/:serviceId/residents`). El backend recorta el
 * DTO a propósito: nunca llegan teléfono, idioma, credenciales ni historial.
 * `search` filtra por nombre y correo.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CommunityResidentsQuery} [query] - Paginación, búsqueda y si incluir pertenencias revocadas
 * @returns {Promise<FetchResponse<PaginatedResult<PortalResident>>>} Página de vecinos con pertenencia a la comunidad
 */
export async function getCommunityResidentsPaginated(
  serviceId: string,
  query: CommunityResidentsQuery = {},
): Promise<FetchResponse<PaginatedResult<PortalResident>>> {
  return fetchDataToken<PaginatedResult<PortalResident>, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/residents${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Catálogo completo de vecinos de una comunidad, para poblar los selectores de
 * los formularios (p. ej. a quién se emite una credencial). El endpoint pagina,
 * así que pide una única página grande en vez de recorrerlas todas.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<PortalResident[]>>} Los vecinos de la comunidad
 */
export async function getCommunityResidents(
  serviceId: string,
): Promise<FetchResponse<PortalResident[]>> {
  const response = await getCommunityResidentsPaginated(serviceId, { limit: CATALOG_LIMIT });

  return { ...response, data: response.data?.items };
}

/**
 * Página de invitaciones de una comunidad
 * (`GET client/me/communities/:serviceId/invitations`). `search` filtra por
 * correo y nombre.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CommunityInvitationsQuery} [query] - Paginación, búsqueda y si incluir las ya cerradas
 * @returns {Promise<FetchResponse<PaginatedResult<ResidentInvitation>>>} Página de invitaciones, sin el token de aceptación
 */
export async function getCommunityInvitations(
  serviceId: string,
  query: CommunityInvitationsQuery = {},
): Promise<FetchResponse<PaginatedResult<ResidentInvitation>>> {
  return fetchDataToken<PaginatedResult<ResidentInvitation>, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/invitations${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Invita a uno o varios vecinos
 * (`POST client/me/communities/:serviceId/invitations`): devuelve una
 * invitación por cada correo enviado.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CreateResidentInvitationsDto} dto - Correos, unidad, rol y llaveros a conceder
 * @returns {Promise<FetchResponse<ResidentInvitation[]>>} Las invitaciones creadas
 */
export async function createCommunityInvitations(
  serviceId: string,
  dto: CreateResidentInvitationsDto,
): Promise<FetchResponse<ResidentInvitation[]>> {
  return fetchDataToken<ResidentInvitation[], CreateResidentInvitationsDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/invitations`,
    "POST",
    dto,
  );
}

/**
 * Reenvía una invitación pendiente
 * (`POST client/me/communities/invitations/:invitationId/resend`).
 * @param {string} invitationId - Invitación a reenviar
 * @returns {Promise<FetchResponse<ResidentInvitation>>} La invitación con su nueva caducidad
 */
export async function resendCommunityInvitation(
  invitationId: string,
): Promise<FetchResponse<ResidentInvitation>> {
  return fetchDataToken<ResidentInvitation, never>(
    `client/me/communities/invitations/${encodeURIComponent(invitationId)}/resend`,
    "POST",
  );
}

/**
 * Revoca una invitación pendiente
 * (`POST client/me/communities/invitations/:invitationId/revoke`).
 * @param {string} invitationId - Invitación a revocar
 * @returns {Promise<FetchResponse<ResidentInvitation>>} La invitación ya revocada
 */
export async function revokeCommunityInvitation(
  invitationId: string,
): Promise<FetchResponse<ResidentInvitation>> {
  return fetchDataToken<ResidentInvitation, never>(
    `client/me/communities/invitations/${encodeURIComponent(invitationId)}/revoke`,
    "POST",
  );
}

/**
 * Cambia la unidad o el rol de un vecino
 * (`PATCH client/me/communities/memberships/:membershipId`). El correo no se
 * puede cambiar desde el portal.
 * @param {string} membershipId - Pertenencia del vecino
 * @param {UpdateResidentMembershipDto} dto - Nueva unidad y/o nuevo rol
 * @returns {Promise<FetchResponse<PortalResident>>} El vecino ya actualizado
 */
export async function updateCommunityMembership(
  membershipId: string,
  dto: UpdateResidentMembershipDto,
): Promise<FetchResponse<PortalResident>> {
  return fetchDataToken<PortalResident, UpdateResidentMembershipDto>(
    `client/me/communities/memberships/${encodeURIComponent(membershipId)}`,
    "PATCH",
    dto,
  );
}

/**
 * Revoca la pertenencia de un vecino a la comunidad
 * (`DELETE client/me/communities/memberships/:membershipId`).
 * @param {string} membershipId - Pertenencia a revocar
 * @returns {Promise<FetchResponse<void>>} Respuesta vacía si se revocó correctamente
 */
export async function revokeCommunityMembership(
  membershipId: string,
): Promise<FetchResponse<void>> {
  return fetchDataToken<void, never>(
    `client/me/communities/memberships/${encodeURIComponent(membershipId)}`,
    "DELETE",
  );
}
