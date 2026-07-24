import { useTranslations } from 'next-intl';
import { FileText, MessageCircle, Users, type LucideIcon } from 'lucide-react';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailProcess.scss';

interface Step {
  key: 'one' | 'two' | 'three';
  icon: LucideIcon;
}

const STEPS: Step[] = [
  { key: 'one', icon: MessageCircle },
  { key: 'two', icon: FileText },
  { key: 'three', icon: Users },
];

/**
 * Cómo trabajamos, en tres pasos: es el mismo proceso de contratación para
 * cualquier servicio, así que este componente se reutiliza tal cual en las
 * seis fichas de servicio.
 * @returns {JSX.Element} El proceso de contratación renderizado
 */
export default function ServiceDetailProcess() {
  const t = useTranslations('Services.process');

  return (
    <section className="services__process">
      <div className="services__container">
        <div className="services__process-header">
          <p className="services__eyebrow">{t('eyebrow')}</p>
          <h2 className="services__title-lg">{t('title')}</h2>
        </div>

        <ol className="services__process-list">
          {STEPS.map(({ key, icon: Icon }, index) => (
            <li className="services__process-step" key={key}>
              <span className="services__process-icon">
                <Icon size={22} />
                <span className="services__process-number">{index + 1}</span>
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
