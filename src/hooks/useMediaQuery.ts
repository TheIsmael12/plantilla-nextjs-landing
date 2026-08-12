"use client";

import { useEffect, useState } from "react";

/**
 * Si una media query se cumple ahora mismo, y se reevalúa al cambiar.
 *
 * Existe para el puñado de componentes que en móvil cambian de **estructura** y no solo de aspecto:
 * un desplegable que pasa a ser una hoja inferior necesita bloquear el scroll de la página y añadir
 * un botón de cerrar, y eso no se puede decidir desde el CSS.
 *
 * Devuelve `false` en el servidor y en el primer render de cliente. No es una limitación que se
 * pueda sortear —el servidor no conoce el ancho de la ventana— así que la regla al usarlo es que
 * `false` tiene que ser el comportamiento seguro: un desplegable normal que luego se convierte en
 * hoja, y no una hoja abierta que luego resulta que no lo era.
 *
 * Se escucha `change` en la propia `MediaQueryList` en vez de `resize` en `window`: el navegador
 * solo avisa cuando el resultado **cambia**, no en cada píxel de un arrastre del borde de la
 * ventana, así que no hace falta ni debounce ni comparar el valor anterior.
 * @param {string} query - La media query, en la misma sintaxis que en CSS (p. ej. `(max-width: 767px)`)
 * @returns {boolean} `true` si se cumple; `false` mientras no se ha montado en cliente
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    // justificación: es el caso legítimo de "sincronizar con un sistema externo". El valor inicial
    // hay que leerlo aquí y no en `useState` porque `window` no existe en el servidor, y hay que
    // volver a leerlo si `query` cambia.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMatches(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener("change", onChange);

    return () => mediaQuery.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
