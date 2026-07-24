"use client";

import { useEffect } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Opciones de {@link useFocusTrap}.
 * @interface UseFocusTrapOptions
 * @template T - Tipo del elemento HTML atrapado (p. ej. `HTMLDialogElement`)
 * @property {boolean} isActive - Si el atrapado de foco está activo; se desactiva al cerrar el modal/dropdown
 * @property {() => void} onEscape - Handler invocado al pulsar la tecla Escape mientras el atrapado está activo
 * @property {RefObject<T | null>} ref - Referencia al contenedor cuyo foco debe atraparse
 */
export interface UseFocusTrapOptions<T extends HTMLElement> {
  isActive: boolean;
  onEscape: () => void;
  ref: RefObject<T | null>;
}

/**
 * Atrapa el foco del teclado dentro de `ref` mientras `isActive` es `true`:
 * `Tab`/`Shift+Tab` circulan entre los elementos focuscapables del contenedor
 * sin escapar de él, y `Escape` invoca `onEscape`. Obligatorio en todo modal
 * (§16 requisitos.md).
 * @template T - Tipo del elemento HTML atrapado
 * @param {UseFocusTrapOptions<T>} options - Opciones del atrapado de foco
 * @returns {void} No devuelve nada; solo registra/limpia los listeners de teclado
 */
export function useFocusTrap<T extends HTMLElement>({
  isActive,
  onEscape,
  ref,
}: UseFocusTrapOptions<T>): void {
  useEffect(() => {
    if (!isActive) return;

    const container = ref.current;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
        return;
      }

      if (event.key !== "Tab" || !container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActive, onEscape, ref]);
}
