import { useTranslations } from 'next-intl';
import { ClipboardList, MessageSquareWarning, FileSpreadsheet, Repeat, type LucideIcon } from 'lucide-react';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailProcess.scss';

interface Step {
  key: 'onboarding' | 'incidents' | 'billing' | 'scaling';
  icon: LucideIcon;
}

const STEPS: Step[] = [
  { key: 'onboarding', icon: ClipboardList },
  { key: 'incidents', icon: MessageSquareWarning },
  { key: 'billing', icon: FileSpreadsheet },
  { key: 'scaling', icon: Repeat },
];

/**
 * Cómo funciona el día a día trabajando con Imora desde la perspectiva de un administrador de
 * fincas — distinto del proceso genérico de contratación (`ServiceDetailProcess.tsx`, 3 pasos
 * pensados para una única comunidad): aquí cubre el ciclo completo de gestionar una cartera —
 * alta de una finca, reporte de incidencias multi-comunidad, facturación separada por finca y
 * cómo escala al incorporar una comunidad nueva. Reutiliza las clases `services__process-*`
 * (mismo criterio cross-namespace que `PropertyManagersFaq.tsx`).
 * @returns {JSX.Element} El proceso de trabajo renderizado
 */
export default function PropertyManagersProcess() {
  const t = useTranslations('ForPropertyManagers.process');

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
