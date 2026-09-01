/**
 * Descarga un contenido de texto como fichero, generando un enlace temporal
 * y simulando su clic.
 * @param {string} fileName Nombre del fichero a descargar
 * @param {string} content Contenido de texto del fichero
 * @returns {void}
 */
export function downloadTextFile(fileName: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Descarga un fichero recibido en base64 (p. ej. un adjunto de incidencia,
 * que nunca tiene URL pública y llega codificado desde una Server Action).
 * @param {string} base64 - Contenido del fichero, codificado en base64
 * @param {string} fileName - Nombre con el que se descarga
 * @param {string} mimeType - Tipo MIME del `Blob` generado
 * @returns {void}
 */
export function downloadBase64File(base64: string, fileName: string, mimeType: string): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Descarga texto como fichero con un tipo MIME concreto.
 *
 * Existe aparte de {@link downloadTextFile} porque el tipo no es un detalle: un CSV declarado como
 * `text/plain` se lo queda el editor de texto en vez de la hoja de cálculo, y el registro de accesos se
 * exporta justamente para abrirlo en Excel.
 * @param {string} fileName - Nombre del fichero a descargar, con su extensión
 * @param {string} content - Contenido del fichero
 * @param {string} mimeType - Tipo MIME con el que se declara (p. ej. `text/csv`)
 * @returns {void}
 */
export function downloadFile(fileName: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
