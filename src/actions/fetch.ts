// Este módulo NO es `"use server"` a propósito. Toda función exportada desde
// un módulo con esa directiva se registra como una server action invocable
// desde el navegador, y `fetchData` acepta endpoint, método y cuerpo
// arbitrarios: publicarla sería ofrecer un proxy genérico a la API. Es una
// utilidad interna que solo consumen las acciones de dominio
// (`actions/**/*-actions.ts`), que sí son `"use server"`.
//
// `server-only` convierte en error de compilación cualquier intento de
// importarla desde un Client Component, en vez de dejar que el fallo
// aparezca en tiempo de ejecución.
import "server-only";

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/authOptions";
import { ENV } from "@/config/env";
import { HTTPStatus } from "@/constants/httpStatus";
import type { FetchResponse, FetchResponseWithBlob } from "@/types/responses";
import { buildHeaders, networkError, parseError, parseSuccess } from "@/utils/fetchUtils";
import { getTranslations } from "next-intl/server";

/**
 * Verbos HTTP soportados por {@link fetchData}.
 * @typedef {("GET"|"POST"|"PATCH"|"PUT"|"DELETE")} HttpMethod
 */
export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * Opciones de {@link fetchData}.
 * @interface FetchDataOptions
 * @property {Record<string, string>} [extraHeaders] - Cabeceras adicionales propias de la llamada
 * @property {(number|false)} [revalidate] - Segundos de revalidación ISR (`fetch`'s `next.revalidate`). `false` (por defecto) desactiva la Data Cache, adecuado para peticiones de escritura (`POST`/`PATCH`/...); los listados/detalle de blog pasan un número (300s, alineado con el `Cache-Control` del backend) para aprovechar ISR
 * @property {string[]} [tags] - Tags de la Data Cache, para poder invalidar bajo demanda con `revalidateTag`
 */
export interface FetchDataOptions {
  extraHeaders?: Record<string, string>;
  revalidate?: number | false;
  tags?: string[];
}

const baseURL = ENV.BACKEND_URL;

/**
 * Ejecuta una petición contra la API pública del backend (blog, contacto,
 * unsubscribe...), sin adjuntar ningún token de sesión. Para peticiones
 * autenticadas contra el portal de cliente, ver {@link fetchDataToken}.
 * Nunca lanza una excepción: cualquier fallo (de red o de negocio) se
 * normaliza a {@link FetchResponse} para que el llamador solo tenga que
 * comprobar `status`/`message`/`errors`.
 * @template T - Forma de `data` en la respuesta de éxito
 * @template Y - Forma del cuerpo enviado (`data`)
 * @param {string} endpoint - Ruta relativa de la API, sin `/` inicial (p. ej. `blog/posts`)
 * @param {HttpMethod} [method] - Verbo HTTP; por defecto `"GET"`
 * @param {Partial<Y>} [data] - Cuerpo de la petición; se ignora en `GET`
 * @param {FetchDataOptions} [options] - Cabeceras adicionales y opciones de cache/ISR
 * @returns {Promise<FetchResponse<T>>} La respuesta normalizada, en éxito o en error
 */
export async function fetchData<T, Y>(
  endpoint: string,
  method: HttpMethod = "GET",
  data?: Partial<Y>,
  options?: FetchDataOptions,
): Promise<FetchResponse<T>> {
  const requestHeaders = await buildHeaders({
    "Content-Type": "application/json",
    ...options?.extraHeaders,
  });

  let response: Response;

  try {
    response = await fetch(`${baseURL}/${endpoint}`, {
      method,
      headers: requestHeaders,
      body: method !== "GET" ? JSON.stringify(data) : undefined,
      next: { revalidate: options?.revalidate ?? false, tags: options?.tags },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return networkError(err);
  }

  if (!response.ok) return parseError(response);

  if (response.status === HTTPStatus.NO_CONTENT) {
    return { status: response.status };
  }

  return parseSuccess<T>(response);
}

/**
 * Opciones de {@link fetchDataToken}.
 * @interface FetchTokenOptions
 * @property {string} [token] - `accessToken` explícito a usar en vez del de la sesión activa; imprescindible dentro de `authorize()` de NextAuth, donde todavía no existe sesión (el token recién emitido por login/2FA/cambio de contraseña se pasa aquí para poder llamar a `GET client/me` antes de que la sesión exista)
 * @property {string} [tokenType] - Esquema del header `Authorization`; por defecto `"Bearer"`
 * @property {boolean} [blob] - Si `true`, la respuesta se trata como descarga de fichero ({@link FetchResponseWithBlob}) en vez de JSON
 */
export interface FetchTokenOptions {
  token?: string;
  tokenType?: string;
  blob?: boolean;
}

/**
 * Ejecuta una petición autenticada contra la API del portal de cliente.
 * Resuelve el token en este orden: `options.token` explícito, o si no se
 * indica, la sesión activa de NextAuth (`getServerSession`). Igual que
 * {@link fetchData}, nunca lanza: todo fallo se normaliza a {@link FetchResponse}.
 * @template T - Forma de `data` en la respuesta de éxito
 * @template Y - Forma del cuerpo enviado (`data`)
 * @param {string} endpoint - Ruta relativa de la API, sin `/` inicial (p. ej. `client/me`)
 * @param {HttpMethod} [method] - Verbo HTTP; por defecto `"GET"`
 * @param {Partial<Y> | FormData} [data] - Cuerpo de la petición; se ignora en `GET`. Un `FormData` (subida de adjuntos) se manda tal cual, sin `Content-Type` explícito: el navegador/runtime añade el `multipart/form-data; boundary=...` correcto, que un `JSON.stringify` rompería
 * @param {FetchTokenOptions & FetchDataOptions} [options] - Token explícito, cabeceras adicionales, `blob` para descargas, y opciones de cache/ISR
 * @returns {Promise<FetchResponse<T> | FetchResponseWithBlob<T>>} La respuesta normalizada, en éxito o en error
 */
export async function fetchDataToken<T, Y>(
  endpoint: string,
  method: HttpMethod = "GET",
  data?: Partial<Y> | FormData,
  options?: FetchTokenOptions & FetchDataOptions,
): Promise<FetchResponse<T> | FetchResponseWithBlob<T>> {
  let accessToken = options?.token;

  if (!accessToken) {
    const session = await getServerSession(authOptions);
    if (!session?.user.backendTokens?.accessToken) {
      const t = await getTranslations("Common.Errors");
      return { status: HTTPStatus.UNAUTHORIZED, message: t("unauthenticated") };
    }
    accessToken = session.user.backendTokens.accessToken;
  }

  const isFormData = data instanceof FormData;

  const requestHeaders = await buildHeaders({
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Authorization: `${options?.tokenType ?? "Bearer"} ${accessToken}`,
    ...options?.extraHeaders,
  });

  let response: Response;

  try {
    response = await fetch(`${baseURL}/${endpoint}`, {
      method,
      headers: requestHeaders,
      body: method !== "GET" ? (isFormData ? data : JSON.stringify(data)) : undefined,
      next: { revalidate: options?.revalidate ?? false, tags: options?.tags },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return networkError(err);
  }

  if (!response.ok) return parseError(response);

  if (options?.blob) {
    const responseBlob = await response.blob();
    const contentDisposition = response.headers.get("Content-Disposition");
    const rawName = contentDisposition?.split("filename=")[1] ?? "downloaded_file";

    return {
      status: response.status,
      file: responseBlob,
      mimeType: responseBlob.type || "application/octet-stream",
      fileName: rawName.replace(/^"(.*)"$/, "$1"),
    };
  }

  if (response.status === HTTPStatus.NO_CONTENT) {
    return { status: response.status };
  }

  return parseSuccess<T>(response);
}
