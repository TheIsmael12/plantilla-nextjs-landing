// Este módulo NO es `"use server"` a propósito, igual que `fetch.ts`: es una utilidad interna de las
// acciones públicas, no una acción que el navegador pueda invocar.
import "server-only";

import * as Yup from "yup";
import { getTranslations } from "next-intl/server";

import { HTTPStatus } from "@/constants/httpStatus";
import type { FetchResponse, FetchResponseFieldError } from "@/types/responses";

/**
 * Resultado de {@link validatePublicPayload}: los valores ya validados y normalizados por el esquema, o la
 * respuesta de error lista para devolver desde la acción.
 */
export type PublicPayloadValidation<T> =
  | { ok: true; value: T }
  | { ok: false; response: FetchResponse<never> };

/**
 * Valida en servidor lo que llega a una server action pública con el mismo esquema Yup del formulario.
 *
 * **Por qué hace falta si el formulario ya valida.** Una server action es un endpoint HTTP: cualquiera puede
 * llamarla con el cuerpo que quiera sin pasar por el formulario (basta copiar el `Next-Action` de una
 * petición). Las acciones públicas —contacto, reclamaciones, candidatura— reenviaban `values` tal cual a la
 * API, así que lo único que se validaba era lo que el backend quisiera validar, y cualquier campo de más
 * viajaba también. Aquí se valida con el esquema existente (`stripUnknown`, para que las claves que no están
 * en él desaparezcan) y cada acción monta después el cuerpo campo a campo.
 *
 * Los mensajes del esquema son claves del namespace `Validations` (como en el formulario); se traducen aquí
 * para que la respuesta se lea igual que un error del backend.
 * @template T - Forma de los valores validados
 * @param {Yup.AnySchema} schema - Esquema con el que validar
 * @param {unknown} values - Lo recibido del navegador, sin validar
 * @returns {Promise<PublicPayloadValidation<T>>} Los valores validados, o un 400 con los errores por campo
 */
export async function validatePublicPayload<T>(
  schema: Yup.AnySchema,
  values: unknown,
): Promise<PublicPayloadValidation<T>> {
  try {
    const value = (await schema.validate(values, {
      abortEarly: false,
      stripUnknown: true,
    })) as T;

    return { ok: true, value };
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) throw error;

    const t = await getTranslations("Validations");
    const translate = (key: string): string => (t.has(key) ? t(key) : t("common.invalid"));

    const issues = error.inner.length > 0 ? error.inner : [error];
    const errors: FetchResponseFieldError[] = issues.map((issue) => ({
      field: issue.path ?? "",
      message: translate(issue.message),
    }));

    return {
      ok: false,
      response: {
        status: HTTPStatus.BAD_REQUEST,
        message: errors[0]?.message ?? translate("common.invalid"),
        errors,
      },
    };
  }
}

/**
 * Texto opcional que solo reenvía el servidor (versión del aviso, token del captcha, atribución...): cadena
 * acotada o nada. No lleva mensaje traducible propio porque el formulario no lo pinta.
 * @param {number} max - Longitud máxima
 * @returns {Yup.StringSchema} El esquema del campo
 */
export const serverText = (max: number) => Yup.string().trim().max(max, "common.invalid");
