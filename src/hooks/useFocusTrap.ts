"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Cómo se reconoce un panel que vive en un portal pero pertenece a lo que está abierto.
 *
 * Lo ponen los desplegables que se portan a `document.body` para no quedar recortados dentro del modal: el
 * calendario de una fecha, la lista de un `Select`, el buscador de un `SelectSearch`. Es el mismo atributo que
 * usa `useOutsideClick` para no cerrar el modal al pulsar dentro de uno de ellos, y se reutiliza aquí a
 * propósito: si un nodo ya está marcado como «esto es mío aunque esté fuera», esa marca sirve igual para el
 * foco que para el ratón.
 */
const PORTAL_PANEL_SELECTOR = "[data-outside-click-ignore]";

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
 * El panel portado que está abierto ahora mismo, si hay alguno.
 *
 * Solo puede haber un modal abierto a la vez, así que un panel portado que exista en el documento es de él.
 * @returns {HTMLElement | null} El panel abierto, o `null` si no hay ninguno
 */
function openPortalPanel(): HTMLElement | null {
  return document.querySelector<HTMLElement>(PORTAL_PANEL_SELECTOR);
}

/**
 * Atrapa el foco del teclado dentro de `ref` mientras `isActive` es `true`:
 * `Tab`/`Shift+Tab` circulan entre los elementos focuscapables del contenedor
 * sin escapar de él, y `Escape` invoca `onEscape`. Obligatorio en todo modal
 * (§16 requisitos.md).
 *
 * **Manda la capa de dentro.** Si desde el modal se abre un calendario o un desplegable —que se portan a
 * `document.body` para no quedar recortados—, este atrapado se aparta y deja que el panel se ocupe de Escape
 * y de Tab, que es lo que ya sabe hacer. Era lo que faltaba en los campos «desde» y «hasta»: pulsar Escape
 * para cerrar el calendario cerraba el modal entero, con lo que llevaras escrito dentro.
 * @template T - Tipo del elemento HTML atrapado
 * @param {UseFocusTrapOptions<T>} options - Opciones del atrapado de foco
 * @returns {void} No devuelve nada; solo registra/limpia los listeners de teclado
 */
export function useFocusTrap<T extends HTMLElement>({
  isActive,
  onEscape,
  ref,
}: UseFocusTrapOptions<T>): void {
  /*
   * `onEscape` se lee de una referencia, no de las dependencias del efecto.
   *
   * Casi siempre llega como una flecha en línea (`onEscape={() => setTarget(null)}`), así que cambia de
   * identidad en cada render del padre. Con ella en las dependencias, el efecto se rehacía a cada tecla —y
   * como también movía el foco, **el foco se iba al primer elemento del modal, que es el aspa de cerrar**. Eso
   * es lo que se sentía como «escribes en un campo y te manda al botón de cerrar»: escribías una letra, el
   * padre renderizaba y el foco se largaba.
   */
  const escapeRef = useRef(onEscape);

  // La asignación va en un efecto y no en el render: escribir en una ref mientras se renderiza no está
  // permitido —React puede renderizar y descartar—, y aquí no hace falta: solo tiene que estar al día cuando
  // alguien pulse una tecla, que es siempre después de que el render haya terminado.
  useEffect(() => {
    escapeRef.current = onEscape;
  }, [onEscape]);

  // El foco inicial, **una sola vez** al activarse: mover el foco es una acción, no un estado que sincronizar.
  useEffect(() => {
    if (!isActive) return;

    ref.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, [isActive, ref]);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      /*
       * Con un panel portado abierto, este atrapado **se aparta por completo**.
       *
       * El calendario ya sabe qué hacer con las dos teclas: Escape se cierra a sí mismo y Tab se cierra
       * devolviendo el foco a su campo, para que el tabulador siga desde ahí. Lo único que hacía falta era
       * que el modal no se le adelantara — antes, Escape para cerrar el calendario cerraba el modal entero.
       */
      if (openPortalPanel()) return;

      if (event.key === "Escape") {
        escapeRef.current();
        return;
      }

      if (event.key !== "Tab") return;

      const scope = ref.current;
      if (!scope) return;

      const focusable = Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
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

    /*
     * En **fase de captura**, no de burbuja.
     *
     * React atiende sus propios manejadores antes de que la burbuja llegue a `document`, y en un evento de
     * teclado el estado se aplica de inmediato: cuando este listener se ejecutaba en burbuja, el calendario ya
     * se había desmontado y `openPortalPanel()` no encontraba nada, así que el modal se cerraba "porque no
     * había ningún panel abierto" cuando lo había habido un instante antes. En captura se pregunta con el
     * panel todavía en el documento.
     */
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isActive, ref]);
}
