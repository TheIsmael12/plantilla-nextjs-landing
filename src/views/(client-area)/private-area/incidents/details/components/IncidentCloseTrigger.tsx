'use client';

import { useState } from 'react';

import Button from '@/components/ui/buttons/Button';
import IncidentCloseForm from '@/views/(client-area)/private-area/incidents/details/components/IncidentCloseForm';

interface IncidentCloseTriggerProps {
  incidentId: string;
}

/**
 * Botón que abre el modal de confirmación de resolución (`IncidentCloseForm`).
 *
 * Vive aparte de `IncidentsDetailsViewPage` (componente de servidor, sin estado) porque abrir un modal
 * necesita estado de cliente. Se pinta junto al aviso de "tu incidencia se ha resuelto" mientras el
 * estado es `RESOLVED`.
 * @param {IncidentCloseTriggerProps} props - La incidencia a confirmar
 * @returns {JSX.Element} El botón y, si está abierto, el modal de cierre
 */
export default function IncidentCloseTrigger({ incidentId }: IncidentCloseTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" title="openCloseIncident" onClick={() => setIsOpen(true)} />

      {isOpen && <IncidentCloseForm incidentId={incidentId} onClose={() => setIsOpen(false)} />}
    </>
  );
}
