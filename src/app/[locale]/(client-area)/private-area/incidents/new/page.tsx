import IncidentsCreateViewPage from '@/views/(client-area)/private-area/incidents/create/IncidentsCreateViewPage';

/**
 * Página de `/private-area/incidents/new`: el asistente para abrir una incidencia.
 *
 * Segmento estático, así que Next.js la resuelve antes que `[id]`: `/incidencias/nueva` no acaba en el
 * detalle de una incidencia inexistente.
 * @returns {Promise<JSX.Element>} La vista de alta de incidencia renderizada
 */
export default async function IncidentsNewPage() {
  return <IncidentsCreateViewPage />;
}
