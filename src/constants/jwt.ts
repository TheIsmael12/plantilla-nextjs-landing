/** Separador entre segmentos de un JWT (`header.payload.signature`). */
export const JWT_SEGMENT_SEPARATOR = ".";

/** Índice del segmento del payload dentro de un JWT ya partido por {@link JWT_SEGMENT_SEPARATOR}. */
export const JWT_PAYLOAD_SEGMENT_INDEX = 1;

/**
 * Sustituciones para pasar de Base64URL (el alfabeto que usa el payload de un
 * JWT) a Base64 estándar (el que espera `Buffer.from(..., "base64")`),
 * reciclables en cualquier decodificador de este formato.
 */
export const BASE64URL_TO_BASE64_REPLACEMENTS: readonly (readonly [RegExp, string])[] = [
  [/-/g, "+"],
  [/_/g, "/"],
];

/** Codificación del JSON decodificado de un payload de JWT. */
export const JWT_PAYLOAD_ENCODING: BufferEncoding = "utf-8";
