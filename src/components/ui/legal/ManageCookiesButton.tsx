'use client';

import { Settings2 } from 'lucide-react';

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
        window.dispatchEvent(new Event('na:open-cookie-consent'));
    };

    return (
        <button className="legal__manage-btn" onClick={handleClick}>
            <Settings2 size={15} aria-hidden="true" />
            {label}
        </button>
    );
}
