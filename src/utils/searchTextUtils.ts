/** Marcas diacríticas combinantes, en escapes: un acento suelto en el código lo mangla cualquier herramienta. */
const DIACRITICS = /[̀-ͯ]/g;

/**
 * Busca sin que importen los acentos ni las mayúsculas.
 *
 * En una lista de vecinos, escribir «peña» y no encontrar a Peña —o escribir «pena» y tampoco— es lo que hace
 * que una búsqueda parezca rota. Se normaliza a NFD, que separa cada letra de su tilde, y se quitan las
 * marcas: así «Peña», «pena» y «PEÑA» se comparan iguales.
 *
 * La ñ se convierte en n por el camino, y es intencionado: quien busca a un vecino teclea deprisa y no va a
 * poner la tilde, y confundir «año» con «ano» no es un problema en una lista de nombres y viviendas.
 * @param {string} value - Texto a normalizar
 * @returns {string} El texto en minúsculas, sin tildes y sin espacios en los extremos
 */
export function normalizeForSearch(value: string): string {
  return value.normalize("NFD").replace(DIACRITICS, "").toLowerCase().trim();
}

/**
 * Si `haystack` contiene `needle`, comparando sin acentos ni mayúsculas.
 *
 * Con una búsqueda vacía devuelve `true`: no filtrar es enseñarlo todo, no esconderlo todo.
 * @param {string} haystack - Texto donde buscar
 * @param {string} needle - Lo que se busca
 * @returns {boolean} Si hay coincidencia
 */
export function matchesSearch(haystack: string, needle: string): boolean {
  const term = normalizeForSearch(needle);

  return term.length === 0 || normalizeForSearch(haystack).includes(term);
}
