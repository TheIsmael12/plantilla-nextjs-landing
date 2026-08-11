"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  BatchCreateLockCredentialsDto,
  CommunityCredentialsQuery,
  CreateLockCredentialDto,
  EnrollCardDto,
  LockCredential,
  LockCredentialBatchResult,
  LockCredentialCreated,
  RevokeLockCredentialDto,
  UpdateLockCredentialDto,
} from "@/types/client-portal/community";
import type { FetchResponse, PaginatedResult } from "@/types/responses";

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
 * Página de credenciales de acceso de una comunidad
 * (`GET client/me/communities/:serviceId/lock-credentials`). `search` filtra
 * por etiqueta y titular. El PIN nunca viaja aquí, ni siquiera hasheado.
 *
 * Con `lockGroupId`/`lockId` y `onlyLive` responde a «quién tiene ya llave de esto», que es lo que hay que
 * saber antes de repartir llaves a varios vecinos: filtrar en el navegador una lista paginada daba recuentos
 * falsos —los vecinos de las páginas que no se habían traído salían como si no tuvieran llave—.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CommunityCredentialsQuery} [query] - Paginación, búsqueda y filtros por destino, vecino y vigencia
 * @returns {Promise<FetchResponse<PaginatedResult<LockCredential>>>} Página de credenciales con su estado de sincronización
 */
export async function getCommunityLockCredentials(
  serviceId: string,
  query: CommunityCredentialsQuery = {},
): Promise<FetchResponse<PaginatedResult<LockCredential>>> {
  return fetchDataToken<PaginatedResult<LockCredential>, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/lock-credentials${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Emite una credencial
 * (`POST client/me/communities/:serviceId/lock-credentials`). Es la única
 * respuesta de toda la API que incluye el PIN en claro (`plainPin`), y solo
 * cuando el tipo es `PIN`: no es recuperable después, así que hay que
 * mostrarlo al usuario en ese mismo momento.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {CreateLockCredentialDto} dto - Destino, vecino, tipo y validez de la credencial
 * @returns {Promise<FetchResponse<LockCredentialCreated>>} La credencial creada, con el PIN en claro si lo hay
 */
export async function createCommunityLockCredential(
  serviceId: string,
  dto: CreateLockCredentialDto,
): Promise<FetchResponse<LockCredentialCreated>> {
  return fetchDataToken<LockCredentialCreated, CreateLockCredentialDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/lock-credentials`,
    "POST",
    dto,
  );
}

/**
 * Reparte la misma llave a varios vecinos de una vez
 * (`POST client/me/communities/:serviceId/lock-credentials/batch`).
 *
 * **Un vecino que falla no cancela el reparto**: la respuesta trae lo emitido y quién se quedó sin llave, con
 * el código del error, así que la pantalla puede decir exactamente qué ha pasado sin repetir el reparto para
 * averiguarlo. Y como en el alta individual, los PIN en claro viajan aquí y **solo** aquí.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {BatchCreateLockCredentialsDto} dto - Destino y validez comunes, y los vecinos con su etiqueta
 * @returns {Promise<FetchResponse<LockCredentialBatchResult>>} El parte del reparto: emitidas y fallidas
 */
export async function createCommunityLockCredentialsBatch(
  serviceId: string,
  dto: BatchCreateLockCredentialsDto,
): Promise<FetchResponse<LockCredentialBatchResult>> {
  return fetchDataToken<LockCredentialBatchResult, BatchCreateLockCredentialsDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/lock-credentials/batch`,
    "POST",
    dto,
  );
}

/**
 * Modifica una credencial
 * (`PATCH client/me/communities/lock-credentials/:credentialId`).
 * @param {string} credentialId - Credencial a modificar
 * @param {UpdateLockCredentialDto} dto - Campos a cambiar
 * @returns {Promise<FetchResponse<LockCredential>>} La credencial ya actualizada
 */
export async function updateCommunityLockCredential(
  credentialId: string,
  dto: UpdateLockCredentialDto,
): Promise<FetchResponse<LockCredential>> {
  return fetchDataToken<LockCredential, UpdateLockCredentialDto>(
    `client/me/communities/lock-credentials/${encodeURIComponent(credentialId)}`,
    "PATCH",
    dto,
  );
}

/**
 * Revoca una credencial
 * (`POST client/me/communities/lock-credentials/:credentialId/revoke`). En
 * cerraduras `BLE_ONLY` la revocación no es inmediata: el estado real de cada
 * puerta hay que leerlo después en `syncs[]`/`pendingLocks`.
 * @param {string} credentialId - Credencial a revocar
 * @param {string} [reason] - Motivo de la revocación (máx. 300 caracteres)
 * @returns {Promise<FetchResponse<LockCredential>>} La credencial con su nuevo estado de revocación
 */
export async function revokeCommunityLockCredential(
  credentialId: string,
  reason?: string,
): Promise<FetchResponse<LockCredential>> {
  return fetchDataToken<LockCredential, RevokeLockCredentialDto>(
    `client/me/communities/lock-credentials/${encodeURIComponent(credentialId)}/revoke`,
    "POST",
    { reason },
  );
}

/**
 * Asocia una tarjeta física a una credencial ya emitida
 * (`POST client/me/communities/lock-credentials/:credentialId/enroll-card`).
 * @param {string} credentialId - Credencial sobre la que enrolar la tarjeta
 * @param {string} nfcUid - UID leído de la tarjeta (4-100 caracteres)
 * @returns {Promise<FetchResponse<LockCredential>>} La credencial ya con su tarjeta asociada
 */
export async function enrollCommunityCard(
  credentialId: string,
  nfcUid: string,
): Promise<FetchResponse<LockCredential>> {
  return fetchDataToken<LockCredential, EnrollCardDto>(
    `client/me/communities/lock-credentials/${encodeURIComponent(credentialId)}/enroll-card`,
    "POST",
    { nfcUid },
  );
}

/**
 * Lista las credenciales que pueden saltarse el horario de la puerta
 * (`GET client/me/communities/:serviceId/bypass-report`): mismo DTO que el
 * listado general, ya filtrado por el backend, para revisarlas periódicamente.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @returns {Promise<FetchResponse<LockCredential[]>>} Las credenciales con `canBypassSchedule`
 */
export async function getCommunityBypassReport(
  serviceId: string,
): Promise<FetchResponse<LockCredential[]>> {
  return fetchDataToken<LockCredential[], never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/bypass-report`,
    "GET",
  );
}
