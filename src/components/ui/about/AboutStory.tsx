import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Code2, Users, Rocket } from 'lucide-react';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutStory.scss';

/*
 * Los dos socios, con su perfil de LinkedIn.
 *
 * La URL va aquí y no en los ficheros de idioma porque **no es una traducción**: es la misma en español y en
 * inglés, y meterla en `views.json` obligaría a mantenerla en dos sitios para que un día se queden distintas.
 * Lo que sí se traduce es el nombre accesible del enlace, que lleva el nombre del socio dentro.
 */
const FOUNDERS = [
  { key: 'tech', Icon: Code2, linkedin: 'https://www.linkedin.com/in/ismael-benabdellah' },
  { key: 'operations', Icon: Users, linkedin: 'https://www.linkedin.com/in/mustafabakhat' },
] as const;

/**
 * "Nuestra historia": por qué nace Imora y quién está detrás — a diferencia del resto de
 * `/sobre-nosotros` (equipo propio, inspección, ventajas), esta sección sí habla en primera
 * persona de la propia empresa, no del servicio. Contenido confirmado directamente por los
 * fundadores (no inventado, a diferencia de las certificaciones ISO retiradas de esta misma
 * página — ver `requisitos-seo.md` §1): Imora nace de aplicar tecnología a un sector
 * tradicionalmente poco digitalizado, fundada por dos socios con roles complementarios
 * (desarrollo de producto y gestión de cartera/personal).
 *
 * **Ya no se anuncia una fecha de lanzamiento.** Estuvo una ventana —«entre septiembre de 2026 y
 * enero de 2027»— y se ha quitado por dos motivos: una fecha en una página que nadie vuelve a
 * tocar envejece sola y pasa a restar credibilidad, y además decía menos de lo que se puede
 * decir. Lo que ocupa su sitio es lo que de verdad sitúa a la empresa: **de nueva constitución,
 * pero con experiencia previa en el sector de la limpieza**.
 *
 * Y eso obligó a reescribir la nota de debajo (`descriptionB`), que decía «no tenemos décadas de
 * trayectoria»: con la experiencia previa por delante, esa frase se contradecía con la de arriba.
 * Se sigue diciendo que la empresa es nueva —no se disimula con lenguaje que sugiera veteranía—
 * pero se distingue lo que es nuevo (la sociedad) de lo que no lo es (el oficio).
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
            {FOUNDERS.map(({ key, Icon, linkedin }) => (
              <li className="about__value-card" key={key}>
                <span className="about__value-icon">
                  <Icon size={22} />
                </span>
                <h3>{t(`founders.${key}.name`)}</h3>
                <p>{t(`founders.${key}.role`)}</p>

                {/*
                  El enlace al perfil, con el nombre del socio dentro de su etiqueta accesible.

                  «LinkedIn» a secas no vale con dos enlaces en la misma sección: un lector de pantalla que los
                  liste seguidos leería «LinkedIn, LinkedIn» y no habría forma de saber cuál es de quién. El SVG va
                  con `alt=""` porque quien lo nombra es el enlace, no la imagen.
                */}
                <a
                  className="about__story-founder-link"
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t('linkedin', { name: t(`founders.${key}.name`) })}
                >
                  <Image src="/images/assets/social/linkedin.svg" alt="" width={18} height={18} />
                </a>
              </li>
            ))}
          </ul>

          <div className="about__story-launch">
            <span className="about__story-launch-icon">
              <Rocket size={20} />
            </span>
            <div>
              <p className="about__story-launch-label">{t('newCompanyLabel')}</p>
              <p className="about__story-launch-value">{t('newCompanyValue')}</p>
            </div>
          </div>
        </div>

        <p className="about__text-muted about__story-note">{t('descriptionB')}</p>
      </div>
    </section>
  );
}
