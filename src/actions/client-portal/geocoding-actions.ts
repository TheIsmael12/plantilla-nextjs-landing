"use server";

import { fetchDataToken } from "@/actions/fetch";
import type { GeocodedAddress } from "@/types/geocoding";

/**
 * Sitúa una dirección escrita en el mapa (`GET /geocoding?address=...`). La
 * API responde `found: false` —no un error— cuando no sabe localizarla, así
 * que quien la use solo tiene que dejar de pintar el mapa. Las coordenadas
 * las cachea el backend, así que pedir la misma dirección varias veces no
 * repite la consulta al servicio externo.
 * @param {string} address - Dirección completa: calle, código postal, ciudad y país
 * @returns {Promise<{status: number, message?: string, data?: GeocodedAddress}>} Las coordenadas, o el error de la API
 */
export async function geocodeAddress(address: string): Promise<{
  status: number;
  message?: string;
  data?: GeocodedAddress;
}> {
  return fetchDataToken<GeocodedAddress, never>(`geocoding?address=${encodeURIComponent(address)}`);
}
