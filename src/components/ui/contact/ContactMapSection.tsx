import { useTranslations } from 'next-intl';
import { MapPin, Phone, PhoneCall, Mail, Clock, ExternalLink } from 'lucide-react';

import { ENV } from '@/config/env';
import '@/styles/04-components/contact/contactBase.scss';
import '@/styles/04-components/contact/contactMapSection.scss';

/**
 * Sección de contacto: una tarjeta compacta con los datos de contacto
 * (dirección, teléfono, email y horario, con enlaces `tel:`/`mailto:`) sobre
 * un mapa embebido real a todo lo ancho (Google Maps, geocodificado a partir
 * de la dirección), con acceso directo para abrirlo en una pestaña nueva.
 * @param {ContactMapSectionProps} props - Propiedades de la sección; por defecto usan `ENV`
 * @returns {JSX.Element} La sección de mapa y contacto renderizada
 */
export default function ContactMapSection({
    address = `${ENV.COMPANY_ADDRESS}, ${ENV.COMPANY_POSTAL_CODE}`,
    city = `${ENV.COMPANY_CITY}, ${ENV.COMPANY_STATE}`,
    phone = ENV.COMPANY_PHONE,
    email = ENV.COMPANY_EMAIL,
    schedule = ENV.COMPANY_SCHEDULE,
    emergencyPhone = ENV.COMPANY_EMERGENCY_PHONE,
}: ContactMapSectionProps) {

    const t = useTranslations('Contact.map');

    const fullAddress = `${address}, ${city}, ${ENV.COMPANY_COUNTRY}`;
    const mapsHref = `https://www.openstreetmap.org/search?query=${encodeURIComponent(fullAddress)}`;
    const mapEmbedSrc = `https://www.google.com/maps?q=${encodeURIComponent(fullAddress)}&output=embed`;

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
                        <span className="contact__map-item-value">{address}, {city}</span>
                    </li>

                    <li className="contact__map-item">
                        <Phone className="contact__map-item-icon" aria-hidden="true" />
                        <a href={`tel:${phone.replace(/\s/g, '')}`} className="contact__map-item-value">
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
                            <a href={`tel:${emergencyPhone.replace(/\s/g, '')}`} className="contact__map-item-value">
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

            {/* ── Mapa real, a todo lo ancho ── */}
            <div className="contact__map-frame">

                <iframe
                    className="contact__map-iframe"
                    src={mapEmbedSrc}
                    title={t('mapTitle')}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
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

        </div>

    )

}
