import {
  BASE64URL_TO_BASE64_REPLACEMENTS,
  JWT_PAYLOAD_ENCODING,
  JWT_PAYLOAD_SEGMENT_INDEX,
  JWT_SEGMENT_SEPARATOR,
} from "@/constants/jwt";

/**
 * Decodifica el payload de un JWT sin verificar su firma. Es seguro porque
 * solo se usa server-side, inmediatamente después de recibir el token recién
 * emitido por la propia API en la misma petición de login/2FA (no se usa para
 * validar tokens de origen no confiable).
 * @template T - Forma esperada del payload decodificado
 * @param {string} token - JWT completo (`header.payload.signature`)
 * @returns {T} El payload decodificado
 * @throws {Error} Si `token` no tiene la forma de un JWT o su payload no es JSON válido
 */
export function decodeJwtPayload<T>(token: string): T {
  const payload = token.split(JWT_SEGMENT_SEPARATOR)[JWT_PAYLOAD_SEGMENT_INDEX];
  if (!payload) {
    throw new Error("El token recibido no tiene el formato de un JWT válido.");
  }

  const base64 = BASE64URL_TO_BASE64_REPLACEMENTS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    payload,
  );
  const json = Buffer.from(base64, "base64").toString(JWT_PAYLOAD_ENCODING);

  return JSON.parse(json) as T;
}
