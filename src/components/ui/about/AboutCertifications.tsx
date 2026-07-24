import Image from 'next/image';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutCertifications.scss';

const CERTS = ['iso9001', 'iso14001', 'iso45001', 'iso27001'] as const;
const CERT_FILES: Record<(typeof CERTS)[number], string> = {
  iso9001: 'iso-9001',
  iso14001: 'iso-14001',
  iso45001: 'iso-45001',
  iso27001: 'iso-27001',
};

/**
 * Sección de certificaciones de About: las cuatro normas ISO de la empresa
 * (ya mostradas de forma compacta en la cinta de confianza de la home),
 * aquí con el significado de cada una.
 * @returns {JSX.Element} La sección de certificaciones renderizada
 */
export default function AboutCertifications() {
  const t = useTranslations('About.certifications');

  return (
    <section className="about__certifications">
      <div className="about__container">
        <div className="about__certifications-header">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h2 className="about__title-lg">{t('title')}</h2>
          <p className="about__text-muted">{t('subtitle')}</p>
        </div>

        <ul className="about__certifications-grid">
          {CERTS.map((cert) => (
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
