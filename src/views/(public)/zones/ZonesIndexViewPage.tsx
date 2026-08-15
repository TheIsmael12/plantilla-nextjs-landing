import ZonesIndexJsonLd from '@/components/seo/ZonesIndexJsonLd';
import ZonesIndexHero from '@/components/ui/zones/ZonesIndexHero';
import ZonesIndexGrid from '@/components/ui/zones/ZonesIndexGrid';

interface ZonesIndexViewPageProps {
  locale: string;
}

/**
 * Índice de las 20 páginas de zona (requisitos-seo.md §13, auditoría 2026-08-15): hero ligero,
 * la cuadrícula agrupada por corona metropolitana ({@link ZonesIndexGrid}), y `CollectionPage`/
 * `ItemList` schema con las 20 (auditoría #3, §14) — le dice a Google explícitamente que esto
 * es un listado, no solo texto suelto.
 * @param {ZonesIndexViewPageProps} props - El locale actual
 * @returns {JSX.Element} El índice de zonas renderizado
 */
export default function ZonesIndexViewPage({ locale }: ZonesIndexViewPageProps) {
  return (
    <main className="services">
      <ZonesIndexJsonLd locale={locale} />
      <ZonesIndexHero />
      <ZonesIndexGrid />
    </main>
  );
}
