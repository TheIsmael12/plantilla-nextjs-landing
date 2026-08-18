import Image from 'next/image';
import { useTranslations } from 'next-intl';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/servicesHero.scss';

/**
 * Hero del índice de zonas: mismo patrón ligero que {@link import('@/components/ui/services/ServicesHero').default}
 * (decoración SVG + texto, sin foto) — a propósito, para no reutilizar otra vez la misma
 * `about/hero.jpg` que ya usan `/about` y las 20 páginas de zona individuales.
 * @returns {JSX.Element} El hero del índice de zonas renderizado
 */
export default function ZonesIndexHero() {
  const t = useTranslations('Zones.index');

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
