'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import { MapPin, Phone, PhoneCall, Mail, Clock, ExternalLink } from 'lucide-react';

import { ENV } from '@/config/env';
import { useIsMounted } from '@/hooks/useIsMounted';
import {
  COMPANY_ADDRESS_SHORT,
  COMPANY_COORDINATES,
  toTelHref,
} from '@/utils/companyAddressUtils';
import { buildMapsHref, buildFallbackMapsHref } from '@/utils/mapLinkUtils';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactMapSection.scss';

/*
 * El lienzo se carga solo en el navegador: Leaflet toca `window` al importarse, y `'use
 * client'` no evita el render en servidor. Mismo arreglo que el resto de canvases de Leaflet
 * del proyecto (`LocationMapCanvas.tsx`, `ServiceDetailZonesCanvas.tsx`).
 */
const ContactMapCanvas = dynamic(() => import('@/components/ui/contact/ContactMapCanvas'), {
  ssr: false,
});

/**
 * Sección de contacto: una tarjeta compacta con los datos de contacto
 * (dirección, teléfono, email y horario, con enlaces `tel:`/`mailto:`) sobre
 * un mapa real a todo lo ancho (Leaflet + CARTO Voyager, mismo tileset que
 * el mapa de zonas de cobertura de la ficha de servicio), con acceso directo
 * para abrir la ubicación en la app de mapas nativa del visitante (Apple
 * Maps en iOS/macOS, Google Maps en cualquier otro caso).
 * @param {ContactMapSectionProps} props - Propiedades de la sección; por defecto usan `ENV`
 * @returns {JSX.Element} La sección de mapa y contacto renderizada
 */
export default function ContactMapSection({
    address = COMPANY_ADDRESS_SHORT,
    phone = ENV.COMPANY_PHONE,
    email = ENV.COMPANY_EMAIL,
    schedule = ENV.COMPANY_SCHEDULE,
    emergencyPhone = ENV.COMPANY_EMERGENCY_PHONE,
}: ContactMapSectionProps) {

    const t = useTranslations('Contact.map');

    /*
     * La dirección que se enseña llega ya montada de `companyAddressUtils` y aquí solo se le añade el
     * país, que hace falta para buscarla en un mapa pero no para leerla en pantalla.
     *
     * Antes esta pantalla la recomponía por su cuenta con cuatro variables de `ENV`, y ponía la ciudad y
     * la provincia una detrás de otra: con la sede en la capital, eso se leía «Madrid, Madrid».
     */
    const fullAddress = `${address}, ${ENV.COMPANY_COUNTRY}`;

    /*
     * En servidor no hay `navigator`, así que el primer render (y la hidratación) usan un
     * enlace neutro (Google Maps web, que abre en cualquier dispositivo aunque no sea la app
     * nativa) para no desajustar el HTML entre servidor y cliente. Ya hidratado se pasa al
     * enlace nativo del sistema operativo real del visitante.
     *
     * Se lee `useIsMounted()` **durante el render** en vez de hacer `setState` en un efecto,
     * que es como estaba: eso es justo lo que persigue la regla `react-hooks/set-state-in-effect`
     * y además provocaba un render de más. El hook existe para esto y lleva el motivo escrito.
     */
    const isMounted = useIsMounted();

    const mapsHref = isMounted
        ? buildMapsHref(fullAddress, COMPANY_COORDINATES)
        : buildFallbackMapsHref(fullAddress, COMPANY_COORDINATES);

    return (

        <div className="contact__map">

            {/* ── Info card ── */}
            <div className="contact__map-card">

                <div className="contact__map-heading">
                    <p className="contact__map-label">{t('label')}</p>
                    <h2 className="contact__map-title">{t('title')}</h2>
                </div>

                <ul className="contact__map-items">

                    <li className="contact__map-item">
                        <MapPin className="contact__map-item-icon" aria-hidden="true" />
                        <span className="contact__map-item-value">{address}</span>
                    </li>

                    <li className="contact__map-item">
                        <Phone className="contact__map-item-icon" aria-hidden="true" />
                        <a href={toTelHref(phone)} className="contact__map-item-value">
                            {phone}
                        </a>
                    </li>

                    <li className="contact__map-item">
                        <Mail className="contact__map-item-icon" aria-hidden="true" />
                        <a href={`mailto:${email}`} className="contact__map-item-value">
                            {email}
                        </a>
                    </li>

                    {emergencyPhone && (
                        <li className="contact__map-item">
                            <PhoneCall className="contact__map-item-icon" aria-hidden="true" />
                            <a href={toTelHref(emergencyPhone)} className="contact__map-item-value">
                                {t('emergencyLabel')}: {emergencyPhone}
                            </a>
                        </li>
                    )}

                    {schedule && (
                        <li className="contact__map-item">
                            <Clock className="contact__map-item-icon" aria-hidden="true" />
                            <span className="contact__map-item-value">{schedule}</span>
                        </li>
                    )}

                </ul>

                <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact__map-cta"
                >
                    <MapPin aria-hidden="true" /> {t('cta')}
                </a>

            </div>

            {/*
              ── Mapa real, a todo lo ancho ──

              Solo si hay coordenadas configuradas. Sin ellas no se pinta: un mapa centrado en un
              punto inventado es peor que no tener mapa, porque parece un dato. La dirección y el
              enlace a Maps —que entonces busca por la dirección escrita— siguen estando arriba.
            */}
            {COMPANY_COORDINATES && (
                <div className="contact__map-frame">

                    <ContactMapCanvas
                        latitude={COMPANY_COORDINATES.latitude}
                        longitude={COMPANY_COORDINATES.longitude}
                        title={fullAddress}
                    />

                    <a
                        href={mapsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact__map-badge"
                    >
                        <ExternalLink aria-hidden="true" /> {t('viewOnMaps')}
                    </a>

                </div>
            )}

        </div>

    )

}
