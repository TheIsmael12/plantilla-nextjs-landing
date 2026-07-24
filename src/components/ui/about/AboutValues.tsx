import { useTranslations } from 'next-intl';
import { ShieldCheck, Repeat, Users } from 'lucide-react';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutValues.scss';

const VALUES = [
  { key: 'team', Icon: Users },
  { key: 'availability', Icon: ShieldCheck },
  { key: 'substitutions', Icon: Repeat },
] as const;

/**
 * Sección de ventajas de About: tres razones por las que las comunidades
 * confían en Imora (equipo propio, atención 24 horas, sustituciones
 * garantizadas), ya presentes en el mosaico de la home pero aquí en un
 * formato más narrativo.
 * @returns {JSX.Element} La sección de ventajas renderizada
 */
export default function AboutValues() {
  const t = useTranslations('About.values');

  return (
    <section className="about__values">
      <div className="about__container">
        <div className="about__values-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
        </div>

        <ul className="about__values-grid">
          {VALUES.map(({ key, Icon }) => (
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
