import { useTranslations } from 'next-intl';
import { Check, Minus } from 'lucide-react';

import type { ServiceSlug } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailScope.scss';

interface Frequency {
  label: string;
  detail: string;
}

interface ServiceDetailScopeProps {
  slug: ServiceSlug;
}

/**
 * Alcance del servicio: qué entra en el precio, qué no entra, y con qué
 * frecuencias o modalidades se puede contratar.
 *
 * Lo que **no** incluye va en la página, y no solo en el presupuesto, por dos motivos. Comercialmente, la
 * discusión sobre lo que se daba por incluido llega siempre, y llega tarde: mejor tenerla antes de firmar.
 * Y legalmente, hay servicios donde el límite no es una decisión de Imora sino una reserva de actividad —la
 * vigilancia privada y la conexión a central receptora de alarmas están reservadas a empresas inscritas al
 * amparo de la Ley 5/2014, y esta ficha vende proyecto, instalación y mantenimiento, que es otra cosa—.
 *
 * Las frecuencias son opcionales: hay servicios que se contratan por horas y no por visitas.
 * @param {ServiceDetailScopeProps} props El slug del servicio a mostrar
 * @returns {JSX.Element} La sección de alcance renderizada
 */
export default function ServiceDetailScope({ slug }: ServiceDetailScopeProps) {
  const t = useTranslations('Services.detail');
  const itemT = useTranslations(`Services.items.${slug}`);

  const included = itemT.raw('scope.included') as string[];
  const excluded = itemT.raw('scope.excluded') as string[];
  const frequencies = itemT.raw('scope.frequencies') as Frequency[];

  return (
    <section className="services__scope" aria-labelledby={`scope-${slug}`}>
      <div className="services__container">
        <h2 className="services__title-lg services__scope-title" id={`scope-${slug}`}>
          {t('scopeTitle')}
        </h2>

        <div className="services__scope-grid">
          <div className="services__scope-card">
            <h3 className="services__scope-card-title">{t('scopeIncludedTitle')}</h3>
            <ul className="services__scope-list">
              {included.map((entry) => (
                <li className="services__scope-item" key={entry}>
                  <Check
                    className="services__scope-icon services__scope-icon--in"
                    aria-hidden="true"
                  />
                  {entry}
                </li>
              ))}
            </ul>
          </div>

          <div className="services__scope-card services__scope-card--excluded">
            <h3 className="services__scope-card-title">{t('scopeExcludedTitle')}</h3>
            <ul className="services__scope-list">
              {excluded.map((entry) => (
                <li className="services__scope-item" key={entry}>
                  <Minus className="services__scope-icon services__scope-icon--out" aria-hidden="true" />
                  {entry}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {frequencies.length > 0 && (
          <div className="services__scope-frequencies">
            <h3 className="services__scope-card-title">{t('scopeFrequencyTitle')}</h3>
            <dl className="services__scope-freq-list">
              {frequencies.map((frequency) => (
                <div className="services__scope-freq" key={frequency.label}>
                  <dt className="services__scope-freq-label">{frequency.label}</dt>
                  <dd className="services__scope-freq-detail">{frequency.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}
