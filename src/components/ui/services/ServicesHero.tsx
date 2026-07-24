import Image from 'next/image';
import { useTranslations } from 'next-intl';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/servicesHero.scss';

/**
 * Hero del listado de servicios: titular y subtítulo que resumen la
 * propuesta de un único proveedor para todos los servicios de la comunidad.
 * @returns {JSX.Element} El hero del listado de servicios renderizado
 */
export default function ServicesHero() {
  const t = useTranslations('Services.index');

  return (
    <section className="services__hero">
      <Image
        src="/images/assets/decor/shape.svg"
        alt=""
        width={190}
        height={190}
        className="services__hero-decor"
      />
      <div className="services__container services__hero-inner">
        <p className="services__eyebrow">{t('eyebrow')}</p>
        <h1 className="services__title-lg">{t('title')}</h1>
        <p className="services__text-muted">{t('subtitle')}</p>
      </div>
    </section>
  );
}
