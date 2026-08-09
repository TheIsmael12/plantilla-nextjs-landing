const UNITS = ['B', 'KB', 'MB', 'GB'] as const;

/**
 * Formatea un tamaño en bytes a la unidad legible más adecuada (`B`/`KB`/`MB`/`GB`),
 * con un decimal salvo en bytes.
 * @param {number} sizeBytes - Tamaño en bytes
 * @returns {string} El tamaño formateado (p. ej. `"1.4 MB"`)
 */
export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes <= 0) return `0 ${UNITS[0]}`;

  const exponent = Math.min(
    Math.floor(Math.log(sizeBytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = sizeBytes / 1024 ** exponent;

  return `${exponent === 0 ? value : value.toFixed(1)} ${UNITS[exponent]}`;
}
