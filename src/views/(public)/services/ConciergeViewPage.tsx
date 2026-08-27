import ServiceJsonLd from '@/components/seo/ServiceJsonLd';
import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailAudience from '@/components/ui/services/ServiceDetailAudience';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailZones from '@/components/ui/services/ServiceDetailZones';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

interface ConciergeViewPageProps {
  locale: string;
}

/**
 * Ficha del servicio de conserjería y control de accesos: hero, datos de
 * confianza, cada sub-servicio explicado en detalle y con foto propia
 * (recepción, control de accesos, correspondencia y cobertura de bajas),
 * cómo es el proceso de contratación, enlaces a los demás servicios y una
 * llamada a la acción de cierre hacia contacto.
 *
 * También añade datos estructurados `Service` propios de esta ficha
 * (`ServiceJsonLd.tsx`), auditoría SEO externa punto 15.
 * @param {ConciergeViewPageProps} props - El locale actual
 * @returns {JSX.Element} La ficha de conserjería renderizada
 */
export default function ConciergeViewPage({ locale }: ConciergeViewPageProps) {
  return (
    <main className="services">
      <ServiceJsonLd slug="concierge" locale={locale} />
      <ServiceDetailHero slug="concierge" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="concierge" />
      <ServiceDetailAudience slug="concierge" />
      <ServiceDetailFaq slug="concierge" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="concierge" />
      <ServiceDetailOthers slug="concierge" />
    </main>
  );
}
