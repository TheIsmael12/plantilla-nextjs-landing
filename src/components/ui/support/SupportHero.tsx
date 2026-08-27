import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/support/supportHero.scss';

/**
 * Hero de la página de soporte: titular y subtítulo dirigidos a quien ya es
 * cliente de Imora y necesita resolver una incidencia o duda.
 * @returns {JSX.Element} El hero de soporte renderizado
 */
export default function SupportHero() {
  const t = useTranslations('Support.hero');

  return (
    <section className="support__hero">
      <Image
        src="/images/assets/decor/scribble.svg"
        alt=""
        width={200}
        height={200}
        className="support__hero-decor"
      />
      <div className="help__container support__hero-inner">
        <p className="help__eyebrow">{t('eyebrow')}</p>
        <h1 className="help__title-lg">{t('title')}</h1>
        <p className="help__text-muted">{t('subtitle')}</p>

        {/*
          La salida para quien **no** es cliente, arriba del todo.

          Toda esta página está escrita para quien ya tiene servicio contratado, y quien no lo tiene llegaba igual
          —desde el buscador o desde el menú de Ayuda— y se encontraba un teléfono de urgencias y un formulario de
          incidencias que no le sirven de nada. Decirlo en una línea, con su enlace, cuesta menos que dejarle
          recorrer la página entera para descubrir que se ha equivocado de sitio.
        */}
        <p className="support__hero-alt">
          {t('notClientPrefix')}{' '}
          <Link href="/contact" className="support__hero-alt-link">
            {t('notClientLink')}
          </Link>
        </p>
      </div>
    </section>
  );
}
