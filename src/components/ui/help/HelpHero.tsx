import Image from 'next/image';
import { useTranslations } from 'next-intl';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/help/helpHero.scss';

/**
 * Hero de la página de ayuda: punto de entrada al centro de ayuda, con
 * titular y subtítulo que dirigen hacia las preguntas frecuentes o el
 * soporte para clientes.
 * @returns {JSX.Element} El hero de ayuda renderizado
 */
export default function HelpHero() {
  const t = useTranslations('Help.hero');

  return (
    <section className="help__hero">
      <Image
        src="/images/assets/decor/cloud.svg"
        alt=""
        width={220}
        height={220}
        className="help__hero-decor"
      />
      <div className="help__container help__hero-inner">
        <p className="help__eyebrow">{t('eyebrow')}</p>
        <h1 className="help__title-lg">{t('title')}</h1>
        <p className="help__text-muted">{t('subtitle')}</p>
      </div>
    </section>
  );
}
