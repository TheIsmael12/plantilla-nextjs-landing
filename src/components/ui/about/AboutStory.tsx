import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutStory.scss';

/**
 * "Nuestra historia": por qué nace Imora y quién está detrás — a diferencia del resto de
 * `/sobre-nosotros` (equipo propio, inspección, ventajas), esta sección sí habla en primera
 * persona de la propia empresa, no del servicio. Contenido confirmado directamente por los
 * fundadores (no inventado, a diferencia de las certificaciones ISO retiradas de esta misma
 * página — ver `requisitos-seo.md` §1): Imora nace de aplicar tecnología a un sector
 * tradicionalmente poco digitalizado, fundada por dos socios con roles complementarios
 * (desarrollo de producto y gestión de cartera/personal), con lanzamiento previsto para
 * septiembre de 2026 o enero de 2027 — se dice explícitamente que es una empresa nueva, no se
 * disimula con lenguaje que sugiera trayectoria («seguimos mejorando» en vez de «llevamos años»).
 * @returns {JSX.Element} La sección de historia renderizada
 */
export default function AboutStory() {
  const t = useTranslations('About.story');

  return (
    <section className="about__story">
      <div className="about__container about__story-inner">
        <p className="about__eyebrow">{t('eyebrow')}</p>
        <h2 className="about__title-lg">{t('title')}</h2>
        <p className="about__text-muted">{t('descriptionA')}</p>
        <p className="about__text-muted">{t('descriptionB')}</p>
      </div>
    </section>
  );
}
