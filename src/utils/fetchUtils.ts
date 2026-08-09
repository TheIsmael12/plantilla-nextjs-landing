// Lee las cabeceras del request original. Nunca debe acabar en un bundle de
// cliente: `server-only` lo convierte en error de compilación en vez de en
// un fallo silencioso en tiempo de ejecución.
import "server-only";

import { headers as nextHeaders } from "next/headers";
import { getLocale, getTranslations } from "next-intl/server";

import { ENV } from "@/config/env";
import { DEFAULT_LOCALE } from "@/config/locales";
import type {
  FetchResponse,
  FetchResponseFieldError,
} from "@/types/responses";

/**
 * Resuelve a una URL absoluta un recurso que el backend puede devolver como
 * ruta relativa (p. ej. `coverUrl`/`avatarUrl` del blog: `/media/blog/xxx.png`
 * en vez de una URL ya absoluta, según el entorno). Estos recursos cuelgan
 * del origen del backend, no de `ENV.BACKEND_URL` (que incluye el prefijo
 * `/api`) — anteponer `BACKEND_URL` a una ruta de este tipo produce una URL
 * con `/api/media/...` que la API responde con 404.
 * @param {string | null | undefined} path - Ruta o URL devuelta por el backend
 * @returns {string | null} La URL absoluta lista para un `<img src>`, o `null` si no había `path`
 */
