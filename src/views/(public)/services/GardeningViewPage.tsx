import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

/**
 * Ficha del servicio de jardinería: hero, datos de confianza, cada
 * sub-servicio explicado en detalle y con foto propia (poda y arbolado,
 * riego automático, céspedes y zonas ornamentales, retirada de restos
 * vegetales), cómo es el proceso de contratación, enlaces a los demás
 * servicios y una llamada a la acción de cierre hacia contacto.
 * @returns {JSX.Element} La ficha de jardinería renderizada
 */
export default function GardeningViewPage() {
  return (
    <main className="services">
      <ServiceDetailHero slug="gardening" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="gardening" />
      <ServiceDetailFaq slug="gardening" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailOthers slug="gardening" />
    </main>
  );
}
