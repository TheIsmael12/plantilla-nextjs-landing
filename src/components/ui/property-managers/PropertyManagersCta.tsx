import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';

/**
 * Banda de cierre de la landing para administradores de fincas: llamada a la acción hacia
 * `/contact`, sin repetir dirección/teléfono de urgencias (`AboutCta.tsx` sí los muestra, pero
 * hoy son valores de fallback pendientes de sustituir por los reales — ver requisitos-seo.md
 * §1 —, así que esta página los omite en vez de propagar un dato ficticio a una página nueva).
 * @returns {JSX.Element} La sección de cierre renderizada
 */
export default function PropertyManagersCta() {
  const t = useTranslations('ForPropertyManagers.cta');

  return (
    <section className="about__cta">
      <div className="about__container">
        <p className="about__eyebrow">{t('eyebrow')}</p>
        <h2 className="about__title-lg">{t('title')}</h2>
        <p className="about__text-muted">{t('subtitle')}</p>

        <Link href="/contact" className="about__btn about__btn--accent">
          {t('button')}
        </Link>
      </div>
    </section>
  );
}
