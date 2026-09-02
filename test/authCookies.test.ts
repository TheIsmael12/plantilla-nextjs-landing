import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { AUTH_COOKIE_NAMES } from "@/config/authCookies";

/**
 * Los nombres de las cookies de sesión.
 *
 * **Las cookies no distinguen el puerto.** Esta aplicación y la intranet corren las dos en `localhost`, así
 * que comparten tarro: con el nombre por defecto, entrar en una pisaba la sesión de la otra y la otra
 * reventaba en cada carga con `JWT_SESSION_ERROR: decryption operation failed` — una cookie cifrada con un
 * secreto que no es el suyo.
 *
 * Es un fallo de datos, no de lógica: nunca falla al compilar, y el síntoma aparece a la carga siguiente en
 * la otra aplicación, que es donde nadie está mirando. De ahí que se compruebe aquí.
 */
const RAIZ = path.resolve(__dirname, "..");

describe("cookies de sesión", () => {
  const authOptions = fs.readFileSync(path.join(RAIZ, "src/lib/authOptions.ts"), "utf8");

  it("se escriben con el nombre del módulo, no con uno escrito a mano", () => {
    expect(authOptions).toContain("name: AUTH_COOKIE_NAMES.sessionToken");
    expect(authOptions).toContain("name: AUTH_COOKIE_NAMES.callbackUrl");
    expect(authOptions).toContain("name: AUTH_COOKIE_NAMES.csrfToken");

    // Ni literal ni compuesto con un prefijo interpolado: el único sitio donde salen esos nombres es
    // `config/authCookies`.
    for (const cookie of ["session-token", "callback-url", "csrf-token"]) {
      expect(authOptions).not.toContain(`next-auth.${cookie}`);
    }
  });

  it("en local llevan delante el nombre de la aplicación", () => {
    // Los tests corren fuera de producción, que es justo donde tiene que namespacearse.
    expect(AUTH_COOKIE_NAMES.sessionToken).toBe("portal.next-auth.session-token");
    expect(AUTH_COOKIE_NAMES.callbackUrl).toBe("portal.next-auth.callback-url");
    expect(AUTH_COOKIE_NAMES.csrfToken).toBe("portal.next-auth.csrf-token");
  });

  it("no coinciden con los de la intranet", () => {
    /*
     * La comprobación que de verdad importa, hecha contra el otro repositorio si está al lado.
     *
     * Dos nombres iguales en `localhost` son el fallo entero; que cada uno sea «el suyo» no sirve de nada
     * si resulta que el suyo es el mismo. Si el repositorio no está, no se comprueba: esto no puede fallar
     * por dónde tenga cada uno sus carpetas.
     */
    const otro = path.resolve(RAIZ, "../plantilla-nextjs/src/config/authCookies.ts");

    if (!fs.existsSync(otro)) return;

    const suyo = fs.readFileSync(otro, "utf8").match(/DEVELOPMENT_NAMESPACE = "([^"]+)"/)?.[1];

    expect(suyo).toBeDefined();
    expect(AUTH_COOKIE_NAMES.sessionToken.startsWith(suyo!)).toBe(false);
  });
});
