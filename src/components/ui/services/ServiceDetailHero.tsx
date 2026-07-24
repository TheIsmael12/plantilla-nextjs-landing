import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Layers } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { SERVICE_VISUALS, type ServiceSlug } from '@/config/routing';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailHero.scss';

interface ServiceDetailHeroProps {
  slug: ServiceSlug;
}

/**
 * Hero de la ficha de un servicio: enlace de vuelta al listado, etiqueta,
 * titular, descripción, dos llamadas a la acción (solicitar el servicio y
 * ver el resto de servicios) y una foto real, con una tarjeta flotante que
 * cuenta cuántos sub-servicios incluye.
 * @param {ServiceDetailHeroProps} props El slug del servicio a mostrar
 * @returns {JSX.Element} El hero de la ficha de servicio renderizado
 */
export default function ServiceDetailHero({ slug }: ServiceDetailHeroProps) {
  const t = useTranslations('Services');
  const itemT = useTranslations(`Services.items.${slug}`);
  const subservicesCount = (itemT.raw('subservices') as unknown[]).length;

  return (
    <section className="services__detail-hero">
      <div className="services__container services__detail-hero-grid">
        <div className="services__detail-hero-copy">
          <Link href="/services" className="services__detail-back">
            <ArrowLeft size={16} aria-hidden="true" />
            {t('detail.back')}
          </Link>

          <p className="services__detail-hero-tag">{itemT('tag')}</p>
          <h1 className="services__detail-hero-title">{itemT('title')}</h1>
          <p className="services__text-muted services__detail-hero-description">{itemT('description')}</p>

          <div className="services__detail-hero-actions">
            <Link href="/contact" className="services__btn services__btn--accent">
              {itemT('cta')}
            </Link>
            <Link href="/services" className="services__btn services__btn--ghost">
              {t('detail.ctaSecondaryButton')}
            </Link>
          </div>
        </div>

        <div className="services__detail-hero-media">
          <div className="services__detail-hero-media-frame">
            <Image
              src={SERVICE_VISUALS[slug]}
              alt={itemT('title')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="services__detail-hero-image"
              priority
              fetchPriority="high"
            />
          </div>

          <div className="services__detail-hero-badge">
            <span className="services__detail-hero-badge-icon">
              <Layers size={18} />
            </span>
            <span>{t('detail.subservicesCount', { count: subservicesCount })}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
