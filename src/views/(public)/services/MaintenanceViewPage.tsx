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

interface MaintenanceViewPageProps {
  locale: string;
}

/**
 * Ficha del servicio de mantenimiento de edificios: hero, datos de
 * confianza, cada sub-servicio explicado en detalle y con foto propia
 * (fontanería, electricidad, cerrajería y pequeñas obras), cómo es el
 * proceso de contratación, enlaces a los demás servicios y una llamada a
 * la acción de cierre hacia contacto.
 *
 * También añade datos estructurados `Service` propios de esta ficha
 * (`ServiceJsonLd.tsx`), auditoría SEO externa punto 15.
 * @param {MaintenanceViewPageProps} props - El locale actual
 * @returns {JSX.Element} La ficha de mantenimiento renderizada
 */
export default function MaintenanceViewPage({ locale }: MaintenanceViewPageProps) {
  return (
    <main className="services">
      <ServiceJsonLd slug="maintenance" locale={locale} />
      <ServiceDetailHero slug="maintenance" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="maintenance" />
      <ServiceDetailAudience slug="maintenance" />
      <ServiceDetailFaq slug="maintenance" />
      <ServiceDetailProcess />
      <ServiceDetailCta service="maintenance" />
      <ServiceDetailZones slug="maintenance" />
      <ServiceDetailOthers slug="maintenance" />
    </main>
  );
}
