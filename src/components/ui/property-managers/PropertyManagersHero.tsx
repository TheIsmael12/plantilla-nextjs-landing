import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/about/aboutBase.scss';
import '@/styles/04-components/about/aboutHero.scss';

/**
 * Hero de la landing dirigida a administradores de fincas (requisitos-seo.md §6): titular,
 * subtítulo, llamada a la acción hacia contacto, con el mismo marco visual que el hero de
 * "Sobre nosotros" — reutiliza las clases `about__*` en vez de duplicar el sistema de estilos
 * para una página nueva del mismo peso visual.
 *
 * La imagen es `about/approach.jpg` (técnico revisando una instalación), reutilizada a
 * propósito: no hay ninguna foto pensada específicamente para este segmento en
 * `public/images/`, y es temáticamente coherente con la idea de inspección/seguimiento que
 * transmite esta página, mejor que inventar una imagen que no existe o forzar la de un
 * servicio concreto (conserjería, limpieza...) que no representa a un administrador de fincas.
 * @returns {JSX.Element} El hero de la página renderizado
 */
export default function PropertyManagersHero() {
  const t = useTranslations('ForPropertyManagers.hero');

  return (
    <section className="about__hero">
      <div className="about__container about__hero-grid">
        <div className="about__hero-copy">
          <p className="about__eyebrow">{t('eyebrow')}</p>
          <h1 className="about__hero-title">{t('title')}</h1>
          <p className="about__hero-subtitle">{t('subtitle')}</p>

          <Link href="/contact" className="about__btn about__btn--accent">
            {t('cta')}
          </Link>
        </div>

        <div className="about__hero-media">
          <div className="about__hero-media-frame">
            <Image
              src="/images/about/approach.jpg"
              alt={t('imageAlt')}
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="about__hero-image"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
