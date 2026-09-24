'use client';

import { useEffect, useState } from 'react';

import {
    readCookieConsent,
    subscribeToCookieConsent,
    type CookieConsentCategories,
} from '@/lib/cookieConsent';

/**
 * Lee, ya en el navegador, la decisión de cookies guardada y la mantiene al
 * día. Comparte la misma fuente que el banner ({@link CookieConsentController})
 * y el arranque de Google Tag Manager (`lib/cookieConsent.ts`), así que un
 * componente que dependa de una categoría —p. ej. el mapa de contacto, que
 * carga teselas de un tercero— reacciona sin su propia copia de la clave.
 *
 * Devuelve `null` mientras el visitante no ha decidido (o el almacenamiento no
 * está disponible), que quien lo consume trata como «nada opcional aceptado».
 * Se lee en un efecto y no en el estado inicial porque el servidor no tiene
 * `localStorage`: rellenar allí daría valores distintos en servidor y en
 * cliente, que es un desajuste de hidratación.
 * @returns {CookieConsentCategories | null} Las categorías aceptadas, o `null` si aún no hay decisión
 */
export function useCookieConsent(): CookieConsentCategories | null {
    const [consent, setConsent] = useState<CookieConsentCategories | null>(null);

    useEffect(() => {
        setConsent(readCookieConsent());
        return subscribeToCookieConsent(setConsent);
    }, []);

    return consent;
}
