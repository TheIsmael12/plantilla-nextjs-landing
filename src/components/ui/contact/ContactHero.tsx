import { useTranslations } from 'next-intl';
import { Clock, Users, MapPin, type LucideIcon } from 'lucide-react';

import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactHero.scss';

type HighlightKey = 'response' | 'team' | 'office';

const HIGHLIGHTS: { key: HighlightKey; Icon: LucideIcon }[] = [
  { key: 'response', Icon: Clock },
  { key: 'team', Icon: Users },
  { key: 'office', Icon: MapPin },
];

/**
 * Hero de la página de contacto: titular, subtítulo y, en vez de una franja
 * de confianza aparte, los tres datos que la respaldan (tiempo de
 * respuesta, trato directo, cobertura) integrados aquí mismo.
 * @returns {JSX.Element} El hero de contacto renderizado
 */
export default function ContactHero() {
  const t = useTranslations('Contact.hero');
  const tTrust = useTranslations('Contact.trust');

  return (
    <section className="contact__hero">
      <div className="contact__container contact__hero-inner">
        <p className="contact__eyebrow">{t('eyebrow')}</p>
        <h1 className="contact__hero-title">{t('title')}</h1>
        <p className="contact__hero-subtitle">{t('subtitle')}</p>

        <div className="contact__hero-stats">
          {HIGHLIGHTS.map(({ key, Icon }) => (
            <div className="contact__hero-stat" key={key}>
              <Icon aria-hidden="true" />
              <dl>
                <dt>{tTrust(`${key}.value`)}</dt>
                <dd>{tTrust(`${key}.label`)}</dd>
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
