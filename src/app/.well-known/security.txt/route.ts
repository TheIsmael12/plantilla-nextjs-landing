import { ENV } from "@/config/env";

/**
 * Publica `/.well-known/security.txt` (RFC 9116): el canal para que quien
 * encuentre una vulnerabilidad sepa a quién avisar sin tener que adivinar un
 * email de contacto genérico. Reutiliza `COMPANY_SECURITY_EMAIL`, la misma
 * dirección que ya usan las páginas legales.
 * @returns {Response} El fichero `security.txt` en texto plano
 */
export function GET(): Response {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const body = [
    `Contact: mailto:${ENV.COMPANY_SECURITY_EMAIL}`,
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, "Z")}`,
    `Canonical: ${ENV.APP_URL.replace(/\/$/, "")}/.well-known/security.txt`,
    "Preferred-Languages: es, en",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
