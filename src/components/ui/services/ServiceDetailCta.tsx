import { useTranslations } from 'next-intl';
import { CheckCircle2, Handshake, PhoneCall } from 'lucide-react';

import { Link } from '@/i18n/navigation';
import { ENV } from '@/config/env';

import '@/styles/04-components/services/servicesBase.scss';
import '@/styles/04-components/services/serviceDetailCta.scss';

const PILLS = ['ctaPillAvailability', 'ctaPillGuarantee'] as const;

/**
 * Banda de cierre de las páginas de servicios: más contundente que la
 * genérica `HelpCta` de ayuda/soporte, en dos columnas como `HomeCtaPrimary`
 * — a la izquierda la pregunta, el contexto y las mismas garantías (24h,
 * sustituciones) que el resto del sitio; a la derecha una tarjeta de acción
 * con el botón de contacto principal y el teléfono de urgencias como
 * alternativa directa para quien necesita una respuesta inmediata.
 * @returns {JSX.Element} La banda de cierre renderizada
 */
export default function ServiceDetailCta() {
  const t = useTranslations('Services.detail');

  return (
    <section className="services__detail-cta">
      <div className="services__container services__detail-cta-grid">
        <div className="services__detail-cta-copy">
          <p className="services__eyebrow">{t('ctaEyebrow')}</p>
          <h2 className="services__detail-cta-title">{t('ctaTitle')}</h2>
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

            <Link href="/contact" className="services__btn services__btn--accent services__detail-cta-button">
              {t('ctaButton')}
            </Link>

            <div className="services__detail-cta-divider">
              <span>{t('ctaOrLabel')}</span>
            </div>

            <a href={`tel:${ENV.COMPANY_EMERGENCY_PHONE}`} className="services__detail-cta-urgent">
              <PhoneCall size={16} aria-hidden="true" />
              <span>
                {t('ctaUrgentLabel')} <strong>{ENV.COMPANY_EMERGENCY_PHONE}</strong>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
