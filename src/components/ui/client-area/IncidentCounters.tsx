import { getTranslations } from 'next-intl/server';

import { CheckCircle2Icon, ClockAlertIcon, InboxIcon, LockIcon } from 'lucide-react';

import { getIncidentCounters } from '@/actions/client-portal/community-incidents-actions';

import StatCard from '@/components/ui/cards/StatCard';

import '@/styles/04-components/ui/cards/stat-card.scss';
import '@/styles/04-components/client-area/client-list.scss';

/**
 * Resumen de la bandeja, arriba del listado de incidencias del cliente.
 *
 * Los cuatro números contestan lo que se viene a preguntar aquí: **cuántas tengo abiertas**, cuántas van
 * fuera de plazo, cuántas están resueltas y cuántas ya se cerraron. No hay «sin asignar» como en la intranet:
 * a quién le toca el trabajo es asunto nuestro, y enseñárselo al cliente solo invita a preguntar por qué su
 * avería no tiene dueño todavía.
 *
 * **El color solo se enciende cuando el número importa**: un cero en «fuera de plazo» va en gris, porque un
 * panel con todo en rojo y verde deja de decir nada. Si hay una fuera de plazo, esa tarjeta se pone roja y es
 * lo primero que se ve.
 *
 * Un fallo de los contadores no tumba la pantalla: simplemente no se pinta el resumen y el listado sigue.
 * @returns {Promise<JSX.Element | null>} El resumen, o `null` si los contadores no llegaron
 */
export default async function IncidentCounters() {
  const t = await getTranslations('Views.ClientArea.Communities.Incidents.counters');

  const { data } = await getIncidentCounters();

  if (!data) return null;

  return (
    <div className="client-list__stats">
      <StatCard
        label={t('open')}
        value={String(data.open)}
        icon={InboxIcon}
        variant={data.open === 0 ? 'neutral' : 'info'}
      />
      <StatCard
        label={t('overdue')}
        value={String(data.overdue)}
        description={data.overdue > 0 ? t('overdueHint') : undefined}
        icon={ClockAlertIcon}
        variant={data.overdue === 0 ? 'neutral' : 'danger'}
      />
      <StatCard
        label={t('resolved')}
        value={String(data.resolved)}
        icon={CheckCircle2Icon}
        variant={data.resolved === 0 ? 'neutral' : 'success'}
      />
      <StatCard
        label={t('closed')}
        value={String(data.closed)}
        icon={LockIcon}
        variant="neutral"
      />
    </div>
  );
}
