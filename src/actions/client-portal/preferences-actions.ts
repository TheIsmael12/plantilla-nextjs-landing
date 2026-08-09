"use server";

import { revalidatePath } from "next/cache";

import { fetchDataToken } from "@/actions/fetch";
import type { FetchResponse } from "@/types/responses";
import type {
  PortalPreferences,
  UpdatePortalPreferencesPayload,
} from "@/types/client-portal/preferences";

/**
 * Preferencias del cliente autenticado (`GET client/me/preferences`). El
 * backend crea la fila con los valores por defecto en la primera lectura, así
 * que esta llamada nunca devuelve 404 por no tenerlas configuradas todavía.
 * @returns {Promise<FetchResponse<PortalPreferences>>} Las preferencias guardadas, o el error de la API
 */
export async function getMyPreferences(): Promise<FetchResponse<PortalPreferences>> {
  return fetchDataToken<PortalPreferences, never>("client/me/preferences", "GET");
}

/**
 * Actualiza parcialmente las preferencias del cliente
 * (`PATCH client/me/preferences`).
 * @param {UpdatePortalPreferencesPayload} values - Solo los campos a cambiar
 * @returns {Promise<FetchResponse<PortalPreferences>>} Las preferencias ya actualizadas, o el error de la API
 */
export async function updatePreferences(
  values: UpdatePortalPreferencesPayload,
): Promise<FetchResponse<PortalPreferences>> {
  const response = await fetchDataToken<PortalPreferences, UpdatePortalPreferencesPayload>(
    "client/me/preferences",
    "PATCH",
    values,
  );

  if (response.data) {
    revalidatePath("/private-area/profile/preferences/theme");
    revalidatePath("/private-area/profile/preferences/locale");
    revalidatePath("/private-area/profile/preferences/notifications");
  }

  return response;
}
