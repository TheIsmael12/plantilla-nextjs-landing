import { useTranslations } from 'next-intl';
import { Handshake, LifeBuoy, Receipt, type LucideIcon } from 'lucide-react';

import { ENV } from '@/config/env';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactDepartments.scss';

/**
 * DepartmentKey identifica cada departamento de contacto disponible.
 * @typedef {("sales"|"support"|"billing")} DepartmentKey
 */
type DepartmentKey = 'sales' | 'support' | 'billing';

/**
 * Department describe un departamento de contacto: su icono y el correo al
 * que dirige su enlace `mailto:`. El nombre, la descripción y el texto del
 * enlace se resuelven vía `next-intl` a partir de `key`.
 * @interface Department
 * @property {DepartmentKey} key   - Clave del departamento, usada para resolver sus textos en `Contact.departments`.
 * @property {LucideIcon}    icon  - Icono representativo del departamento.
 * @property {string}        email - Dirección de correo del departamento.
 */
interface Department {
  key: DepartmentKey;
  icon: LucideIcon;
  email: string;
}

const DEPARTMENTS: Department[] = [
  { key: 'sales', icon: Handshake, email: ENV.COMPANY_SALES_EMAIL },
  { key: 'support', icon: LifeBuoy, email: ENV.COMPANY_SUPPORT_EMAIL },
  { key: 'billing', icon: Receipt, email: ENV.COMPANY_BILLING_EMAIL },
];

/**
 * Sección de contacto que dirige a cada visitante al departamento adecuado
 * (comercial, atención al cliente o administración) mediante enlaces
 * `mailto:` directos.
 * @returns {JSX.Element} La sección de departamentos renderizada
 */
export default function ContactDepartments() {
  const t = useTranslations('Contact.departments');

  return (

    <section className="contact__departments">
      <div className="contact__container">

        <div className="contact__departments-header">
          <p className="contact__eyebrow">{t('eyebrow')}</p>
          <h2 className="contact__title-lg">{t('title')}</h2>
        </div>

        <ul className="contact__departments-grid">
          {DEPARTMENTS.map(({ key, icon: Icon, email }) => (
            <li key={key} className="contact__department-card">
              <div className="contact__department-icon">
                <Icon aria-hidden="true" />
              </div>
              <h3 className="contact__department-name">{t(`${key}.name`)}</h3>
              <p className="contact__department-description">{t(`${key}.description`)}</p>
              <a href={`mailto:${email}`} className="contact__department-link">
                {t(`${key}.cta`)}
              </a>
            </li>
          ))}
        </ul>

      </div>
    </section>

  );

}
