import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

/**
 * Ficha del servicio de limpieza y jardinería: hero, datos de confianza,
 * cada sub-servicio explicado en detalle y con foto propia (limpieza de
 * zonas comunes, cristales, jardinería y suministro de material), cómo es
 * el proceso de contratación, enlaces a los demás servicios y una llamada
 * a la acción de cierre hacia contacto.
 * @returns {JSX.Element} La ficha de limpieza renderizada
 */
export default function CleaningViewPage() {
  return (
    <main className="services">
      <ServiceDetailHero slug="cleaning" />
      <ServiceDetailTrust />
      <ServiceDetailSubservices slug="cleaning" />
      <ServiceDetailFaq slug="cleaning" />
      <ServiceDetailProcess />
      <ServiceDetailCta />
      <ServiceDetailOthers slug="cleaning" />
    </main>
  );
}
