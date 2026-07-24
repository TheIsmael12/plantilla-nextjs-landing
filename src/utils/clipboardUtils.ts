/**
 * Copia un texto al portapapeles del sistema.
 * @param {string} text Texto a copiar
 * @returns {Promise<boolean>} `true` si se copió correctamente, `false` si no hay `navigator` o falló la copia
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
