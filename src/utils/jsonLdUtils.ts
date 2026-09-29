/**
 * Caracteres que hay que escapar para meter JSON dentro de un `<script>` inline, con su secuencia `\uXXXX`.
 *
 * - `<` y `>`: sin escapar, un texto con `</script>` (el título de un post, la descripción de una oferta,
 *   cualquier cosa que venga del backend o del CMS) **cierra el `<script>` del JSON-LD** y lo que siga se
 *   interpreta como HTML: un XSS almacenado. `JSON.stringify` no los toca porque en JSON son válidos. `>` se
 *   escapa también para no dejar formar `-->` ni cerrar un `<!--` que abriera otro texto.
 * - `&`: no es peligroso en un `<script>` de HTML, pero sí si el documento acaba tratado como XHTML o
 *   pasa por un saneador que decodifique entidades; escaparlo no cuesta nada.
 * - U+2028 y U+2029 (separadores de línea y de párrafo): válidos en JSON pero fin de línea en JavaScript
 *   anterior a ES2019. Un consumidor que haga `eval` del bloque, o un motor antiguo, rompería con ellos.
 *
 * Las secuencias `\uXXXX` son JSON válido: cualquier lector (Google, Bing, un parser) obtiene exactamente el
 * mismo dato.
 */
/*
 * Los dos separadores se construyen con `fromCharCode` y no se escriben en el fuente: un U+2028 literal en un
 * fichero .ts es invisible en el editor y fácil de perder (o de romper) al copiar y pegar.
 */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

const JSON_LD_ESCAPES: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  [LINE_SEPARATOR]: "\\u2028",
  [PARAGRAPH_SEPARATOR]: "\\u2029",
};

/** Lo que se sustituye: los cinco caracteres de {@link JSON_LD_ESCAPES}. */
const JSON_LD_UNSAFE_CHARS = new RegExp(`[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`, "g");

/**
 * Serializa un objeto JSON-LD para `dangerouslySetInnerHTML` de un `<script type="application/ld+json">`,
 * escapando lo que permitiría salirse del `<script>`. Todos los bloques de datos estructurados de la app
 * deben pasar por aquí en vez de por `JSON.stringify` a pelo.
 * @param {unknown} data - Objeto JSON-LD
 * @returns {string} El JSON, seguro para ir inline dentro de un `<script>`
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(JSON_LD_UNSAFE_CHARS, (char) => JSON_LD_ESCAPES[char]);
}
