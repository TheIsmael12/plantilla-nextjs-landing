import { useTranslations } from 'next-intl';

import SupportHero from '@/components/ui/support/SupportHero';
import SupportRouting from '@/components/ui/support/SupportRouting';
import SupportProcess from '@/components/ui/support/SupportProcess';
import SupportChannels from '@/components/ui/support/SupportChannels';
import SupportInfo from '@/components/ui/support/SupportInfo';
import HelpCta from '@/components/ui/help/HelpCta';

/**
 * Página de soporte: hero dirigido a clientes actuales, enrutado por tipo
 * de consulta ({@link SupportRouting}), qué ocurre tras escribir
 * ({@link SupportProcess}), canales de contacto directo
 * ({@link SupportChannels}), datos de la sede ({@link SupportInfo}) y una
 * llamada a la acción de cierre hacia las preguntas frecuentes.
 * @returns {JSX.Element} La página de soporte renderizada
 */
export default function SupportViewPage() {
  const t = useTranslations('Support.faqPrompt');

  return (
    <main className="support help">
      <SupportHero />
      <SupportRouting />
      <SupportProcess />
      <SupportChannels />
      <SupportInfo />
      <HelpCta
        eyebrow={t('eyebrow')}
        title={t('title')}
        buttonLabel={t('button')}
        href="/help/faq"
      />
    </main>
  );
}
