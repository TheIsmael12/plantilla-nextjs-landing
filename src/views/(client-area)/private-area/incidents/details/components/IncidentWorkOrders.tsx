'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import { listIncidentWorkOrders, type ClientWorkOrder } from '@/actions/client-portal/work-orders-actions';

import Skeleton from '@/components/ui/loaders/Skeleton';

interface IncidentWorkOrdersProps {
  incidentId: string;
}

/**
 * Los partes de trabajo de una incidencia, en el área de cliente (requisitos-gestimora.md, 13.7.5).
 *
 * Esto es **la otra mitad** de la regla que deja fuera al vecino: el parte lleva dentro quién fue,
 * cuánto tardó y qué material se usó, y eso pertenece a la relación con quien contrata. Si no le
 * llega al vecino, tiene que llegarle bien al cliente — y que el único sitio donde se pueda leer
 * sea un correo de hace tres meses no es llegar bien.
 *
 * Solo salen los **validados**: un parte a medias o devuelto a su operario todavía no es un
 * documento, y enseñarlo aquí sería enseñar un borrador de algo que aún puede cambiar.
 * @param {IncidentWorkOrdersProps} props - Propiedades del componente
 * @returns {JSX.Element | null} El bloque de partes, o nada si esta incidencia no tiene
 */
export default function IncidentWorkOrders({ incidentId }: IncidentWorkOrdersProps) {
  const t = useTranslations('Views.ClientArea.Communities.Incidents.WorkOrders');

  const [workOrders, setWorkOrders] = useState<ClientWorkOrder[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const response = await listIncidentWorkOrders(incidentId);
      if (!cancelled) setWorkOrders(response.data ?? []);
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [incidentId]);

  if (workOrders === null) return <Skeleton />;

  /* Sin partes no se pinta un bloque vacío: la mayoría de incidencias se resuelven sin ninguno. */
  if (!workOrders.length) return null;

  return (
    <section className="incident-detail__block">
      <h2 className="incident-detail__block-title">{t('title')}</h2>
      <p className="incident-detail__text">{t('description')}</p>

      <ul className="incident-work-orders">
        {workOrders.map((workOrder) => (
          <li key={workOrder.id} className="incident-work-orders__item">
            <h3>
              {workOrder.code}
              {workOrder.typeName ? ` · ${workOrder.typeName}` : ''}
            </h3>

            <p className="incident-detail__text">
              {t('doneOn', {
                date: workOrder.scheduledFor,
                technician: workOrder.technicianName ?? '',
              })}
            </p>

            {workOrder.workPerformed && (
              <p className="incident-detail__text">{workOrder.workPerformed}</p>
            )}

            {!!workOrder.photos.length && (
              <div className="incident-work-orders__photos">
                {workOrder.photos.map((photo) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={photo.id} src={photo.url} alt={photo.caption ?? workOrder.code} />
                ))}
              </div>
            )}

            {workOrder.pdfUrl && (
              <a href={workOrder.pdfUrl} target="_blank" rel="noreferrer">
                {t('openPdf')}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
