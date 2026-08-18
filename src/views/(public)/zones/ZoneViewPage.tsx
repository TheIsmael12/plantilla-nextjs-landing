import { notFound } from 'next/navigation';

import { getZoneBySlug, type ZoneSlug } from '@/config/zones';

import ZoneJsonLd from '@/components/seo/ZoneJsonLd';
import ZoneHero from '@/components/ui/zones/ZoneHero';
import ZoneContext from '@/components/ui/zones/ZoneContext';
import ZoneServices from '@/components/ui/zones/ZoneServices';
import ZoneFaq from '@/components/ui/zones/ZoneFaq';
import ZoneNearby from '@/components/ui/zones/ZoneNearby';
import ZoneCta from '@/components/ui/zones/ZoneCta';

interface ZoneViewPageProps {
  slug: string;
  locale: string;
}

/**
 * Página de zona (requisitos-seo.md §4): hero con el municipio y su corona metropolitana,
 * contexto geográfico real (no relleno genérico — lo que evita que sea la misma página con
 * el nombre cambiado), los 6 servicios enlazados con anchor text local, FAQ específica de la
 * zona con `FAQPage` schema, zonas cercanas de la misma corona, y CTA de cierre.
 *
 * También añade `Service`/`areaServed` schema acotado al municipio (`ZoneJsonLd.tsx`),
 * complementando el `LocalBusiness` general que ya lleva toda la web.
 * @param {ZoneViewPageProps} props - El slug de la zona (de la ruta) y el locale actual
 * @returns {JSX.Element} La página de zona renderizada
 */
export default function ZoneViewPage({ slug, locale }: ZoneViewPageProps) {
  const zone = getZoneBySlug(slug);

  if (!zone) notFound();

  const zoneSlug = slug as ZoneSlug;

  return (
    <main className="about">
      <ZoneJsonLd slug={zoneSlug} locale={locale} />
      <ZoneHero slug={zoneSlug} />
      <ZoneContext slug={zoneSlug} />
      <ZoneServices slug={zoneSlug} />
      <ZoneFaq slug={zoneSlug} />
      <ZoneNearby slug={zoneSlug} />
      <ZoneCta slug={zoneSlug} />
    </main>
  );
}
