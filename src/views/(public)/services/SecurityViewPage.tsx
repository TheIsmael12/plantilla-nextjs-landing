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

interface SecurityViewPageProps {
  locale: string;
}

/**
 * Ficha del servicio de seguridad y CCTV: hero, datos de confianza, cada
 * sub-servicio explicado en detalle y con foto propia (videovigilancia,
 * control de accesos electrónico, mantenimiento de equipos y respuesta
 * ante incidencias), cómo es el proceso de contratación, enlaces a los
 * demás servicios y una llamada a la acción de cierre hacia contacto.
 *
 * También añade datos estructurados `Service` propios de esta ficha
 * (`ServiceJsonLd.tsx`), auditoría SEO externa punto 15.
 * @param {SecurityViewPageProps} props - El locale actual
 * @returns {JSX.Element} La ficha de seguridad renderizada
 */
export default function SecurityViewPage({ locale }: SecurityViewPageProps) {
  return (
    <main className="services">
      <ServiceJsonLd slug="security" locale={locale} />
      <ServiceDetailHero slug="security" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="security" />
      <ServiceDetailAudience slug="security" />
      <ServiceDetailScope slug="security" />
      <ServiceDetailFaq slug="security" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="security" />
      <ServiceDetailOthers slug="security" />
    </main>
  );
}
