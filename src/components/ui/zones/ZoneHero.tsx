import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { MapPin } from 'lucide-react';

import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutHero.scss';

interface ZoneHeroProps {
  slug: ZoneSlug;
}

/**
 * Hero de una página de zona (requisitos-seo.md §4): nombre del municipio, su corona
 * metropolitana, el subtítulo con los servicios enlazados a esa zona, y CTA hacia contacto.
 *
 * Reutiliza `about/hero.jpg` (no `about/approach.jpg` como `PropertyManagersHero.tsx`, para
 * no repetir la misma imagen en dos landings distintas): tampoco hay una foto por municipio en
 * `public/images/`, así que es la misma imagen genérica de "el equipo que cuida tu comunidad"
 * en las 20 zonas — el texto sí es específico de cada una, la foto no pretende serlo.
 * @param {ZoneHeroProps} props - El slug de la zona a mostrar
 * @returns {JSX.Element} El hero de la zona renderizado
 */
export default function ZoneHero({ slug }: ZoneHeroProps) {
  const t = useTranslations(`Zones.items.${slug}`);
  const tHero = useTranslations('Zones.hero');

  return (
    <section className="about__hero">
      <div className="about__container about__hero-grid">
        <div className="about__hero-copy">
          <p className="about__eyebrow">
            <MapPin size={14} aria-hidden="true" style={{ display: 'inline', verticalAlign: '-2px' }} />{' '}
            {tHero('eyebrow')} · {t('areaLabel')}
          </p>
          {/*
            El H1 dice qué se ofrece y dónde, no solo dónde.
            Era el nombre del municipio a secas ("Madrid"), que como encabezado de página no dice nada:
            ni qué se vende ahí, ni a quién. Search Console lo confirma — estas páginas aparecen para
            "empresa de conserjería en Madrid" y similares, nunca para el nombre del municipio suelto.
          */}
          <h1 className="about__hero-title">{tHero('title', { zone: t('name') })}</h1>
          <p className="about__hero-subtitle">{t('heroSubtitle')}</p>

          <Link href="/contact" className="about__btn about__btn--accent">
            {tHero('cta')}
          </Link>
        </div>

        <div className="about__hero-media">
          <div className="about__hero-media-frame">
            <Image
              src="/images/about/hero.jpg"
              alt={t('name')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="about__hero-image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
