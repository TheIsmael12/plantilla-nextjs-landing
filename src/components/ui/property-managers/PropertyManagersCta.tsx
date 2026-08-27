import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutCta.scss';

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
      <div className="about__container about__cta-simple">
        <p className="about__eyebrow">{t('eyebrow')}</p>
        <h2 className="about__title-lg">{t('title')}</h2>
        <p className="about__text-muted">{t('subtitle')}</p>

        <Link href="/contact" className="about__btn about__btn--accent">
          {t('button')}
        </Link>

        {/*
          El camino de vuelta a las zonas, que estaba cortado.
          Desde aquí se llegaba a los servicios pero no a los municipios, y la primera pregunta de un administrador
          es si llegamos a donde tiene las fincas. Sin este enlace había que salir al menú a buscarlo.
        */}
        <p className="about__cta-alt">
          {t('zonesPrefix')}{' '}
          <Link href="/zones" className="about__cta-alt-link">
            {t('zonesLink')}
          </Link>
        </p>
      </div>
    </section>
  );
}
