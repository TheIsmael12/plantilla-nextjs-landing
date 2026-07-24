import { useTranslations } from 'next-intl';

import ServicesHero from '@/components/ui/services/ServicesHero';
import ServicesGrid from '@/components/ui/services/ServicesGrid';
import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';
import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';
import HelpCta from '@/components/ui/help/HelpCta';

/**
 * Página de servicios: hero, datos de confianza, cuadrícula con los seis
 * servicios reales de Imora (cada uno con enlace a su propia ficha), cómo
 * es el proceso de contratación y una llamada a la acción de cierre hacia
 * el formulario de contacto.
 * @returns {JSX.Element} La página de servicios renderizada
 */
export default function ServicesViewPage() {
  const t = useTranslations('Services.detail');

  return (
    <main className="services">
      <ServicesHero />
      <ServiceDetailTrust />
      <ServicesGrid />
      <ServiceDetailProcess />
      <HelpCta
        eyebrow={t('ctaTitle')}
        title={t('ctaSubtitle')}
        buttonLabel={t('ctaButton')}
        href="/contact"
      />
    </main>
  );
}
