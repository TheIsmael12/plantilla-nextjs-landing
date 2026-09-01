"use server";

import { fetchDataToken } from "@/actions/fetch";
import type {
  AssignKeysDto,
  AssignKeysResult,
  KeyringMember,
  MemberDetail,
  BatchCreateLockCredentialsDto,
  CommunityCredentialsQuery,
  CreateLockCredentialDto,
  EnrollCardDto,
  LockCredential,
  LockCredentialBatchResult,
  LockCredentialCreated,
  RevokeLockCredentialDto,
  UpdateKeyringMembershipDto,
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
 * Reparte un llavero o una puerta entre varios vecinos e invitaciones de una vez
 * (`POST client/me/communities/:serviceId/keys/assign`).
 *
 * Sustituye a dar de alta una credencial por persona. El destino se elige una vez —y si es un llavero, él ya
 * dice cómo se abre y con qué condiciones—, y aquí solo se decide a quién.
 *
 * **Solo llaveros**: una puerta suelta ya no se reparte. A quien ya aceptó la invitación se le emite al
 * momento lo que le falte; a quien no, se le **planifica** el llavero y nace el día que entre.
 *
 * Como en el alta individual, los PIN en claro viajan en esta respuesta y **solo** aquí.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {AssignKeysDto} dto - Destino y destinatarios
 * @returns {Promise<FetchResponse<AssignKeysResult>>} El parte del reparto, con los PIN generados
 */
export async function assignCommunityKeys(
  serviceId: string,
  dto: AssignKeysDto,
): Promise<FetchResponse<AssignKeysResult>> {
  return fetchDataToken<AssignKeysResult, AssignKeysDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keys/assign`,
    "POST",
    dto,
  );
}

/**
 * Quién tiene un llavero
 * (`GET client/me/communities/:serviceId/keyrings/:keyringId/members`).
 *
 * Es la única fuente de «quién tiene esto»: bajo el modelo nuevo una credencial no dice a qué llavero
 * pertenece —es el medio con el que alguien se identifica, y le vale para todos los suyos—, así que el
 * acceso lo dan sus pertenencias y no sus llaves.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} keyringId - El llavero
 * @returns {Promise<FetchResponse<KeyringMember[]>>} Sus miembros, por orden de entrada
 */
export async function getKeyringMembers(
  serviceId: string,
  keyringId: string,
): Promise<FetchResponse<KeyringMember[]>> {
  return fetchDataToken<KeyringMember[], never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyrings/${encodeURIComponent(keyringId)}/members`,
  );
}

/**
 * La ficha de una persona: sus llaveros y con qué se identifica
 * (`GET client/me/communities/:serviceId/members/:membershipId/keyring-detail`).
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} residentMembershipId - El vecino
 * @returns {Promise<FetchResponse<MemberDetail>>} Su ficha
 */
