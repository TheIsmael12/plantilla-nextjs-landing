import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
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
 * @property {string}        [anchor] - Ancla de esta misma página a la que lleva, si lleva a una.
 * @property {boolean}       [toSupport] - Si su enlace va a la página de soporte en vez de al correo.
 * @property {boolean}       [isPrimary] - Si es la acción destacada de la sección.
 */
interface Department {
  key: DepartmentKey;
  icon: LucideIcon;
  email: string;
  anchor?: string;
  toSupport?: boolean;
  isPrimary?: boolean;
}

/*
 * Los tres departamentos **no pesan lo mismo**, y antes se pintaban como si sí.
 *
 * Eran tres tarjetas idénticas con tres `mailto:`, y quien llega a esta página viene por una de dos cosas muy
 * distintas: quiere un presupuesto, o ya es cliente y algo no va bien. Poner las dos al mismo nivel —y las dos
 * detrás de un cliente de correo— deja la decisión entera en manos del visitante y le obliga a redactar un correo
 * en frío para pedir un precio.
 *
 * Ahora cada una lleva **a donde de verdad se resuelve**: comercial al formulario de esta misma página, que es el
 * que abre un presupuesto; atención al cliente a la página de soporte, que explica qué es urgente y qué no; y
 * administración se queda en correo, porque una consulta de una factura es eso. La primera va destacada.
 */
const DEPARTMENTS: Department[] = [
  { key: 'sales', icon: Handshake, email: ENV.COMPANY_SALES_EMAIL, anchor: '#formulario', isPrimary: true },
  { key: 'support', icon: LifeBuoy, email: ENV.COMPANY_SUPPORT_EMAIL, toSupport: true },
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
          {DEPARTMENTS.map(({ key, icon: Icon, email, anchor, toSupport, isPrimary }) => (
            <li
              key={key}
              className={
                isPrimary
                  ? 'contact__department-card contact__department-card--primary'
                  : 'contact__department-card'
              }
            >
              <div className="contact__department-icon">
                <Icon aria-hidden="true" />
              </div>
              <h3 className="contact__department-name">{t(`${key}.name`)}</h3>
              <p className="contact__department-description">{t(`${key}.description`)}</p>

              {/*
                El de soporte va con el `Link` de la navegación y no con un `<a>`: es una ruta interna, y un ancla
                normal se saltaría el prefijo de idioma y dejaría al visitante en la versión equivocada de la página.
                El ancla del formulario y el correo sí son `<a>`, porque no son rutas.
              */}
              {toSupport ? (
                <Link href="/help/support" className="contact__department-link">
                  {t(`${key}.cta`)}
                </Link>
              ) : (
                <a href={anchor ?? `mailto:${email}`} className="contact__department-link">
                  {t(`${key}.cta`)}
                </a>
              )}
            </li>
          ))}
        </ul>

      </div>
    </section>

  );

}
