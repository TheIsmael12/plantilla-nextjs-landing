'use client';

import { useSyncExternalStore } from 'react';

import {
    getCookieConsentSnapshot,
    getServerCookieConsentSnapshot,
    subscribeToCookieConsent,
    type CookieConsentCategories,
} from '@/lib/cookieConsent';

/**
 * Lee, ya en el navegador, la decisión de cookies guardada y la mantiene al
 * día. Comparte la misma fuente que el banner ({@link CookieConsentController})
 * y el arranque de Google Tag Manager (`lib/cookieConsent.ts`), así que un
 * componente que dependa de una categoría reacciona sin su propia copia de la
 * clave.
 *
 * Hoy no lo usa nadie: el único consumidor del consentimiento es el arranque
 * de GTM, que lee `lib/cookieConsent.ts` directamente porque tiene que hacerlo
 * antes de que React monte nada. Se deja aquí para el primer componente que
 * necesite condicionar algo a una categoría. Lo que **no** es —lo decía este
 * comentario y era falso— es la puerta del mapa de contacto: sus teselas las
 * sirve Esri en cuanto se pinta la página, sin pasar por ninguna categoría;
 * está declarado como tercero en la política de cookies.
 *
 * Devuelve `null` mientras el visitante no ha decidido (o el almacenamiento no
 * está disponible), que quien lo consume trata como «nada opcional aceptado».
 *
 * Va con `useSyncExternalStore` y no con `useState` + `useEffect`, que es como
 * estaba. El motivo de fondo es el mismo de antes —el servidor no tiene
 * `localStorage`, así que la decisión no se puede leer al montar el estado sin
 * provocar un desajuste de hidratación—, pero hacerlo con un efecto que llama a
 * `setState` obliga a pintar dos veces en cada montaje: primero `null` y luego
 * el valor bueno. Con una decisión ya guardada, eso es un parpadeo del mapa y
 * de cualquier otra cosa que dependa de una categoría, en todas las páginas
 * donde aparezca. La regla de hooks lo marca por eso, y no por capricho.
 *
 * `useSyncExternalStore` está hecho exactamente para esto: recibe el
 * `subscribe` que ya existía, la lectura del cliente y —el tercer argumento,
 * que es el que resuelve la hidratación— la del servidor, que devuelve `null`.
 * React pinta el HTML del servidor con `null` y, en cuanto hidrata, ya usa el
 * valor real sin un render intermedio.
 * @returns {CookieConsentCategories | null} Las categorías aceptadas, o `null` si aún no hay decisión
 */
export function useCookieConsent(): CookieConsentCategories | null {
    return useSyncExternalStore(
        subscribeToCookieConsent,
        getCookieConsentSnapshot,
        getServerCookieConsentSnapshot,
    );
}
