'use server';

import { fetchDataToken } from '@/actions/fetch';

import type { FetchResponse } from '@/types/responses';

/**
 * Un parte de trabajo tal y como lo ve el cliente en su área (requisitos-gestimora.md, 13.7.5).
 *
 * Es una proyección recortada a propósito: llega **lo que justifica el trabajo** —qué se hizo,
 * cuándo, quién, las fotos y el PDF— y no la trastienda. La firma y el material van dentro del PDF,
 * que es el documento que se entrega.
 * @interface ClientWorkOrder
 * @property {string} id - Identificador
 * @property {string} code - Nº de parte
 * @property {string} scheduledFor - Qué día se hizo
 * @property {string|null} typeName - Tipo de trabajo
 * @property {string|null} technicianName - Nombre de pila de quien lo ejecutó
 * @property {string|null} workPerformed - Qué se hizo
 * @property {string|null} startedAt - Hora de inicio
 * @property {string|null} finishedAt - Hora de fin
 * @property {string|null} pdfUrl - El documento
 * @property {object[]} photos - Las evidencias
 */
export interface ClientWorkOrder {
  id: string;
  code: string;
  scheduledFor: string;
  typeName: string | null;
  technicianName: string | null;
  workPerformed: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  pdfUrl: string | null;
  photos: { id: string; url: string; caption: string | null }[];
}

/**
 * Los partes de una incidencia propia (`GET /client/me/incidents/{id}/work-orders`).
 *
 * Solo llegan los **validados**: un parte a medias, o devuelto a su operario, todavía no es un
 * documento. Y de una incidencia sensible no llega nada —responde 404—, porque esas no aparecen en
 * el área de cliente y sus partes tampoco (13.7.6).
 * @param {string} incidentId - La incidencia
 * @returns {Promise<FetchResponse<ClientWorkOrder[]>>} Sus partes, o el error de la API
 */
export async function listIncidentWorkOrders(
  incidentId: string,
): Promise<FetchResponse<ClientWorkOrder[]>> {
  return fetchDataToken<ClientWorkOrder[], never>(
    `client/me/incidents/${encodeURIComponent(incidentId)}/work-orders`,
  );
}
