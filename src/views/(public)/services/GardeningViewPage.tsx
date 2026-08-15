import ServiceJsonLd from '@/components/seo/ServiceJsonLd';
import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailZones from '@/components/ui/services/ServiceDetailZones';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

interface GardeningViewPageProps {
  locale: string;
}

/**
 * Ficha del servicio de jardinería: hero, datos de confianza, cada
 * sub-servicio explicado en detalle y con foto propia (poda y arbolado,
 * riego automático, céspedes y zonas ornamentales, retirada de restos
 * vegetales), cómo es el proceso de contratación, enlaces a los demás
 * servicios y una llamada a la acción de cierre hacia contacto.
 *
 * También añade datos estructurados `Service` propios de esta ficha
 * (`ServiceJsonLd.tsx`), auditoría SEO externa punto 15.
 * @param {GardeningViewPageProps} props - El locale actual
 * @returns {JSX.Element} La ficha de jardinería renderizada
 */
export default function GardeningViewPage({ locale }: GardeningViewPageProps) {
  return (
    <main className="services">
      <ServiceJsonLd slug="gardening" locale={locale} />
      <ServiceDetailHero slug="gardening" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="gardening" />
      <ServiceDetailFaq slug="gardening" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="gardening" />
      <ServiceDetailOthers slug="gardening" />
    </main>
  );
}
