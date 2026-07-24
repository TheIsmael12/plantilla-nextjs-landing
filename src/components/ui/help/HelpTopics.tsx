import { useTranslations } from 'next-intl';
import { ArrowRight, HelpCircle, LifeBuoy, type LucideIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/help/helpTopics.scss';

type TopicKey = 'faq' | 'support';

interface Topic {
  key: TopicKey;
  icon: LucideIcon;
  href: '/help/faq' | '/help/support';
}

const TOPICS: Topic[] = [
  { key: 'faq', icon: HelpCircle, href: '/help/faq' },
  { key: 'support', icon: LifeBuoy, href: '/help/support' },
];

/**
 * Las dos puertas de entrada del centro de ayuda: preguntas frecuentes
 * (respuesta inmediata) y soporte para clientes (trato directo con el
 * equipo).
 * @returns {JSX.Element} Las tarjetas de temas de ayuda renderizadas
 */
export default function HelpTopics() {
  const t = useTranslations('Help.topics');

  return (
    <section className="help__topics">
      <div className="help__container help__topics-grid">
        {TOPICS.map(({ key, icon: Icon, href }) => (
          <Link href={href} className="help__topic-card" key={key}>
            <span className="help__topic-icon" aria-hidden="true">
              <Icon size={24} />
            </span>
            <h2>{t(`${key}.title`)}</h2>
            <p>{t(`${key}.description`)}</p>
            <span className="help__topic-cta">
              {t(`${key}.cta`)}
              <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
