import { getTranslations } from 'next-intl/server';

import { getClientServices } from '@/actions/client-portal/services-actions';

import CreateIncidentWizard from '@/components/ui/client-area/CreateIncidentWizard';
import TitleComponent from '@/components/ui/navigations/TitleComponent';

import '@/styles/04-components/client-area/client-list.scss';

/**
 * Página de alta de una incidencia: el asistente por pasos, con su propia dirección.
 *
 * Los servicios contratados se cargan aquí, en el servidor, y no dentro del asistente: son los mismos para
 * toda la sesión y pedirlos desde el cliente al abrir el formulario obligaría a pintar un paso «dónde» vacío
 * mientras llegan.
 * @returns {Promise<JSX.Element>} La pantalla de alta de incidencia renderizada
 */
export default async function IncidentsCreateViewPage() {
  const t = await getTranslations('Views.ClientArea.Communities.Incidents');

  const servicesResponse = await getClientServices({ limit: 100 });

  const services = (servicesResponse.data?.items ?? []).map((service) => ({
    id: service.id,
    label: `${service.code} · ${service.serviceName}`,
  }));

  return (
    <section className="client-list">
      {/* Sin `returnPath`: las migas de pan de arriba ya dicen «Inicio / Incidencias / Nueva», y el
          asistente tiene su propio «Cancelar». Tres formas de volver en la misma pantalla es una de más;
          la intranet tampoco lo pone en sus altas. */}
      <TitleComponent description={t('createDescription')} />

      <div className="incident-wizard-page">
        <CreateIncidentWizard services={services} />
      </div>
    </section>
  );
}
