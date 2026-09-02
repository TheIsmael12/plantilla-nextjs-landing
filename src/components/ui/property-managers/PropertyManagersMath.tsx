'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowRight, Building2, FileText, PhoneCall, Users } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/property-managers/propertyManagers.scss';

/**
 * Los tamaños de cartera por los que se pregunta.
 *
 * Son los mismos tramos con los que después se cualifica el contacto, y no un número exacto: un
 * administrador sabe si lleva «unas veinte» sin tener que contarlas, y pedirle la cifra justa para ver una
 * cuenta aproximada es fricción a cambio de nada.
 */
const PORTFOLIO_SIZES = [
  { key: 'small', communities: 5 },
  { key: 'medium', communities: 20 },
  { key: 'large', communities: 50 },
  { key: 'xlarge', communities: 100 },
] as const;

/**
 * Cuántos servicios lleva una comunidad cuando cada uno va por su cuenta.
 *
 * Cuatro es el caso corriente —conserjería, limpieza, jardinería y mantenimiento— y aquí es un supuesto
 * declarado, no un dato sobre nadie: el texto lo dice en voz alta («si cada comunidad lleva sus cuatro
 * servicios con proveedores distintos»), porque una cuenta que no explica de dónde salen sus números es
 * exactamente lo que esta sección no debe ser.
 */
const SERVICES_PER_COMMUNITY = 4;

/**
 * La cuenta del administrador: lo que se multiplica al repartir la cartera, y lo que no.
 *
 * La comparativa de al lado ya explica **qué** cambia en el día a día, asunto por asunto. Lo que no
 * aparecía en ninguna parte es que eso **se multiplica por el tamaño de la cartera**: un despacho con veinte
 * comunidades y los servicios repartidos no lleva cuatro relaciones, lleva ochenta. Ese salto es el
 * argumento comercial más fuerte de esta página y estaba solo insinuado.
 *
 * Se calcula sobre lo que la persona elige, y por eso no hay aquí ninguna métrica inventada: es una
 * multiplicación, y el único supuesto —cuántos servicios lleva una comunidad— va escrito en la propia
 * sección. La columna de Imora no promete nada nuevo: un interlocutor, un aviso y una factura por comunidad
 * es lo que ya dice la comparativa.
 *
 * Y elegir el tramo hace doble trabajo: enseña la cuenta y viaja al formulario, que es justo la pregunta con
 * la que se cualifica un contacto de este segmento.
 * @returns {JSX.Element} La sección renderizada
 */
export default function PropertyManagersMath() {
  const t = useTranslations('ForPropertyManagers.math');

  const [size, setSize] = useState<(typeof PORTFOLIO_SIZES)[number]>(PORTFOLIO_SIZES[1]);

  const scattered = size.communities * SERVICES_PER_COMMUNITY;

  /** Las cuatro cuentas, cada una con lo que sale a un lado y al otro. */
  const rows = [
    { key: 'contacts', Icon: Users, scattered, imora: 1 },
    { key: 'invoices', Icon: FileText, scattered, imora: size.communities },
    { key: 'channels', Icon: PhoneCall, scattered, imora: 1 },
    { key: 'standards', Icon: Building2, scattered: SERVICES_PER_COMMUNITY, imora: 1 },
  ] as const;

  return (
    <section className="managers__math">
      <div className="services__container">
        <div className="managers__comparison-header">
          <p className="services__eyebrow">{t('eyebrow')}</p>
          <h2 className="services__title-lg">{t('title')}</h2>
          <p className="managers__comparison-subtitle">{t('subtitle')}</p>
        </div>

        {/*
          Cuántas comunidades lleva, en tramos.
          Es un grupo de radios de verdad y no una fila de botones: son opciones excluyentes de una misma
          pregunta, y un lector de pantalla necesita oír la pregunta antes de las cuatro respuestas.
        */}
        <fieldset className="managers__math-sizes">
          <legend className="managers__math-legend">{t('sizeQuestion')}</legend>

          <div className="managers__math-options">
            {PORTFOLIO_SIZES.map((option) => (
              <label
                key={option.key}
                className={`managers__math-option${
                  option.key === size.key ? ' managers__math-option--active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="portfolioSize"
                  value={option.key}
                  checked={option.key === size.key}
                  onChange={() => setSize(option)}
                  className="managers__math-radio"
                />
                {t(`sizes.${option.key}`)}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="managers__math-grid">
          <div className="managers__math-column">
            <h3 className="managers__math-column-title">{t('scatteredTitle')}</h3>
            <p className="managers__math-column-note">
              {t('scatteredNote', { services: SERVICES_PER_COMMUNITY })}
            </p>

            <ul className="managers__math-list">
              {rows.map(({ key, Icon, scattered: value }) => (
                <li key={key} className="managers__math-item">
                  <Icon size={18} aria-hidden="true" className="managers__math-icon" />
                  <span className="managers__math-number">{value}</span>
                  <span className="managers__math-label">{t(`rows.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="managers__math-column managers__math-column--imora">
            <h3 className="managers__math-column-title">{t('imoraTitle')}</h3>
            <p className="managers__math-column-note">{t('imoraNote')}</p>

            <ul className="managers__math-list">
              {rows.map(({ key, Icon, imora: value }) => (
                <li key={key} className="managers__math-item">
                  <Icon size={18} aria-hidden="true" className="managers__math-icon" />
                  <span className="managers__math-number">{value}</span>
                  <span className="managers__math-label">{t(`rows.${key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          El tramo elegido viaja al formulario.
          Es la pregunta con la que se cualifica un contacto de este segmento, y aquí ya está contestada:
          volver a preguntarla en el formulario es pedir dos veces lo mismo.
        */}
        <Link
          href={{ pathname: '/contact', query: { portfolio: size.key } }}
          className="managers__math-cta"
        >
          {t('cta')}
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
