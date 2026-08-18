import { useTranslations } from 'next-intl';
import { Code2, Users, Rocket } from 'lucide-react';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutStory.scss';

const FOUNDERS = [
  { key: 'tech', Icon: Code2 },
  { key: 'operations', Icon: Users },
] as const;

/**
 * "Nuestra historia": por qué nace Imora y quién está detrás — a diferencia del resto de
 * `/sobre-nosotros` (equipo propio, inspección, ventajas), esta sección sí habla en primera
 * persona de la propia empresa, no del servicio. Contenido confirmado directamente por los
 * fundadores (no inventado, a diferencia de las certificaciones ISO retiradas de esta misma
 * página — ver `requisitos-seo.md` §1): Imora nace de aplicar tecnología a un sector
 * tradicionalmente poco digitalizado, fundada por dos socios con roles complementarios
 * (desarrollo de producto y gestión de cartera/personal), con lanzamiento entre septiembre de
 * 2026 y enero de 2027 — se dice explícitamente que es una empresa nueva, no se disimula con
 * lenguaje que sugiera trayectoria («seguimos mejorando» en vez de «llevamos años»).
 *
 * Ocupa el mismo sitio de la página donde antes iba `AboutCertifications` (entre "cómo
 * trabajamos" y "ventajas"), con un tratamiento visual equivalente: header centrado + grid de
 * tarjetas debajo, reutilizando `about__value-card`/`about__value-icon` en vez de solo texto
 * plano, más un badge de fecha de lanzamiento como elemento visual propio.
 * @returns {JSX.Element} La sección de historia renderizada
 */
export default function AboutStory() {
  const t = useTranslations('About.story');

  return (
    <section className="about__story">
      <div className="about__container">
        <div className="about__story-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
          <p className="about__text-muted">{t('descriptionA')}</p>
        </div>

        <div className="about__story-grid">
          <ul className="about__story-founders">
            {FOUNDERS.map(({ key, Icon }) => (
              <li className="about__value-card" key={key}>
                <span className="about__value-icon">
                  <Icon size={22} />
                </span>
                <h3>{t(`founders.${key}.name`)}</h3>
                <p>{t(`founders.${key}.role`)}</p>
              </li>
            ))}
          </ul>

          <div className="about__story-launch">
            <span className="about__story-launch-icon">
              <Rocket size={20} />
            </span>
            <div>
              <p className="about__story-launch-label">{t('launchLabel')}</p>
              <p className="about__story-launch-value">{t('launchDate')}</p>
            </div>
          </div>
        </div>

        <p className="about__text-muted about__story-note">{t('descriptionB')}</p>
      </div>
    </section>
  );
}
