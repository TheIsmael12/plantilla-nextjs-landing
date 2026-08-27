import ServiceJsonLd from '@/components/seo/ServiceJsonLd';
import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailAudience from '@/components/ui/services/ServiceDetailAudience';
import ServiceDetailScope from '@/components/ui/services/ServiceDetailScope';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailZones from '@/components/ui/services/ServiceDetailZones';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

interface PoolsViewPageProps {
  locale: string;
}

/**
 * Ficha del servicio de mantenimiento de piscinas: hero, datos de
 * confianza, cada sub-servicio explicado en detalle y con foto propia
 * (mantenimiento químico, limpieza de vaso y playa, socorrismo y
 * apertura/cierre de temporada), cómo es el proceso de contratación,
 * enlaces a los demás servicios y una llamada a la acción de cierre hacia
 * contacto.
 *
 * También añade datos estructurados `Service` propios de esta ficha
 * (`ServiceJsonLd.tsx`), auditoría SEO externa punto 15.
 * @param {PoolsViewPageProps} props - El locale actual
 * @returns {JSX.Element} La ficha de piscinas renderizada
 */
export default function PoolsViewPage({ locale }: PoolsViewPageProps) {
  return (
    <main className="services">
      <ServiceJsonLd slug="pools" locale={locale} />
      <ServiceDetailHero slug="pools" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="pools" />
      <ServiceDetailAudience slug="pools" />
      <ServiceDetailScope slug="pools" />
      <ServiceDetailFaq slug="pools" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="pools" />
      <ServiceDetailOthers slug="pools" />
    </main>
  );
}
