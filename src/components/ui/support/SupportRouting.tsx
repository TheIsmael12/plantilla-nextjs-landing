import { useTranslations } from 'next-intl';
import { Handshake, LifeBuoy, Receipt, type LucideIcon } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { ENV } from '@/config/env';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/support/supportRouting.scss';

type DepartmentKey = 'sales' | 'support' | 'billing';

interface Department {
  key: DepartmentKey;
  icon: LucideIcon;
}

const DEPARTMENTS: Department[] = [
  { key: 'sales', icon: Handshake },
  { key: 'support', icon: LifeBuoy },
  { key: 'billing', icon: Receipt },
];

/**
 * Enrutado de soporte por tipo de consulta: reutiliza los mismos tres
 * departamentos de {@link ContactDepartments} (comercial, atención al
 * cliente, administración) para que quien ya es cliente sepa exactamente
 * con quién hablar, sin repetir la copia en dos sitios distintos.
 * @returns {JSX.Element} Las tarjetas de enrutado por departamento renderizadas
 */
export default function SupportRouting() {
  const t = useTranslations('Support.routing');
  const tDept = useTranslations('Contact.departments');

  return (
    <section className="support__routing">
      <div className="help__container">
        <div className="support__routing-header">
          <h2 className="help__title-lg">{t('title')}</h2>
          <p className="help__text-muted">{t('subtitle')}</p>
        </div>

        <ul className="support__routing-grid">
          {DEPARTMENTS.map(({ key, icon: Icon }) => (
            <li className="support__routing-card" key={key}>
              <div className="support__routing-icon">
                <Icon aria-hidden="true" />
              </div>
              <h3 className="support__routing-name">{tDept(`${key}.name`)}</h3>
              <p className="support__routing-description">{tDept(`${key}.description`)}</p>
              {key === 'sales' ? (
                <Link href="/contact" className="support__routing-link">
                  {tDept(`${key}.cta`)}
                </Link>
              ) : (
                <a
                  href={`mailto:${key === 'support' ? ENV.COMPANY_SUPPORT_EMAIL : ENV.COMPANY_BILLING_EMAIL}`}
                  className="support__routing-link"
                >
                  {tDept(`${key}.cta`)}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
