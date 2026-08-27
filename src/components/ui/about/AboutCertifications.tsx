import Image from 'next/image';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutCertifications.scss';

/** Normas contempladas, con el nombre del fichero de su sello en `/images/assets/certs`. */
const CERT_FILES = {
  iso9001: 'iso-9001',
  iso14001: 'iso-14001',
  iso45001: 'iso-45001',
  iso27001: 'iso-27001',
} as const;

type CertificationKey = keyof typeof CERT_FILES;

/**
 * Las certificaciones que Imora tiene **de verdad**, y por tanto puede enseñar.
 *
 * Está vacía a propósito: hoy no hay ninguna. La sección no está montada en `AboutViewPage` porque las
 * cuatro ISO que mostraba eran placeholder (`requisitos-seo.md` §1), y se dejó el componente para
 * reactivarlo cuando lleguen.
 *
 * Esta lista es el interruptor de esa reactivación: se añade aquí cada norma **el día que se obtiene**, y
 * solo esa aparece. Antes el componente recorría las cuatro fijas, así que volver a montarlo habría vuelto
 * a publicar las cuatro de golpe — incluida alguna que no se tenga. Lo previsible es certificarse en
 * calidad y en las ligadas a la actividad, y que la 27001 se quede fuera; con la lista vacía por defecto,
 * ese caso no depende de que nadie se acuerde de borrar una línea.
 */
const HELD_CERTIFICATIONS: readonly CertificationKey[] = [];

/**
 * Sección de certificaciones de About: cada norma que la empresa tiene acreditada, con su sello y el
 * significado de la norma.
 *
 * No pinta nada mientras `HELD_CERTIFICATIONS` esté vacía, así que se puede montar en la página sin riesgo:
 * aparecerá sola el día que haya algo que enseñar, y nunca una norma que no esté en la lista.
 * @returns {JSX.Element | null} La sección renderizada, o `null` si todavía no hay ninguna certificación
 */
export default function AboutCertifications() {
  const t = useTranslations('About.certifications');

  if (HELD_CERTIFICATIONS.length === 0) return null;

  return (
    <section className="about__certifications">
      <div className="about__container">
        <div className="about__certifications-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
          <p className="about__text-muted">{t('subtitle')}</p>
        </div>

        <ul className="about__certifications-grid">
          {HELD_CERTIFICATIONS.map((cert) => (
            <li className="about__certification-card" key={cert}>
              <Image
                src={`/images/assets/certs/${CERT_FILES[cert]}.png`}
                alt={t(`items.${cert}.code`)}
                width={56}
                height={71}
              />
              <p className="about__certification-code">{t(`items.${cert}.code`)}</p>
              <p className="about__certification-label">{t(`items.${cert}.label`)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
