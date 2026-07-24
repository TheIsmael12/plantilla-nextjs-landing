import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SERVICE_SLUGS, SERVICE_ICONS, type ServiceSlug } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailOthers.scss';

interface ServiceDetailOthersProps {
  slug: ServiceSlug;
}

/**
 * Enlaces a los demás servicios, para no dejar la ficha como un callejón
 * sin salida.
 * @param {ServiceDetailOthersProps} props El slug del servicio actual, para excluirlo de la lista
 * @returns {JSX.Element} Los enlaces a otros servicios renderizados
 */
export default function ServiceDetailOthers({ slug }: ServiceDetailOthersProps) {
  const t = useTranslations('Services.detail');
  const itemsT = useTranslations('Services.items');

  const otherSlugs = SERVICE_SLUGS.filter((s) => s !== slug);

  return (
    <section className="services__others">
      <div className="services__container">
        <h2 className="services__title-lg services__others-title">{t('otherServicesTitle')}</h2>

        <ul className="services__others-list">
          {otherSlugs.map((otherSlug) => {
            const Icon = SERVICE_ICONS[otherSlug];
            return (
              <li key={otherSlug}>
                <Link
                  href={`/services/${otherSlug}`}
                  className="services__others-link"
                >
                  <span className="services__others-icon">
                    <Icon size={18} />
                  </span>
                  {itemsT(`${otherSlug}.title`)}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
