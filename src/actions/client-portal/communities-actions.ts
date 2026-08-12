"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CreateCommunityAnnouncementDto,
  PortalCommunity,
  PortalCommunityAnnouncement,
  PortalCommunityConfig,
  UpdateCommunityAnnouncementDto,
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
 * separar lo publicado de lo programado y lo caducado.
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
 * Publica un aviso en el tablón de una comunidad
 * (`POST client/me/communities/:serviceId/announcements`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CreateCommunityAnnouncementDto} dto - Título, texto y cuándo se ve
 * @returns {Promise<FetchResponse<PortalCommunityAnnouncement>>} El aviso creado
 */
export async function createCommunityAnnouncement(
  serviceId: string,
  dto: CreateCommunityAnnouncementDto,
): Promise<FetchResponse<PortalCommunityAnnouncement>> {
  return fetchDataToken<PortalCommunityAnnouncement, CreateCommunityAnnouncementDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/announcements`,
    "POST",
    dto,
  );
}

/**
 * Corrige un aviso ya publicado
 * (`PATCH client/me/communities/:serviceId/announcements/:announcementId`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} announcementId - Aviso a corregir
 * @param {UpdateCommunityAnnouncementDto} dto - Campos a cambiar
 * @returns {Promise<FetchResponse<PortalCommunityAnnouncement>>} El aviso actualizado
 */
export async function updateCommunityAnnouncement(
  serviceId: string,
  announcementId: string,
  dto: UpdateCommunityAnnouncementDto,
): Promise<FetchResponse<PortalCommunityAnnouncement>> {
  return fetchDataToken<PortalCommunityAnnouncement, UpdateCommunityAnnouncementDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/announcements/${encodeURIComponent(announcementId)}`,
    "PATCH",
    dto,
  );
}

/**
 * Retira un aviso del tablón
 * (`DELETE client/me/communities/:serviceId/announcements/:announcementId`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} announcementId - Aviso a retirar
 * @returns {Promise<FetchResponse<void>>} Respuesta vacía si se retiró correctamente
 */
export async function removeCommunityAnnouncement(
  serviceId: string,
  announcementId: string,
): Promise<FetchResponse<void>> {
  return fetchDataToken<void, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/announcements/${encodeURIComponent(announcementId)}`,
    "DELETE",
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
