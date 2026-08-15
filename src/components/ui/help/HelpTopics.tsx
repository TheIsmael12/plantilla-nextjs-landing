import { useTranslations } from 'next-intl';
import { ArrowRight, HelpCircle, LifeBuoy, MegaphoneIcon, type LucideIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/help/helpTopics.scss';

type TopicKey = 'faq' | 'support' | 'complaints';

interface Topic {
  key: TopicKey;
  icon: LucideIcon;
  href: '/help/faq' | '/help/support' | '/help/complaints';
}

const TOPICS: Topic[] = [
  { key: 'faq', icon: HelpCircle, href: '/help/faq' },
  { key: 'support', icon: LifeBuoy, href: '/help/support' },
  // Tercera puerta de entrada: el canal de reclamaciones (requisitos-reclamaciones.md) es
  // distinto de soporte (quejas de servicio o ético/cumplimiento, no dudas de un cliente
  // actual). Enlaza directo al asistente (`/help/complaints`), no a la página informativa
  // (`/complaints-channel`): desde aquí se viene a hacer algo, no a leer sobre el canal —
  // quien quiera la info legal la encuentra enlazada desde dentro del propio asistente si hace falta.
  { key: 'complaints', icon: MegaphoneIcon, href: '/help/complaints' },
];

/**
 * Las puertas de entrada del centro de ayuda: preguntas frecuentes
 * (respuesta inmediata), soporte para clientes (trato directo con el
 * equipo) y el canal de reclamaciones (quejas de servicio o ético/cumplimiento).
 * @returns {JSX.Element} Las tarjetas de temas de ayuda renderizadas
 */
export default function HelpTopics() {
  const t = useTranslations('Help.topics');

  return (
    <section className="help__topics">
      <div className="help__container help__topics-grid">
        {TOPICS.map(({ key, icon: Icon, href }) => (
          <Link href={href} className="help__topic-card" key={key}>
            <span className="help__topic-icon">
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
