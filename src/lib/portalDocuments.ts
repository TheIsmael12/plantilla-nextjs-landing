import { fetchDataToken } from "@/actions/fetch";

import type { FetchResponse, FetchResponseWithBlob } from "@/types/responses";

/**
 * Un documento del portal ya descargado, listo para reconstruirse como `Blob` en el navegador.
 * @interface PortalDocumentFile
 * @property {string} base64 - Contenido del fichero
 * @property {string} mimeType - Tipo del contenido, para el `Blob`
 */
export interface PortalDocumentFile {
  base64: string;
  mimeType: string;
}

/**
 * Descarga un documento privado del portal y lo devuelve en base64.
 *
 * **Este módulo no es `"use server"` a propósito**, igual que `actions/fetch.ts`: la función recibe una ruta
 * de la API, y exportada desde un módulo de server actions sería un endpoint al que el navegador podría
 * pasarle la ruta que quisiera. Aquí solo la pueden llamar las acciones del servidor, que son las que
 * deciden la ruta.
 *
 * Base64 y no una URL pública porque una factura o un presupuesto son documentos privados: cada descarga
 * pasa por el endpoint autenticado, que vuelve a comprobar que el documento es de este cliente. Mismo
 * criterio que los adjuntos de una incidencia.
 * @param {string} path - Ruta de la API que sirve el fichero (sin barra inicial)
 * @returns {Promise<FetchResponse<PortalDocumentFile>>} El fichero en base64, o el error de la API
 */
export async function downloadPortalDocument(
  path: string,
): Promise<FetchResponse<PortalDocumentFile>> {
  const response = await fetchDataToken<never, never>(path, "GET", undefined, { blob: true });

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
