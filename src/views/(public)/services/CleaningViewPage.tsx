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

interface CleaningViewPageProps {
  locale: string;
}

/**
 * Ficha del servicio de limpieza y jardinería: hero, datos de confianza,
 * cada sub-servicio explicado en detalle y con foto propia (limpieza de
 * zonas comunes, cristales, jardinería y suministro de material), cómo es
 * el proceso de contratación, enlaces a los demás servicios y una llamada
 * a la acción de cierre hacia contacto.
 *
 * También añade datos estructurados `Service` propios de esta ficha
 * (`ServiceJsonLd.tsx`), auditoría SEO externa punto 15.
 * @param {CleaningViewPageProps} props - El locale actual
 * @returns {JSX.Element} La ficha de limpieza renderizada
 */
export default function CleaningViewPage({ locale }: CleaningViewPageProps) {
  return (
    <main className="services">
      <ServiceJsonLd slug="cleaning" locale={locale} />
      <ServiceDetailHero slug="cleaning" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="cleaning" />
      <ServiceDetailAudience slug="cleaning" />
      <ServiceDetailScope slug="cleaning" />
      <ServiceDetailFaq slug="cleaning" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="cleaning" />
      <ServiceDetailOthers slug="cleaning" />
    </main>
  );
}
