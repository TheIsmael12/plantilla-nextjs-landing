import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SERVICE_SLUGS, SERVICE_ICONS, SERVICE_VISUALS } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/servicesGrid.scss';

/**
 * Los seis servicios reales de Imora, cada uno con foto, icono, resumen y
 * enlace a su propia ficha.
 * @returns {JSX.Element} La cuadrícula de servicios renderizada
 */
export default function ServicesGrid() {
  const t = useTranslations('Services');
  const itemsT = useTranslations('Services.items');

  return (
    <section className="services__grid-section">
      <div className="services__container services__grid">
        {SERVICE_SLUGS.map((slug) => {
          const Icon = SERVICE_ICONS[slug];
          const title = itemsT(`${slug}.title`);

          return (
            <article className="services__card" key={slug}>
              <div className="services__card-media">
                <Image
                  src={SERVICE_VISUALS[slug]}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 30vw"
                  className="services__card-image"
                />
                <span className="services__card-icon">
                  <Icon size={20} />
                </span>
              </div>

              <div className="services__card-body">
                <p className="services__card-tag">{itemsT(`${slug}.tag`)}</p>
                <h2 className="services__card-title">{title}</h2>
                <p className="services__card-summary">{itemsT(`${slug}.summary`)}</p>

                <Link
                  href={`/services/${slug}`}
                  className="services__card-link"
                >
                  {t('viewService')}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
