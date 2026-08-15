import { useTranslations } from 'next-intl';

import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';

interface ZoneContextProps {
  slug: ZoneSlug;
}

/**
 * Párrafo de contexto geográfico de una zona: corona metropolitana, distancia y perfil de
 * vivienda predominante — el bloque que evita que las 20 páginas de zona sean la misma
 * plantilla con el nombre cambiado (`requisitos-seo.md` §4).
 * @param {ZoneContextProps} props - El slug de la zona a mostrar
 * @returns {JSX.Element} El párrafo de contexto renderizado
 */
export default function ZoneContext({ slug }: ZoneContextProps) {
  const t = useTranslations(`Zones.items.${slug}`);

  return (
    <section className="about__approach">
      <div className="about__container">
        <p className="about__text-muted">{t('context')}</p>
      </div>
    </section>
  );
}
