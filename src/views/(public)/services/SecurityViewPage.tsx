import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailZones from '@/components/ui/services/ServiceDetailZones';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

/**
 * Ficha del servicio de seguridad y CCTV: hero, datos de confianza, cada
 * sub-servicio explicado en detalle y con foto propia (videovigilancia,
 * control de accesos electrónico, mantenimiento de equipos y respuesta
 * ante incidencias), cómo es el proceso de contratación, enlaces a los
 * demás servicios y una llamada a la acción de cierre hacia contacto.
 * @returns {JSX.Element} La ficha de seguridad renderizada
 */
export default function SecurityViewPage() {
  return (
    <main className="services">
      <ServiceDetailHero slug="security" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="security" />
      <ServiceDetailFaq slug="security" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailZones slug="security" />
      <ServiceDetailOthers slug="security" />
    </main>
  );
}
