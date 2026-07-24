import { useTranslations } from 'next-intl';
import { Clock, MapPin, ExternalLink, PhoneCall } from 'lucide-react';

import { ENV } from '@/config/env';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/support/supportInfo.scss';

/**
 * Datos de la sede de Imora: tarjeta con horario completo (oficina +
 * urgencias 24h) y dirección, junto a un mapa real embebido (geocodificado
 * a partir de la dirección), igual que en {@link ContactMapSection} pero
 * en un formato más compacto para la página de soporte.
 * @returns {JSX.Element} La sección de la sede renderizada
 */
export default function SupportInfo() {
  const t = useTranslations('Support.info');

  const fullAddress = `${ENV.COMPANY_ADDRESS}, ${ENV.COMPANY_POSTAL_CODE}, ${ENV.COMPANY_CITY}, ${ENV.COMPANY_COUNTRY}`;
  const mapsHref = `https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress)}`;
  const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

  return (
    <section className="support__info">
      <div className="help__container">
        <div className="support__info-header">
          <p className="help__eyebrow">{t('eyebrow')}</p>
          <h2 className="help__title-lg">{t('title')}</h2>
          <p className="help__text-muted">{t('subtitle')}</p>
        </div>

        <div className="support__info-panel">
          <div className="support__info-card">
            <div className="support__info-fact">
              <Clock aria-hidden="true" />
              <div>
                <p className="support__info-label">{t('scheduleLabel')}</p>
                <p className="support__info-value">{ENV.COMPANY_SCHEDULE}</p>
              </div>
            </div>

            <div className="support__info-fact">
              <PhoneCall aria-hidden="true" />
              <div>
                <p className="support__info-label">{t('emergencyLabel')}</p>
                <p className="support__info-value">
                  <a href={`tel:${ENV.COMPANY_EMERGENCY_PHONE}`} className="support__info-emergency-link">
                    {ENV.COMPANY_EMERGENCY_PHONE}
                  </a>
                </p>
              </div>
            </div>

            <div className="support__info-fact">
              <MapPin aria-hidden="true" />
              <div>
                <p className="support__info-label">{t('addressLabel')}</p>
                <p className="support__info-value">
                  {ENV.COMPANY_ADDRESS}, {ENV.COMPANY_CITY}
                </p>
              </div>
            </div>

            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="support__info-cta">
              <MapPin aria-hidden="true" /> {t('mapCta')}
            </a>
          </div>

          <div className="support__info-frame">
            <iframe
              className="support__info-iframe"
              src={mapEmbedSrc}
              title={t('mapLabel')}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="support__info-badge">
              <ExternalLink aria-hidden="true" /> {t('viewOnMaps')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
