"use client";

import { useSyncExternalStore } from "react";

/** El valor nunca cambia después de hidratar, así que no hay nada a lo que suscribirse. */
const subscribe = () => () => {};

/**
 * Indica si el componente ya se ha montado en cliente. Se usa para evitar
 * parpadeos de hidratación en componentes cuyo render depende de estado solo
 * disponible en cliente (p. ej. el tema resuelto por `next-themes`, o un portal
 * a `document.body`), donde el markup del servidor no puede coincidir con el del
 * cliente.
 *
 * Se resuelve con `useSyncExternalStore` y no con `useState` + `useEffect`, que es como estaba: aquello
 * necesitaba silenciar la regla `set-state-in-effect` con un `eslint-disable`, porque llamar a `setState` en
 * un efecto es justo lo que la regla persigue. Esta forma dice lo mismo sin excepciones — el «estado externo»
 * es literalmente «estoy hidratado», con una instantánea distinta en servidor y en cliente— y evita el render
 * de más que provocaba el `setState`.
 * @returns {boolean} `false` durante el render del servidor y la hidratación, `true` en cliente
 */
export function useIsMounted(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
