import { useTranslations } from 'next-intl';

import HelpHero from '@/components/ui/help/HelpHero';
import HelpTopics from '@/components/ui/help/HelpTopics';
import HelpCta from '@/components/ui/help/HelpCta';

/**
 * Página de ayuda: hero de entrada al centro de ayuda, las dos puertas de
 * entrada ({@link HelpTopics}: preguntas frecuentes y soporte) y una
 * llamada a la acción de cierre hacia el formulario de contacto para quien
 * prefiera hablar directamente con el equipo.
 * @returns {JSX.Element} La página de ayuda renderizada
 */
export default function HelpViewPage() {
  const t = useTranslations('Help');

  return (
    <main className="help">
      <HelpHero />
      <HelpTopics />
      <HelpCta
        eyebrow={t('ctaLabel')}
        title={t('ctaTitle')}
        buttonLabel={t('ctaButton')}
        href="/contact"
      />
    </main>
  );
}
