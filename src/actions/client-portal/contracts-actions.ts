"use server";

import { fetchDataToken } from "@/actions/fetch";
import type { PendingContract } from "@/types/client-portal/contracts";
import type { FetchResponse } from "@/types/responses";

/**
 * Lo que le queda por firmar al cliente
 * (`GET client/me/contracts/pending`, requisitos-servicios.md sección 3.9).
 *
 * Va por cliente y no colgando de un servicio contratado porque cuando un contrato está pendiente todavía
 * no hay servicio: se crea al convertir el pedido, y eso exige el contrato ya firmado.
 * @returns {Promise<FetchResponse<PendingContract[]>>} Los contratos pendientes, del más antiguo al más reciente
 */
export async function getPendingContracts(): Promise<FetchResponse<PendingContract[]>> {
  return fetchDataToken<PendingContract[], never>("client/me/contracts/pending", "GET");
}

/**
 * Sube el contrato firmado a mano
 * (`POST client/me/contracts/:id/signed-document`, requisitos-servicios.md sección 3.9.7).
 *
 * **No lo da por firmado.** Queda esperando a que alguien de la empresa abra el documento y compruebe que
 * lo está de verdad: quien sube el papel no puede hacer sobre su propio papel la comprobación que se le
 * pide a quien lo recibe. Por eso el contrato sigue apareciendo como pendiente después de subirlo, con el
 * aviso de que hay algo esperando revisión.
 * @param {string} contractId - El contrato
 * @param {FormData} formData - Formulario con el PDF firmado en `file`
 * @returns {Promise<FetchResponse<PendingContract[]>>} Lo que le queda por firmar, ya con este marcado
 */
export async function uploadSignedContract(
  contractId: string,
  formData: FormData,
): Promise<FetchResponse<PendingContract[]>> {
  return fetchDataToken<PendingContract[], FormData>(
    `client/me/contracts/${encodeURIComponent(contractId)}/signed-document`,
    "POST",
    formData,
  );
}
