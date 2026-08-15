import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailZones from '@/components/ui/services/ServiceDetailZones';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

/**
 * Ficha del servicio de conserjería y control de accesos: hero, datos de
 * confianza, cada sub-servicio explicado en detalle y con foto propia
 * (recepción, control de accesos, correspondencia y cobertura de bajas),
 * cómo es el proceso de contratación, enlaces a los demás servicios y una
 * llamada a la acción de cierre hacia contacto.
 * @returns {JSX.Element} La ficha de conserjería renderizada
 */
export default function ConciergeViewPage() {
  return (
    <main className="services">
      <ServiceDetailHero slug="concierge" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="concierge" />
      <ServiceDetailFaq slug="concierge" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="concierge" />
      <ServiceDetailOthers slug="concierge" />
    </main>
  );
}
