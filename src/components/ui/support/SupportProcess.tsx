import { useTranslations } from 'next-intl';
import { MessageCircle, Timer, Users, type LucideIcon } from 'lucide-react';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/support/supportProcess.scss';

interface Step {
  key: 'one' | 'two' | 'three';
  icon: LucideIcon;
}

const STEPS: Step[] = [
  { key: 'one', icon: MessageCircle },
  { key: 'two', icon: Users },
  { key: 'three', icon: Timer },
];

/**
 * Explica, en tres pasos reales y en orden, qué ocurre desde que se
 * escribe a soporte hasta que se recibe respuesta.
 * @returns {JSX.Element} Los pasos del proceso de soporte renderizados
 */
export default function SupportProcess() {
  const t = useTranslations('Support.process');

  return (
    <section className="support__process">
      <div className="help__container">
        <div className="support__process-header">
          <p className="help__eyebrow">{t('eyebrow')}</p>
          <h2 className="help__title-lg">{t('title')}</h2>
        </div>

        <ol className="support__process-list">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li className="support__process-step" key={key}>
              <span className="support__process-icon">
                <Icon size={22} />
                <span className="support__process-number">{index + 1}</span>
              </span>
              <h3>{t(`steps.${key}.title`)}</h3>
              <p>{t(`steps.${key}.description`)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