export function resolveBackendAssetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${ENV.BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Reenvía al backend las cabeceras del request original que le interesan
 * para auditoría/seguridad (IP real, user agent, referer, host): tanto el
 * rate limit de 5 peticiones/minuto del endpoint público de contacto como el
 * log de accesos del portal (`ClientPortalAccessLog`, que parsea `user-agent`
 * para guardar dispositivo/SO/navegador de cada login) dependen de que estas
 * cabeceras sean las del visitante real y no las del servidor de Next.js.
 * Nunca lanza: si `headers()` no está disponible en el contexto actual,
 * simplemente no se añade ninguna cabecera adicional.
 * @param {Headers} target - Cabeceras de la petición a la API, mutadas in-place
 * @returns {Promise<void>} No devuelve nada
 */
async function forwardRequestHeaders(target: Headers): Promise<void> {
  try {
    const requestHeaders = await nextHeaders();

    const forwardedFor = requestHeaders.get("x-forwarded-for");
    const realIp = requestHeaders.get("x-real-ip");
    const userAgent = requestHeaders.get("user-agent");
    const referer = requestHeaders.get("referer");
    const host = requestHeaders.get("host");

    if (forwardedFor) target.set("x-forwarded-for", forwardedFor);
    if (realIp) target.set("x-real-ip", realIp);
    if (userAgent) target.set("user-agent", userAgent);
    if (referer) target.set("referer", referer);
    if (host) target.set("x-original-host", host);
  } catch {
    // Sin contexto de request (p. ej. fuera de un Server Component/Action): se omite el reenvío.
  }
}

/**
 * Construye las cabeceras de una petición a la API añadiendo `Accept-Language`
 * según el locale activo (o {@link DEFAULT_LOCALE} si no se pudo resolver) y
 * reenviando las cabeceras del request original vía {@link forwardRequestHeaders},
 * para que los mensajes de error que devuelve la propia API vengan siempre en
 * el idioma correcto y el rate limiting/log de accesos se apliquen por
 * visitante real.
 * @param {Record<string, string>} [base] - Cabeceras propias de la petición (p. ej. `Content-Type`)
 * @returns {Promise<Headers>} Las cabeceras combinadas, listas para pasar a `fetch`
 */
export async function buildHeaders(
  base: Record<string, string> = {},
): Promise<Headers> {
  const headers = new Headers(base);

  const locale = await getLocale().catch(() => DEFAULT_LOCALE);
  headers.set("Accept-Language", locale);
  headers.set("x-lang", locale);

  await forwardRequestHeaders(headers);

  return headers;
}

/**
 * Normaliza una excepción no controlada (timeout, DNS...) al mismo contrato
 * {@link FetchResponse} que devuelve una respuesta de error de la API, para
 * que `fetchData` nunca lance una excepción. El mensaje es propio (la API no
 * ha respondido nada), así que se traduce aquí mismo con next-intl en vez de
 * venir ya traducido del backend.
 * @template T - Forma de `data` que tendría la respuesta si hubiera tenido éxito
 * @param {unknown} err - Excepción original capturada
 * @returns {Promise<FetchResponse<T>>} Una respuesta con `status: 0` y el mensaje de red traducido
 */
export async function networkError<T = never>(
  err: unknown,
): Promise<FetchResponse<T>> {
  const t = await getTranslations("Common.Errors");

  // Solo el tipo y el mensaje del error: volcar la excepción entera arrastraría
  // a los logs su `cause`, que en un fallo de `fetch` lleva la petición completa.
  console.error(
    "[networkError]",
    err instanceof Error ? `${err.name}: ${err.message}` : "Error desconocido",
  );

  return { status: 0, message: t("networkError") };
}

/**
 * Vuelca el cuerpo de error de una respuesta no exitosa de la API al contrato
 * {@link FetchResponse}. El backend responde en formato RFC 9457 Problem
 * Details (`{type, title, status, detail, instance, errors?, timestamp}`):
 * si trae `detail` se reenvía tal cual como mensaje —ya viene traducido por
 * la API vía `Accept-Language`/`x-lang`— y solo se recurre a un mensaje
 * propio traducido si el cuerpo no era el esperado (respuesta vacía, HTML de
 * un proxy intermedio, etc.).
 * @template T - Forma de `data` que tendría la respuesta si hubiera tenido éxito
 * @param {Response} response - Respuesta de `fetch` con `ok: false`
 * @returns {Promise<FetchResponse<T>>} La respuesta normalizada, con `message` siempre presente
 */
export async function parseError<T = never>(
  response: Response,
): Promise<FetchResponse<T>> {
  try {
    const body = await response.json();
    if (body?.detail || body?.title) {
      return {
        status: response.status,
        message: body.detail ?? body.title,
        errors: body.errors as FetchResponseFieldError[] | undefined,
      };
    }
  } catch {
    // El cuerpo no era JSON (o estaba vacío): caemos al mensaje genérico traducido de abajo.
  }

  const t = await getTranslations("Common.Errors");
  return { status: response.status, message: t("unexpectedError") };
}

/**
 * Interpreta el cuerpo de una respuesta **correcta** de la API.
 *
 * Un 2xx no garantiza que el cuerpo sea el JSON esperado: un proxy o un
 * balanceador por medio puede devolver HTML, y la respuesta puede llegar
 * truncada. Sin esta protección, el `JSON.parse` rompería el contrato de
 * `fetchData` —documentado y asumido por todos los llamadores— de que una
 * acción nunca lanza: el fallo saldría como excepción de servidor en vez de
 * como un mensaje de error normal. El backend envuelve el éxito en
 * `{status, data, message}` (interceptor `TransformInterceptor`), que ya
 * coincide con {@link FetchResponse}.
 * @template T - Forma de `data` en la respuesta de éxito
 * @param {Response} response - Respuesta de `fetch` con `ok: true`
 * @returns {Promise<FetchResponse<T>>} El cuerpo interpretado, o una respuesta de error si no era JSON
 */
export async function parseSuccess<T = never>(
  response: Response,
): Promise<FetchResponse<T>> {
  const rawBody = await response.text();

  if (!rawBody) return { status: response.status, data: undefined };

  try {
    return JSON.parse(rawBody) as FetchResponse<T>;
  } catch {
    console.error(
      "[parseSuccess] La API respondió",
      response.status,
      "con un cuerpo que no es JSON:",
      rawBody.slice(0, 200),
    );

    const t = await getTranslations("Common.Errors");
    return { status: response.status, message: t("unexpectedError") };
  }
}
