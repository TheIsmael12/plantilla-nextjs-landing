'use client';

import { Settings2 } from 'lucide-react';

import { OPEN_COOKIE_CONSENT_EVENT } from '@/lib/cookieConsent';

type Props = {
    label: string;
};

/**
 * Botón que reabre el banner de consentimiento de cookies emitiendo el
 * evento `na:open-cookie-consent`, escuchado por {@link CookieConsentController}.
 * @param {Props} props Texto del botón
 * @returns {JSX.Element} El botón renderizado
 */
export default function ManageCookiesButton({ label }: Props) {
    const handleClick = () => {
        window.dispatchEvent(new Event(OPEN_COOKIE_CONSENT_EVENT));
    };

    return (
        <button className="legal__manage-btn" onClick={handleClick}>
            <Settings2 size={15} aria-hidden="true" />
            {label}
        </button>
    );
}
