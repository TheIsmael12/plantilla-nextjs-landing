'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircleIcon } from 'lucide-react';

import IncidentCloseForm from '@/views/(client-area)/private-area/incidents/details/components/IncidentCloseForm';
import RowActionsMenu from '@/components/ui/tables/RowActionsMenu';

import type { RowAction } from '@/types/ui/tables/table';

interface IncidentStatusMenuProps {
  incidentId: string;
}

/**
 * El menú de tres puntos junto a los badges de estado: la vía para que el cliente dé su incidencia
 * por resuelta él mismo, sin esperar a que el staff la marque `RESUELTA` primero.
 *
 * Solo se pinta en un estado abierto y distinto de `RESUELTA` (lo decide `IncidentsDetailsViewPage`,
 * que es quien conoce el estado real): en `RESUELTA` ya está el flujo dedicado de `IncidentCloseForm`
 * más abajo en la página, y duplicarlo en un menú sería la misma acción en dos sitios.
 *
 * Al elegir "Marcar como resuelta" se muestra el mismo `IncidentCloseForm` que ya existe para
 * `RESUELTA` — no es un componente distinto, así que el aviso ("se cerrará, si vuelve a pasar abre
 * una nueva") y la valoración con estrellas son exactamente los mismos en los dos caminos.
 * @param {IncidentStatusMenuProps} props - La incidencia
 * @returns {JSX.Element} El menú, y el formulario de cierre si se ha elegido resolverla
 */
export default function IncidentStatusMenu({ incidentId }: IncidentStatusMenuProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents');
  const tTable = useTranslations('Table');

  const [isResolving, setIsResolving] = useState(false);

  const actions: RowAction[] = [
    {
      key: 'resolve',
      label: t('markResolvedAction'),
      icon: CheckCircleIcon,
      onClick: () => setIsResolving(true),
    },
  ];

  return (
    <>
      <RowActionsMenu ariaLabel={tTable('actions')} actions={actions} />

      {isResolving && <IncidentCloseForm incidentId={incidentId} />}
    </>
  );
}
