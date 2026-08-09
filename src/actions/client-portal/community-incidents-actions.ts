"use server";

import { revalidatePath } from "next/cache";

import { fetchDataToken } from "@/actions/fetch";
import type {
  CommunityIncident,
  CommunityIncidentsQuery,
  IncidentAttachment,
  IncidentCommentResponse,
  PortalCreateIncidentCommentInput,
  PortalCreateIncidentInput,
} from "@/types/client-portal/community";
import type { FetchResponse, FetchResponseWithBlob, PaginatedResult } from "@/types/responses";
import { HTTPStatus } from "@/constants/httpStatus";

/**
 * Construye el query string de un listado del portal, omitiendo los valores
 * vacíos/`undefined` para no mandar filtros sin valor al backend.
 * @param {Record<string, string | number | undefined>} params - Filtros activos
 * @returns {string} El query string, incluyendo el `?` inicial, o cadena vacía si no hay filtros
 */
function buildQueryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }

  const search = query.toString();
  return search ? `?${search}` : "";
}

/**
 * Lista las incidencias visibles para el cliente (`GET client/me/incidents`),
 * el único listado paginado del módulo de comunidad. El backend ya excluye las
 * sensibles en el WHERE: el portal no puede pedirlas ni debe ofrecer ningún
 * control para intentarlo.
 * @param {CommunityIncidentsQuery} [query] - Paginación, filtro por estado y por servicio contratado
 * @returns {Promise<FetchResponse<PaginatedResult<CommunityIncident>>>} Página de incidencias
 */
export async function getCommunityIncidents(
  query: CommunityIncidentsQuery = {},
): Promise<FetchResponse<PaginatedResult<CommunityIncident>>> {
  return fetchDataToken<PaginatedResult<CommunityIncident>, never>(
    `client/me/incidents${buildQueryString({ ...query })}`,
    "GET",
  );
}

/**
 * Resuelve una incidencia concreta por su id.
 *
 * No existe `GET client/me/incidents/:id` en el backend (verificado: responde
 * 404, y el controlador del portal solo declara el listado, la creación y el
 * comentario), y el listado rechaza un filtro `id` por whitelist de
 * validación. Así que el detalle se resuelve paginando el propio listado, que
 * ya lleva en el `WHERE` las dos condiciones que importan —que sea de este
 * cliente y que no sea sensible—, y quedándose con la que coincide: una
 * incidencia ajena o sensible simplemente no aparece, y la vista responde 404.
 * @param {string} id - Identificador de la incidencia
 * @returns {Promise<FetchResponse<CommunityIncident>>} La incidencia, o `status: 404` si no es visible para este cliente
 */
export async function getIncidentDetail(
  id: string,
): Promise<FetchResponse<CommunityIncident>> {
  let page = 1;

  for (;;) {
    const response = await getCommunityIncidents({ page, limit: 100 });

    if (!response.data) return { status: response.status, message: response.message };

    const match = response.data.items.find((incident) => incident.id === id);
    if (match) return { status: HTTPStatus.OK, data: match };

    if (page >= response.data.pagination.totalPages) {
      return { status: HTTPStatus.NOT_FOUND };
    }

    page += 1;
  }
}

/**
 * Abre una incidencia desde el portal (`POST client/me/incidents`).
 *
 * El tipo tiene que ser uno no sensible: el backend responde 400
 * (`INCIDENT_SENSITIVE_NOT_ALLOWED_FROM_PORTAL`) para los sensibles, y ese
 * mensaje llega como `status`/`message` en la respuesta.
 * @param {PortalCreateIncidentInput} dto - Título, descripción, tipo y, opcionalmente, servicio y prioridad
 * @returns {Promise<FetchResponse<CommunityIncident>>} La incidencia creada, ya con tipo y servicio resueltos
 */
export async function createIncident(
  dto: PortalCreateIncidentInput,
): Promise<FetchResponse<CommunityIncident>> {
  const response = await fetchDataToken<CommunityIncident, PortalCreateIncidentInput>(
    "client/me/incidents",
    "POST",
    dto,
  );

  if (response.data) revalidatePath("/private-area/incidents");

  return response;
}

/**
 * Comenta en una incidencia propia (`POST client/me/incidents/:id/comments`).
 * El comentario nace siempre con visibilidad `REPORTER`: el portal no elige
 * visibilidad, la fija el servidor.
 * @param {string} incidentId - Identificador de la incidencia
 * @param {PortalCreateIncidentCommentInput} dto - Texto del comentario
 * @returns {Promise<FetchResponse<IncidentCommentResponse>>} El comentario creado
 */
