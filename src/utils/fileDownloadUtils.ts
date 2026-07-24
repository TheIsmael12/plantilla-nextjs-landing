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
