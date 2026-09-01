"use client";

import { useEffect, useId, useState } from "react";

/**
 * Las capas abiertas ahora mismo, de la más antigua a la más reciente.
 *
 * Vive fuera de React a propósito: la pregunta que contesta —«¿soy yo la de arriba?»— es global a la
 * pantalla, y pasarla por contexto obligaría a envolver la aplicación entera en un proveedor para algo que
 * no tiene estado que renderizar.
 */
const stack: string[] = [];

/** A quién hay que avisar cuando la pila cambia. */
const listeners = new Set<() => void>();

/** Avisa a todas las capas de que la pila ha cambiado, para que recalculen si mandan ellas. */
function notify(): void {
  for (const listener of listeners) listener();
}

/**
 * Registra una capa superpuesta —un modal, un panel lateral— y dice si es la de arriba.
 *
 * Existe porque **abrir un modal desde dentro de un panel lateral rompía los dos**. Cada uno atrapa el foco
 * y escucha la tecla de escape y el clic fuera por su cuenta, y con los dos abiertos:
 *
 * - Escape cerraba **los dos a la vez**, así que se perdía el formulario de debajo.
 * - El modal se dibuja en la raíz del documento, no dentro del panel, así que para el panel **cualquier clic
 *   dentro del modal caía fuera** y se cerraba solo, dejando el modal huérfano encima.
 * - Los dos atrapaban el foco, y el tabulador saltaba de uno a otro.
 *
 * Con esto, la regla es la que espera cualquiera: **manda la de arriba**. La de debajo se queda quieta hasta
 * que la de encima se cierra, y entonces vuelve a responder.
 * Devuelve también **en qué piso está**, y eso es lo que hace que se vea bien: cada capa se pinta por encima
 * de la anterior. Sin ello las dos usaban el mismo `z-index` y decidía el orden del documento, así que el
 * panel lateral se veía **por encima** del fondo oscuro del modal que él mismo había abierto.
 * @param {boolean} isOpen - Si la capa está abierta; cerrada no entra en la pila
 * @returns {{isTop: boolean, depth: number}} Si manda ella, y en qué piso está
 */
export function useOverlayLayer(isOpen: boolean): { isTop: boolean; depth: number } {
  const id = useId();
  const [layer, setLayer] = useState({ isTop: true, depth: 0 });

  useEffect(() => {
    // Cerrada no cuenta: los modales se montan siempre y deciden luego si se pintan.
    if (!isOpen) return;

    stack.push(id);

    const recalculate = () =>
      setLayer({ isTop: stack.at(-1) === id, depth: Math.max(0, stack.indexOf(id)) });

    listeners.add(recalculate);

    notify();

    return () => {
      const index = stack.indexOf(id);
      if (index !== -1) stack.splice(index, 1);

      listeners.delete(recalculate);
      notify();
    };
  }, [id, isOpen]);

  return layer;
}

/**
 * El `z-index` que le toca a una capa por su piso.
 *
 * Se calcula y no se escribe en el CSS porque el CSS no sabe cuántas capas hay abiertas.
 *
 * Los números salen de la escala de `00-settings/_layers.scss`: el primer modal es 90/91 y cada piso sube
 * dos, así que la banda 90-109 da para diez apilados sin llegar a `$layer-modal-dropdown` (110), que es lo
 * que abre un campo **dentro** del modal de arriba y tiene que verse sobre él.
 * @param {number} depth - El piso, empezando en cero
 * @param {"overlay" | "panel"} part - Si es el fondo oscuro o el contenido
 * @returns {number} El `z-index`
 */
export function overlayZIndex(depth: number, part: "overlay" | "panel"): number {
  return (part === "overlay" ? 90 : 91) + Math.min(depth, 9) * 2;
}
