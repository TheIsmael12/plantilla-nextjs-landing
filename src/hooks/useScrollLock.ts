"use client";

import { useEffect } from "react";

/**
 * Cuántas capas piden ahora mismo que la página no se mueva.
 *
 * Se cuenta en vez de poner y quitar el bloqueo a secas porque **las capas se anidan**: un modal abierto
 * desde un panel lateral son dos, y el primero en cerrarse no puede devolver el scroll mientras el otro
 * siga abierto.
 */
let holders = 0;

/** El valor que tenía `overflow` antes de que la primera capa lo tocara. */
let previousOverflow = "";

/**
 * Impide que la página de debajo se mueva mientras una capa está abierta.
 *
 * Estaba dentro de `useOutsideClick`, atado a si esa capa era la que respondía a los clics. Al abrir un modal
 * desde un panel lateral, el panel dejaba de responder —manda el de arriba— y con ello **soltaba el
 * bloqueo**; el modal, que se había montado justo antes, había guardado `hidden` como valor anterior, así que
 * al cerrarse lo dejaba puesto. La página se quedaba sin scroll y solo se arreglaba recargando.
 *
 * Contando quién lo pide, el orden en que se montan y se desmontan deja de importar: se bloquea al primero y
 * se devuelve al último.
 * @param {boolean} isLocked - Si esta capa pide el bloqueo; normalmente, si está abierta
 * @returns {void} No devuelve nada
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    /*
     * La posición se fija a la que había al abrir, no a cero.
     *
     * Quien abre el modal puede haber bajado la página antes, y no hay por qué perder eso. Lo que sí se
     * corrige es el salto **posterior**: el primer elemento enfocado dentro de la capa puede arrastrar al
     * navegador a desplazar la página para traerlo a la vista —innecesario, porque la capa es `fixed`— y eso
     * ocurre en el frame siguiente, así que hay que reafirmar la posición también entonces.
     */
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const restoreScroll = () => window.scrollTo(scrollX, scrollY);

    if (holders === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }

    holders += 1;

    const rafId = requestAnimationFrame(restoreScroll);

    return () => {
      cancelAnimationFrame(rafId);

      holders = Math.max(0, holders - 1);

      // Solo la última capa devuelve el scroll: si queda alguna abierta, la página sigue quieta.
      if (holders === 0) document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
}
