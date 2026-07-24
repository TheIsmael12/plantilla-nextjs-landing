import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

/**
 * Ficha del servicio de mantenimiento de edificios: hero, datos de
 * confianza, cada sub-servicio explicado en detalle y con foto propia
 * (fontanería, electricidad, cerrajería y pequeñas obras), cómo es el
 * proceso de contratación, enlaces a los demás servicios y una llamada a
 * la acción de cierre hacia contacto.
 * @returns {JSX.Element} La ficha de mantenimiento renderizada
 */
export default function MaintenanceViewPage() {
  return (
    <main className="services">
      <ServiceDetailHero slug="maintenance" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="maintenance" />
      <ServiceDetailFaq slug="maintenance" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailOthers slug="maintenance" />
    </main>
  );
}
