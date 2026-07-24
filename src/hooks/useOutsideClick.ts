"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

/**
 * Opciones de {@link useOutsideClick}.
 * @interface UseOutsideClickOptions
 * @property {() => void} onOutsideClick - Handler invocado al detectar un click fuera del elemento referenciado
 * @property {boolean} [isActive] - Si la detección está activa; por defecto `true`
 * @property {boolean} [lockScroll] - Si `true`, bloquea el scroll del `body` mientras `isActive` es `true` (uso típico: modales)
 */
export interface UseOutsideClickOptions {
  onOutsideClick: () => void;
  isActive?: boolean;
  lockScroll?: boolean;
}

/**
 * Cierra dropdowns/menús/modales al hacer click fuera del elemento
 * referenciado por `ref`. Obligatorio en todo dropdown/menú contextual
 * (§16 requisitos.md).
 * @param {RefObject<HTMLElement | null>} ref - Referencia al elemento fuera del cual un click dispara `onOutsideClick`
 * @param {UseOutsideClickOptions} options - Opciones de la detección
 * @returns {void} No devuelve nada; solo registra/limpia el listener y, si aplica, el bloqueo de scroll
 */
export function useOutsideClick(
  ref: RefObject<HTMLElement | null>,
  { onOutsideClick, isActive = true, lockScroll = false }: UseOutsideClickOptions,
): void {
  useEffect(() => {
    if (!isActive) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (ref.current && !ref.current.contains(target)) {
        // Elementos portados a `document.body` (paneles de Select/DatePicker/
        // DateRangePicker/SelectSearch) no son descendientes del `ref` aunque
        // estén "dentro" visualmente: se marcan con `data-outside-click-ignore`
        // para que un click en ellos no cierre el contenedor que los renderiza
        // (p. ej. el panel de `Filters`).
        if (
          target instanceof Element &&
          target.closest("[data-outside-click-ignore]")
        ) {
          return;
        }

        onOutsideClick();
      }
    };

    document.addEventListener("mousedown", handleClick);

    if (lockScroll) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("mousedown", handleClick);
        document.body.style.overflow = previousOverflow;
      };
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, onOutsideClick, isActive, lockScroll]);
}