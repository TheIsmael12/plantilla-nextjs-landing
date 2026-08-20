'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { Clock, MapPin, ExternalLink, PhoneCall } from 'lucide-react';

import { ENV } from '@/config/env';
import { useIsMounted } from '@/hooks/useIsMounted';
import { buildMapsHref, buildFallbackMapsHref } from '@/utils/mapLinkUtils';

import '@/styles/04-components/help/helpBase.scss';
import '@/styles/04-components/support/supportInfo.scss';

/*
 * El lienzo se carga solo en el navegador: Leaflet toca `window` al importarse. Mismo
 * componente que usa `ContactMapSection.tsx` — ambos muestran la misma sede.
 */
const ContactMapCanvas = dynamic(() => import('@/components/ui/contact/ContactMapCanvas'), {
  ssr: false,
});

/**
 * Datos de la sede de Imora: tarjeta con horario completo (oficina +
 * urgencias 24h) y dirección, junto a un mapa real (Leaflet + CARTO Voyager,
 * mismo tileset que {@link ContactMapSection} y el mapa de zonas de
 * cobertura de la ficha de servicio), en un formato más compacto para la
 * página de soporte.
 * @returns {JSX.Element} La sección de la sede renderizada
 */
export default function SupportInfo() {
  const t = useTranslations('Support.info');

  const fullAddress = `${ENV.COMPANY_ADDRESS}, ${ENV.COMPANY_POSTAL_CODE}, ${ENV.COMPANY_CITY}, ${ENV.COMPANY_COUNTRY}`;

  /*
   * En servidor no hay `navigator`, así que el primer render usa un enlace neutro (Google Maps web) y pasa
   * al nativo del sistema operativo real del visitante en cuanto hidrata — mismo criterio que
   * `ContactMapSection.tsx`.
   *
   * Se resuelve leyendo `useIsMounted()` **durante el render** y no con `setState` en un efecto, que es como
   * estaba: eso es exactamente lo que persigue la regla `react-hooks/set-state-in-effect`, y además
   * provocaba un render de más. El hook ya existe para esto y lleva el motivo escrito.
   */
  const isMounted = useIsMounted();

  const mapsHref = isMounted
    ? buildMapsHref(ENV.COMPANY_LATITUDE, ENV.COMPANY_LONGITUDE, fullAddress)
    : buildFallbackMapsHref(ENV.COMPANY_LATITUDE, ENV.COMPANY_LONGITUDE);

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
            <ContactMapCanvas
              latitude={ENV.COMPANY_LATITUDE}
              longitude={ENV.COMPANY_LONGITUDE}
              title={fullAddress}
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
