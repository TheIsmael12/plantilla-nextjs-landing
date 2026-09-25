import { useLocale, useTranslations } from 'next-intl';
import { Building2 } from 'lucide-react';

import type { ZoneSlug } from '@/config/zones';

import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/zones/zoneContext.scss';

interface ZoneContextProps {
  slug: ZoneSlug;
}

/**
 * Párrafo de contexto geográfico de una zona: corona metropolitana, distancia y perfil de
 * vivienda predominante — el bloque que evita que las 20 páginas de zona sean la misma
 * plantilla con el nombre cambiado (`requisitos-seo.md` §4).
 *
 * Antes era un `<p>` suelto con `about__text-muted`, sin ancho de lectura limitado (se
 * estiraba a todo el ancho de la página, difícil de leer en desktop) y sin ningún tratamiento
 * visual propio — quedaba como un párrafo huérfano entre el hero y "Servicios disponibles" en
 * vez de leerse como una sección. Ahora tiene su propia tarjeta de contenido: icono, ancho de
 * lectura limitado (`zone-context__text`, ~65ch) y un fondo sutil que la distingue del blanco
 * del hero de encima y de "Servicios disponibles" de debajo.
 *
 * Debajo va la lista de barrios del municipio. No es relleno: quien busca «conserjería en El
 * Bercial» o «piscinas en Las Matas» no escribe el nombre del municipio, y hasta ahora ninguna
 * página los nombraba. Se unen con `Intl.ListFormat` para que el «y» final salga en el idioma
 * de la página y no escrito a mano en cada traducción.
 * @param {ZoneContextProps} props - El slug de la zona a mostrar
 * @returns {JSX.Element} El párrafo de contexto renderizado
 */
export default function ZoneContext({ slug }: ZoneContextProps) {
  const t = useTranslations(`Zones.items.${slug}`);
  const tZones = useTranslations('Zones');
  const locale = useLocale();

  const neighborhoods = t.raw('neighborhoods') as string[];
  const areas = new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(neighborhoods);

  return (
    <section className="zone-context">
      <div className="about__container">
        <div className="zone-context__card">
          <span className="zone-context__icon">
            <Building2 size={20} aria-hidden="true" />
          </span>
          <div className="zone-context__body">
            <p className="zone-context__text">{t('context')}</p>
            <p className="zone-context__text">{tZones('coverage', { zone: t('name'), areas })}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