export async function getKeyringMemberDetail(
  serviceId: string,
  residentMembershipId: string,
): Promise<FetchResponse<MemberDetail>> {
  return fetchDataToken<MemberDetail, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/members/${encodeURIComponent(residentMembershipId)}/keyring-detail`,
  );
}

/**
 * Saca a alguien de un llavero
 * (`DELETE client/me/communities/:serviceId/keyring-members/:keyringMembershipId`).
 *
 * **No le quita sus llaves**: su PIN y su móvil son suyos y le siguen valiendo para los llaveros que le
 * queden. Solo cuando se queda sin ninguno se retiran, porque entonces serían un código vivo en la cerradura
 * detrás de alguien que ya no tiene por qué abrir nada.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} keyringMembershipId - La pertenencia a retirar
 * @returns {Promise<FetchResponse<null>>} Vacío si se ha retirado
 */
export async function revokeKeyringMember(
  serviceId: string,
  keyringMembershipId: string,
): Promise<FetchResponse<null>> {
  return fetchDataToken<null, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyring-members/${encodeURIComponent(keyringMembershipId)}`,
    "DELETE",
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

/**
 * Cambia hasta cuándo le vale a alguien un llavero
 * (`PATCH client/me/communities/:serviceId/keyring-members/:keyringMembershipId`).
 *
 * Es distinta de la vigencia del vecino: se puede vivir aquí indefinidamente y tener el llavero del gimnasio
 * solo mientras dure el abono. Baja al fabricante en el momento.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} keyringMembershipId - La pertenencia
 * @param {UpdateKeyringMembershipDto} dto - Desde y hasta cuándo (`null` quita el límite)
 * @returns {Promise<FetchResponse<MemberDetail>>} La ficha del vecino ya actualizada
 */
export async function updateKeyringMembership(
  serviceId: string,
  keyringMembershipId: string,
  dto: UpdateKeyringMembershipDto,
): Promise<FetchResponse<MemberDetail>> {
  return fetchDataToken<MemberDetail, UpdateKeyringMembershipDto>(
    `client/me/communities/${encodeURIComponent(serviceId)}/keyring-members/${encodeURIComponent(keyringMembershipId)}`,
    "PATCH",
    dto,
  );
}

/**
 * Emite el enlace de acceso de un vecino
 * (`POST client/me/communities/:serviceId/members/:membershipId/magic-link`).
 *
 * Es cómo se da acceso a quien no quiere instalarse nada: se abre en el móvil y abre sus puertas. **Solo se
 * puede leer en esta respuesta**, así que quien la recibe tiene que entregarlo antes de cerrar.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} residentMembershipId - El vecino
 * @returns {Promise<FetchResponse<{ link: string }>>} El enlace
 */
export async function issueResidentMagicLink(
  serviceId: string,
  residentMembershipId: string,
): Promise<FetchResponse<{ link: string }>> {
  return fetchDataToken<{ link: string }, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/members/${encodeURIComponent(residentMembershipId)}/magic-link`,
    "POST",
  );
}

/**
 * Retira todos los enlaces de acceso de un vecino
 * (`DELETE client/me/communities/:serviceId/members/:membershipId/magic-links`).
 *
 * Se retiran **todos** y no uno concreto porque no se pueden leer: quien viene a cortar uno no sabe cuál se
 * filtró, y dejar otro vivo sería no haber cortado nada. Sigue entrando con su PIN y su tarjeta.
 * @param {string} serviceId - Servicio contratado que soporta la comunidad
 * @param {string} residentMembershipId - El vecino
 * @returns {Promise<FetchResponse<{ revoked: number }>>} Cuántos se han retirado
 */
export async function revokeResidentMagicLinks(
  serviceId: string,
  residentMembershipId: string,
): Promise<FetchResponse<{ revoked: number }>> {
  return fetchDataToken<{ revoked: number }, never>(
    `client/me/communities/${encodeURIComponent(serviceId)}/members/${encodeURIComponent(residentMembershipId)}/magic-links`,
    "DELETE",
  );
}

/**
 * Vuelve a leer el PIN de una llave, preguntándoselo al fabricante
 * (`POST client/me/communities/lock-credentials/:credentialId/reveal-pin`).
 *
 * Aquí se guarda hasheado y no se puede releer; **allí sí**, y es lo que la cerradura espera de verdad. **No
 * emite uno nuevo**: el que el vecino se sabe sigue valiendo, así que sirve para repetírselo a quien lo ha
 * olvidado. Queda auditado.
 * @param {string} credentialId - La llave
 * @returns {Promise<FetchResponse<{ pin: string }>>} El PIN en claro
 */
export async function revealCredentialPin(
  credentialId: string,
): Promise<FetchResponse<{ pin: string }>> {
  return fetchDataToken<{ pin: string }, never>(
    `client/me/communities/lock-credentials/${encodeURIComponent(credentialId)}/reveal-pin`,
    "POST",
  );
}

/**
 * Reprograma una llave en las puertas que le falten
 * (`POST client/me/communities/lock-credentials/:credentialId/resync`).
 *
 * Hace falta porque una llave se emite con las puertas que hay ese día: cuando se monta una nueva, la que la
 * gente ya tenía no la conoce y esa puerta no les abre.
 * @param {string} credentialId - La llave
 * @returns {Promise<FetchResponse<LockCredential>>} La llave ya reprogramada
 */
export async function resyncLockCredential(
  credentialId: string,
): Promise<FetchResponse<LockCredential>> {
  return fetchDataToken<LockCredential, never>(
    `client/me/communities/lock-credentials/${encodeURIComponent(credentialId)}/resync`,
    "POST",
  );
}
