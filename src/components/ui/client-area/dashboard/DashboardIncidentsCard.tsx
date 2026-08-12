'use client';

import { useTranslations } from 'next-intl';

import Chart from '@/components/ui/charts/Chart';

import type { PortalIncidentCounters } from '@/types/client-portal/community';

interface DashboardIncidentsCardProps {
  counters: PortalIncidentCounters;
}

/**
 * En qué punto están las incidencias del cliente, como reparto.
 *
 * **Las fuera de plazo no son una porción.** Son un subconjunto de las abiertas, así que dibujarlas aparte
 * haría un donut cuyas partes suman más que el total: el mismo problema sumaría dos veces la misma avería.
 * Ese número tiene su propia tarjeta arriba, en rojo, que es donde hace falta que se vea.
 *
 * Donut y no tarta: el hueco del centro deja leer los tres estados sin que las porciones peleen por el
 * espacio, y con tres categorías una tarta llena se lee peor de lo que parece.
 * @param {DashboardIncidentsCardProps} props - Contadores del cliente
 * @returns {JSX.Element} El reparto de incidencias
 */
export default function DashboardIncidentsCard({ counters }: DashboardIncidentsCardProps) {
  const t = useTranslations('Views.ClientArea.Home.Dashboard');
  const tCounters = useTranslations('Views.ClientArea.Communities.Incidents.counters');

  return (
    <Chart
      type="donut"
      categories={[tCounters('open'), tCounters('resolved'), tCounters('closed')]}
      series={[
        {
          name: t('incidentsSeries'),
          data: [counters.open, counters.resolved, counters.closed],
        },
      ]}
      emptyMessage={t('incidentsEmpty')}
      height={280}
    />
  );
}
