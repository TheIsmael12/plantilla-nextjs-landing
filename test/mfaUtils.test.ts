import { describe, expect, it } from "vitest";

import {
  decodeMfaChallenge,
  decodePasswordChangeRequired,
  encodeMfaChallenge,
  encodePasswordChangeRequired,
} from "@/utils/mfaUtils";

/*
 * Estas cuatro funciones existen porque NextAuth solo deja devolver **una cadena** de error.
 *
 * «Hace falta el segundo factor» y «hay que cambiar la contraseña» no son errores: son pasos siguientes que
 * necesitan llevar un token. Se codifican con un prefijo dentro de esa cadena y se descodifican al llegar. Por eso
 * lo que hay que probar de verdad no es el camino feliz, sino que **cada uno no responde a lo del otro** y que un
 * error normal no se confunde con ninguno de los dos: ahí es donde un usuario acabaría en la pantalla equivocada.
 */
describe("el reto de segundo factor", () => {
  it("va y vuelve", () => {
    const encoded = encodeMfaChallenge({ challengeToken: "reto-123" });

    expect(decodeMfaChallenge(encoded)).toEqual({ challengeToken: "reto-123" });
  });

  it.each([undefined, null, ""])("con %j no hay reto", (error) => {
    expect(decodeMfaChallenge(error)).toBeNull();
  });

  it("un error normal no se lee como un reto", () => {
    expect(decodeMfaChallenge("CredentialsSignin")).toBeNull();
    expect(decodeMfaChallenge("Algo ha ido mal")).toBeNull();
  });

  /** El prefijo sin token detrás es basura, y devolver `{challengeToken: ""}` mandaría a validar un reto vacío. */
  it("el prefijo sin token no cuenta", () => {
    expect(decodeMfaChallenge("MFA_REQUIRED:")).toBeNull();
  });

  it("no responde al del cambio de contraseña", () => {
    expect(decodeMfaChallenge(encodePasswordChangeRequired("cambio-1"))).toBeNull();
  });
});

describe("el cambio de contraseña obligatorio", () => {
  it("va y vuelve", () => {
    expect(decodePasswordChangeRequired(encodePasswordChangeRequired("cambio-1"))).toBe("cambio-1");
  });

  it.each([undefined, null, ""])("con %j no hay cambio pendiente", (error) => {
    expect(decodePasswordChangeRequired(error)).toBeNull();
  });

  it("el prefijo sin token no cuenta", () => {
    expect(decodePasswordChangeRequired("PASSWORD_CHANGE_REQUIRED:")).toBeNull();
  });

  it("no responde al del segundo factor", () => {
    expect(decodePasswordChangeRequired(encodeMfaChallenge({ challengeToken: "reto-1" }))).toBeNull();
  });
});
