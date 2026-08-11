"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  PortalCommunity,
  PortalCommunityAnnouncement,
  PortalCommunityConfig,
  UpdatePortalCommunityConfigDto,
} from "@/types/client-portal/community";
import type { FetchResponse } from "@/types/responses";

/**
 * Lista las comunidades activas del cliente autenticado
 * (`GET client/me/communities`). Un array vacío significa que el cliente no
 * tiene contratada la app de comunidad en ningún servicio, y es lo que decide
 * si la sección existe siquiera en la navegación.
 * @returns {Promise<FetchResponse<PortalCommunity[]>>} Las comunidades del cliente, sin paginar
 */
export async function getClientCommunities(): Promise<FetchResponse<PortalCommunity[]>> {
  return fetchDataToken<PortalCommunity[], never>("client/me/communities", "GET");
}

/**
 * Obtiene la configuración de una comunidad
 * (`GET client/me/communities/:serviceId/config`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<PortalCommunityConfig>>} La configuración, o `status: 404` si el servicio no tiene la app activa
 */
export async function getCommunityConfig(
  serviceId: string,
): Promise<FetchResponse<PortalCommunityConfig>> {
  return fetchDataToken<PortalCommunityConfig, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/config`,
    "GET",
  );
}

/**
 * Los avisos del tablón de una comunidad
 * (`GET client/me/communities/:serviceId/announcements`).
 *
 * Vienen **todos**, no solo los que un vecino ve hoy: cada uno trae `isVisible`, así que la portada puede
 * separar lo publicado de lo programado y lo caducado. Es de solo lectura — el tablón lo escribe personal
 * interno, porque un aviso ahí habla en nombre de la administración.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<PortalCommunityAnnouncement[]>>} Los avisos, fijados primero y luego por fecha de publicación descendente
 */
export async function getCommunityAnnouncements(
  serviceId: string,
): Promise<FetchResponse<PortalCommunityAnnouncement[]>> {
  return fetchDataToken<PortalCommunityAnnouncement[], never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/announcements`,
    "GET",
  );
}

/**
 * Actualiza la configuración editable de una comunidad
 * (`PUT client/me/communities/:serviceId/config`). Solo se envían los campos
 * de la lista blanca: el resto los fija el contrato y el backend los rechaza.
 * Desactivar a la vez los dos métodos de inicio de sesión devuelve un 400.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {UpdatePortalCommunityConfigDto} dto - Campos editables a modificar
 * @returns {Promise<FetchResponse<PortalCommunityConfig>>} La configuración ya actualizada
 */
export async function updateCommunityConfig(
  serviceId: string,
  dto: UpdatePortalCommunityConfigDto,
): Promise<FetchResponse<PortalCommunityConfig>> {
  return fetchDataToken<PortalCommunityConfig, UpdatePortalCommunityConfigDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/config`,
    "PUT",
    dto,
  );
}
