import Image from 'next/image';
import { Clock, Headset, ReceiptText, Repeat, ShieldCheck, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/featureMosaicSection.scss';

/**
 * Mosaico de ventajas de la home: seis tarjetas con distinto tamaño y
 * composición que resumen los diferenciales del servicio (equipo propio,
 * flexibilidad horaria, sustituciones, atención 24h, presupuesto cerrado e
 * inspección de calidad).
 *
 * La tarjeta ancha ya no habla de "financiación sin intereses": ese aplazamiento del 40% de
 * la facturación no es una condición comercial real todavía, solo contenido de demo — dejarlo
 * como claim definitivo en la home habría sido una promesa que la empresa no puede cumplir hoy.
 * Sustituida por "presupuesto cerrado, sin sorpresas", contenido ya verificado y coherente con
 * `Contact.trust`/`Services.detail.ctaCardLabel`.
 * @returns {JSX.Element} La sección de mosaico renderizada
 */
export default function FeatureMosaicSection() {
  const t = useTranslations('Home.mosaic');

  return (
    <section className="home__mosaic">
      <div className="home__container">
        <div className="home__mosaic-header">
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('subtitle')}</p>
        </div>

        <div className="home__mosaic-grid">
          <article className="home__tile home__tile--portrait">
            <div className="home__tile-copy home__tile-copy--stacked">
              <span className="home__tile-icon">
                <Sparkles size={20} />
              </span>
              <div className="home__tile-text">
                <h3>{t('cards.experts.title')}</h3>
                <p>{t('cards.experts.description')}</p>
              </div>
            </div>
            <div className="home__tile-media">
              <Image
                src="/images/home/mosaic-experts.png"
                alt={t('cards.experts.imageAlt')}
                fill
                sizes="(max-width: 1024px) 100vw, 30vw"
                className="home__tile-image"
              />
            </div>
          </article>

          <article className="home__tile home__tile--model">
            <div className="home__tile-copy">
              <span className="home__tile-icon">
                <Clock size={20} />
              </span>
              <div className="home__tile-text">
                <h3>{t('cards.model.title')}</h3>
                <p>{t('cards.model.description')}</p>
              </div>
            </div>
          </article>

          <article className="home__tile home__tile--business">
            <div className="home__tile-copy home__tile-copy--inline">
              <span className="home__tile-icon">
                <Repeat size={20} />
              </span>
              <div className="home__tile-text">
                <h3>{t('cards.business.title')}</h3>
                <p>{t('cards.business.description')}</p>
              </div>
            </div>
            <Image
              src="/images/assets/decor/mosaic-bag.svg"
              alt=""
              width={170}
              height={170}
              className="home__tile-decor home__tile-decor--bag"
            />
          </article>

          <article className="home__tile home__tile--support">
            <div className="home__tile-copy">
              <span className="home__tile-icon">
                <Headset size={20} />
              </span>
              <div className="home__tile-text">
                <h3>{t('cards.support.title')}</h3>
                <p>{t('cards.support.description')}</p>
              </div>
            </div>
          </article>

          <article className="home__tile home__tile--feature">
            <div className="home__tile-feature-content">
              <div className="home__tile-copy">
                <span className="home__tile-icon">
                  <ShieldCheck size={20} />
                </span>
                <div className="home__tile-text">
                  <h3>{t('cards.feature.title')}</h3>
                </div>
              </div>
              <p className="home__tile-feature-summary">{t('cards.feature.description')}</p>
            </div>
            <div className="home__tile-feature-media">
              <Image
                src="/images/home/mosaic-feature.jpg"
                alt={t('cards.feature.imageAlt')}
                width={256}
                height={181}
                sizes="(min-width: 1024px) 256px, (min-width: 640px) 45vw, 70vw"
                className="home__tile-feature-image"
              />
            </div>
          </article>

          <article className="home__tile home__tile--wide">
            <div className="home__tile-copy home__tile-copy--wide">
              <span className="home__tile-icon">
                <ReceiptText size={20} />
              </span>
              <div className="home__tile-text">
                <h3>{t('cards.quote.title')}</h3>
                <p>{t('cards.quote.description')}</p>
              </div>
            </div>
            <Image
              src="/images/assets/decor/mosaic-leaf.svg"
              alt=""
              width={128}
              height={160}
              className="home__tile-decor home__tile-decor--leaf"
            />
          </article>
        </div>
      </div>
    </section>
  );
}