export async function createIncidentComment(
  incidentId: string,
  dto: PortalCreateIncidentCommentInput,
): Promise<FetchResponse<IncidentCommentResponse>> {
  const response = await fetchDataToken<
    IncidentCommentResponse,
    PortalCreateIncidentCommentInput
  >(
    `client/me/incidents/${encodeURIComponent(incidentId)}/comments`,
    "POST",
    dto,
  );

  if (response.data) revalidatePath(`/private-area/incidents/${incidentId}`);

  return response;
}

/**
 * Hilo de comentarios de una incidencia propia (`GET client/me/incidents/:id/comments`).
 * El backend ya filtra a `visibility: REPORTER`: nada del hilo interno del
 * equipo llega aquí.
 * @param {string} incidentId - Identificador de la incidencia
 * @returns {Promise<FetchResponse<IncidentCommentResponse[]>>} Los comentarios, en orden cronológico
 */
export async function getIncidentComments(
  incidentId: string,
): Promise<FetchResponse<IncidentCommentResponse[]>> {
  return fetchDataToken<IncidentCommentResponse[], never>(
    `client/me/incidents/${encodeURIComponent(incidentId)}/comments`,
    "GET",
  );
}

/**
 * Adjuntos de una incidencia propia, colgados directamente de ella
 * (`GET client/me/incidents/:id/attachments`). Los que cuelgan de un
 * comentario concreto llegan dentro de `attachments` de ese comentario
 * (`getIncidentComments`), no aquí.
 * @param {string} incidentId - Identificador de la incidencia
 * @returns {Promise<FetchResponse<IncidentAttachment[]>>} Los adjuntos visibles para el cliente
 */
export async function getIncidentAttachments(
  incidentId: string,
): Promise<FetchResponse<IncidentAttachment[]>> {
  return fetchDataToken<IncidentAttachment[], never>(
    `client/me/incidents/${encodeURIComponent(incidentId)}/attachments`,
    "GET",
  );
}

/**
 * Sube un adjunto a una incidencia propia
 * (`POST client/me/incidents/:id/attachments`, máx. 20 MB, 10 por incidencia).
 * @param {string} incidentId - Incidencia a la que se adjunta
 * @param {FormData} formData - Formulario con `file` y, opcionalmente, `commentId` para que el fichero acompañe a un mensaje
 * @returns {Promise<FetchResponse<IncidentAttachment>>} El adjunto creado, o el error de la API
 */
export async function uploadIncidentAttachment(
  incidentId: string,
  formData: FormData,
): Promise<FetchResponse<IncidentAttachment>> {
  const response = await fetchDataToken<IncidentAttachment, FormData>(
    `client/me/incidents/${encodeURIComponent(incidentId)}/attachments`,
    "POST",
    formData,
  );

  if (response.status === HTTPStatus.CREATED) revalidatePath(`/private-area/incidents/${incidentId}`);

  return response;
}

/**
 * Contenido de un adjunto en base64, listo para reconstruirse como `Blob` en
 * cliente. Es base64 y no una URL pública por lo mismo que en intranet: el
 * adjunto de una incidencia puede ser la foto de una reclamación, y cada
 * descarga pasa por el endpoint autenticado, que vuelve a comprobar
 * propiedad y visibilidad.
 * @interface IncidentAttachmentFile
 * @property {string} base64 - Contenido del fichero
 * @property {string} mimeType - Tipo del contenido, para el `Blob`
 */
export interface IncidentAttachmentFile {
  base64: string;
  mimeType: string;
}

/**
 * Descarga un adjunto propio (`GET .../attachments/:attachmentId/download`).
 * @param {string} incidentId - Incidencia dueña del adjunto
 * @param {string} attachmentId - Adjunto a descargar
 * @param {"original" | "thumbnail"} [variant] - `thumbnail` sirve la miniatura si la tiene; si no, cae al original
 * @returns {Promise<FetchResponse<IncidentAttachmentFile>>} El fichero en base64, o el error de la API
 */
export async function downloadIncidentAttachment(
  incidentId: string,
  attachmentId: string,
  variant: "original" | "thumbnail" = "original",
): Promise<FetchResponse<IncidentAttachmentFile>> {
  const query = variant === "thumbnail" ? "?variant=thumbnail" : "";

  const response = await fetchDataToken<never, never>(
    `client/me/incidents/${encodeURIComponent(incidentId)}/attachments/${encodeURIComponent(attachmentId)}/download${query}`,
    "GET",
    undefined,
    { blob: true },
  );

  if ("file" in response) {
    const withBlob = response as FetchResponseWithBlob<never>;
    const buffer = Buffer.from(await withBlob.file.arrayBuffer());

    return {
      status: withBlob.status,
      data: { base64: buffer.toString("base64"), mimeType: withBlob.mimeType },
    };
  }

  return response;
}
