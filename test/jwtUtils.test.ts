import { describe, expect, it } from "vitest";

import { decodeJwtPayload } from "@/utils/jwtUtils";

/**
 * Monta un JWT de mentira con la carga que se le pase.
 *
 * Se firma con una cadena cualquiera porque **esta función no verifica nada**: solo descodifica. Quien valide la
 * firma es el backend, y una prueba que firmara de verdad estaría probando la librería de otro.
 * @param {Record<string, unknown>} payload - Lo que va en la carga
 * @returns {string} El token, con sus tres segmentos
 */
function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${header}.${body}.firma-de-mentira`;
}

describe("decodeJwtPayload", () => {
  it("devuelve la carga del token", () => {
    const token = makeToken({ sub: "vecino-1", exp: 1786702344, roles: ["RESIDENT"] });

    expect(decodeJwtPayload(token)).toEqual({
      sub: "vecino-1",
      exp: 1786702344,
      roles: ["RESIDENT"],
    });
  });

  /*
   * El caso que justifica que exista este módulo en vez de un `atob` suelto.
   *
   * La carga de un JWT va en base64**url**, que cambia `+` por `-` y `/` por `_`. Un descodificador de base64 normal
   * se atraganta o devuelve bytes distintos, y el fallo solo aparece con ciertos tokens —los que al codificar
   * producen esos caracteres—, así que se cuela en desarrollo y revienta en producción con una cuenta concreta.
   */
  it("entiende base64url, no solo base64", () => {
    /*
     * Esta carga concreta está elegida porque su base64url **sí** contiene `-` y `_`, comprobado abajo.
     *
     * No vale cualquier texto con acentos: que aparezcan esos dos caracteres depende de los bytes exactos, y una
     * carga «rara» a ojo puede codificarse entera en el alfabeto común. Sin la comprobación de la línea siguiente,
     * esta prueba pasaría sin ejercitar la conversión y daría una seguridad falsa.
     */
    const payload = { name: "Ñuño", note: "~~~???>>>" };
    const token = makeToken(payload);
    const body = token.split(".")[1] ?? "";

    expect(body).toMatch(/-/);
    expect(body).toMatch(/_/);
    expect(decodeJwtPayload(token)).toEqual(payload);
  });

  it("lee correctamente los acentos", () => {
    expect(decodeJwtPayload<{ name: string }>(makeToken({ name: "Peña" })).name).toBe("Peña");
  });

  /*
   * Un token sin la forma de un JWT lanza con un mensaje que se entiende.
   *
   * Y lanza a propósito en vez de devolver `null`: quien llama va a leer `sub` de lo que salga, así que un `null`
   * silencioso se convertiría en un `TypeError` tres capas más arriba, lejos de la causa.
   */
  it("lanza si el token no tiene la forma de un JWT", () => {
    expect(() => decodeJwtPayload("")).toThrow(/no tiene el formato/);
  });

  it("lanza si la carga no es JSON", () => {
    const basura = Buffer.from("esto no es json").toString("base64url");

    expect(() => decodeJwtPayload(`cabecera.${basura}.firma`)).toThrow();
  });
});
