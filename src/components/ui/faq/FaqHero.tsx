import Image from 'next/image';
import { useTranslations } from 'next-intl';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/faq/faqHero.scss';

/**
 * Hero de la página de preguntas frecuentes: titular y subtítulo.
 * @returns {JSX.Element} El hero de FAQ renderizado
 */
export default function FaqHero() {
  const t = useTranslations('Faq.hero');

  return (
    <section className="faq__hero">
      <div className="help__container faq__hero-inner">
        <p className="help__eyebrow">{t('eyebrow')}</p>
        <h1 className="help__title-lg">{t('title')}</h1>
        <p className="help__text-muted">{t('subtitle')}</p>
      </div>
    </section>
  );
}
