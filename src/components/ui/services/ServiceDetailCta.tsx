import { useTranslations } from 'next-intl';
import { CheckCircle2, Handshake, PhoneCall } from 'lucide-react';

import { Link } from '@/i18n/navigation';

import type { ServiceSlug } from '@/config/routing';
import { ENV } from '@/config/env';
import { toTelHref } from '@/utils/companyAddressUtils';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailCta.scss';

const PILLS = ['ctaPillAvailability', 'ctaPillGuarantee'] as const;

/**
 * Props de {@link ServiceDetailCta}.
 * @interface ServiceDetailCtaProps
 * @property {ServiceSlug} [service] - De qué servicio es la ficha; sin él se usa el cierre genérico
 */
interface ServiceDetailCtaProps {
  service?: ServiceSlug;
}

/**
 * Banda de cierre de las páginas de servicios: más contundente que la
 * genérica `HelpCta` de ayuda/soporte, en dos columnas como `HomeCtaPrimary`
 * — a la izquierda la pregunta, el contexto y las mismas garantías (24h,
 * sustituciones) que el resto del sitio; a la derecha una tarjeta de acción
 * con el botón de contacto principal y el teléfono de urgencias como
 * alternativa directa para quien necesita una respuesta inmediata.
 *
 * **El texto es del servicio, no genérico.** Los seis cerraban con el mismo «Solicitar presupuesto»: quien
 * acaba de leer tres pantallas sobre el mantenimiento de su piscina no está pidiendo un presupuesto en
 * abstracto, está pidiendo eso. Cada ficha trae el suyo (`Services.detail.byService.<slug>`) y, si alguna
 * no lo tuviera, se usa el de siempre — un servicio nuevo no se queda sin botón por no haber escrito la
 * copia todavía.
 *
 * Y el botón **se lleva el servicio al formulario**, igual que la landing de administradores se lleva el
 * tamaño de la cartera: llegar a contacto y tener que elegir otra vez qué servicio interesa es preguntar
 * dos veces lo mismo.
 * @param {ServiceDetailCtaProps} props - De qué servicio es esta ficha
 * @returns {JSX.Element} La banda de cierre renderizada
 */
export default function ServiceDetailCta({ service }: ServiceDetailCtaProps) {
  const t = useTranslations('Services.detail');

  /*
   * El texto propio del servicio, si lo hay.
   *
   * `t.has` en vez de un try/catch alrededor de `t`: una clave que falta no es un caso excepcional aquí,
   * es «esta ficha todavía no tiene copia propia», y eso se pregunta, no se captura.
   */
  const ownKey = service ? `byService.${service}` : null;
  const title = ownKey && t.has(`${ownKey}.title`) ? t(`${ownKey}.title`) : t('ctaTitle');
  const button = ownKey && t.has(`${ownKey}.button`) ? t(`${ownKey}.button`) : t('ctaButton');

  return (
    <section className="services__detail-cta">
      <div className="services__container services__detail-cta-grid">
        <div className="services__detail-cta-copy">
          <p className="services__eyebrow">{t('ctaEyebrow')}</p>
          <h2 className="services__detail-cta-title">{title}</h2>
          <p className="services__text-muted">{t('ctaSubtitle')}</p>

          <ul className="services__detail-cta-pills">
            {PILLS.map((pill) => (
              <li key={pill} className="services__detail-cta-pill">
                <CheckCircle2 size={18} aria-hidden="true" />
                {t(pill)}
              </li>
            ))}
          </ul>

          <Link href="/services" className="services__detail-cta-secondary">
            {t('ctaSecondaryButton')}
          </Link>

          {/*
            El desvío para el administrador de fincas.
            Quien lee una ficha de servicio puede ser una comunidad —que pide presupuesto para la suya— o quien
            gestiona una cartera entera, y a ese lo que le sirve no es este formulario sino la propuesta por cartera.
            Es el eslabón que le faltaba al recorrido servicio → localidad → administrador → contacto.
          */}
          <p className="services__detail-cta-alt">
            {t('ctaManagersPrefix')}{' '}
            <Link href="/for/property-managers" className="services__detail-cta-alt-link">
              {t('ctaManagersLink')}
            </Link>
          </p>
        </div>

        <div className="services__detail-cta-action">
          <div className="services__detail-cta-card">
            <span className="services__detail-cta-icon">
              <Handshake size={22} />
            </span>
            <p className="services__detail-cta-card-label">{t('ctaCardLabel')}</p>

            {/* El servicio viaja al formulario: llegar y volver a elegirlo es preguntar dos veces. */}
            <Link
              href={service ? { pathname: '/contact', query: { service } } : '/contact'}
              className="services__btn services__btn--accent services__detail-cta-button"
            >
              {button}
            </Link>

            {/*
              Sin número configurado no se ofrece la llamada de urgencias.
              Un teléfono inventado en un botón de urgencias es peor que no tener botón: quien lo pulsa a
              las tres de la mañana cree que ha llamado a alguien. Mismo criterio que el mapa de la sede,
              que sin coordenadas no se pinta en vez de caer al centro de Madrid.
            */}
            {ENV.COMPANY_EMERGENCY_PHONE && (
              <>
                <div className="services__detail-cta-divider">
                  <span>{t('ctaOrLabel')}</span>
                </div>

                <a
                  href={toTelHref(ENV.COMPANY_EMERGENCY_PHONE)}
                  className="services__detail-cta-urgent"
                >
                  <PhoneCall size={16} aria-hidden="true" />
                  <span>
                    {t('ctaUrgentLabel')} <strong>{ENV.COMPANY_EMERGENCY_PHONE}</strong>
                  </span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
