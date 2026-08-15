import { useTranslations } from 'next-intl';
import { UserCheck, ShieldCheck, ClipboardCheck, Building2 } from 'lucide-react';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutValues.scss';

const BENEFITS = [
  { key: 'singlePoint', Icon: UserCheck },
  { key: 'substitutions', Icon: ShieldCheck },
  { key: 'inspection', Icon: ClipboardCheck },
  { key: 'scalable', Icon: Building2 },
] as const;

/**
 * Sección de beneficios de la landing para administradores de fincas: qué gana su despacho
 * al concentrar los servicios de varias comunidades en un único proveedor. Cada beneficio
 * deriva de algo ya real y publicado en `About.values` (equipo propio, sustituciones
 * garantizadas, departamento de inspección) — no promete nada que la empresa no diga ya en
 * otra parte del sitio, solo lo reformula desde la perspectiva de quien gestiona varias
 * fincas a la vez, en vez de una sola comunidad.
 * @returns {JSX.Element} La sección de beneficios renderizada
 */
export default function PropertyManagersBenefits() {
  const t = useTranslations('ForPropertyManagers.benefits');

  return (
    <section className="about__values">
      <div className="about__container">
        <div className="about__values-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
        </div>

        <ul className="about__values-grid">
          {BENEFITS.map(({ key, Icon }) => (
            <li className="about__value-card" key={key}>
              <span className="about__value-icon">
                <Icon size={22} />
              </span>
              <h3>{t(`items.${key}.title`)}</h3>
              <p>{t(`items.${key}.description`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
