import { useTranslations } from 'next-intl';

import FaqHero from '@/components/ui/faq/FaqHero';
import FaqAccordion from '@/components/ui/faq/FaqAccordion';
import HelpCta from '@/components/ui/help/HelpCta';

/**
 * Página de preguntas frecuentes: hero, lista de preguntas y respuestas
 * ({@link FaqAccordion}) y una llamada a la acción de cierre hacia el
 * formulario de contacto para quien no encuentre su respuesta.
 * @returns {JSX.Element} La página de FAQ renderizada
 */
export default function FaqViewPage() {
  const t = useTranslations('Faq');

  return (
    <main className="faq help">
      <FaqHero />
      <FaqAccordion />
      <HelpCta
        eyebrow={t('ctaLabel')}
        title={t('ctaTitle')}
        buttonLabel={t('ctaButton')}
        href="/contact"
      />
    </main>
  );
}
