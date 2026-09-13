"use client";

import "@/styles/04-components/ui/tables/table.scss";

import type { KeyboardEvent } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { RowAction } from "@/types/ui/tables/table";

import { MoreVerticalIcon } from "lucide-react";

interface RowActionsMenuProps {
  actions: RowAction[];
  ariaLabel: string;
}

interface MenuPosition {
  top: number;
  right: number;
  /** El alto que le queda al menú en pantalla. Ver el efecto que lo calcula. */
  maxHeight: number;
}

/** El aire que se le deja a los cantos de la pantalla, en píxeles. */
const VIEWPORT_MARGIN = 8;

/** Y la separación entre el botón y el menú. */
const TRIGGER_GAP = 6;

/**
 * Desplegable de acciones para una única fila de tabla (editar, activar,
 * eliminar...), pensado para tablas sin selección de filas: cuando una
 * tabla sí tiene selección (`selectable`), las acciones se gestionan sobre
 * lo seleccionado con el `actions`/`TableAction` de `Table`, no con este
 * componente. Reutiliza las clases `table__actions__menu`/`__item` del
 * desplegable de acciones masivas de `Table` para que ambos comportamientos
 * compartan el mismo lenguaje visual.
 *
 * El menú se renderiza en un portal a `document.body`, posicionado con
 * coordenadas fijas calculadas a partir del botón disparador: una fila de
 * tabla vive dentro de `.table__scroll` (`overflow-x: auto`, lo que también
 * recorta el eje Y), así que si el menú fuera un hijo normal con
 * `position: absolute` quedaría cortado por ese overflow en vez de flotar
 * sobre el resto de la página.
 */
export default function RowActionsMenu({
  actions,
  ariaLabel,
}: RowActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + TRIGGER_GAP,
      right: window.innerWidth - rect.right,
      maxHeight: window.innerHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_MARGIN,
    });
  }, [isOpen]);

  /*
   * Y luego se corrige **midiendo el menú ya montado**, que es lo único que dice si cabe.
   *
   * El cálculo de arriba solo sabe dónde está el botón, así que abre siempre hacia abajo. En una fila del final de
   * la tabla eso deja el menú por debajo del borde de la pantalla: en un móvil, con la lista larga y la ventana
   * corta, era la mayoría de las filas — el menú se abría donde no se podía ni ver ni pulsar.
   *
   * Aquí ya se puede medir, así que se decide de verdad:
   *
   * - **Si no cabe debajo, se abre hacia arriba.** Y si tampoco cabe arriba, se pega al canto y se le pone un alto
   *   máximo con desplazamiento propio, que es mejor que un trozo de menú inalcanzable.
   * - **Se recorta a lo ancho**, para que un menú ancho junto al borde izquierdo no se salga por ahí. Antes solo se
   *   anclaba por la derecha del botón, sin mirar el ancho del menú.
   *
   * Va en `useLayoutEffect` y no en `useEffect` a propósito: se ejecuta antes de pintar, así que no se ve el salto
   * de la posición mala a la buena. Y termina porque solo escribe estado cuando el número cambia de verdad.
   */
  useLayoutEffect(() => {
    if (!isOpen || !position || !menuRef.current || !triggerRef.current) return;

    const menu = menuRef.current.getBoundingClientRect();
    const trigger = triggerRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - trigger.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
    const spaceAbove = trigger.top - TRIGGER_GAP - VIEWPORT_MARGIN;
    const opensUp = menu.height > spaceBelow && spaceAbove > spaceBelow;

    const top = opensUp
      ? Math.max(VIEWPORT_MARGIN, trigger.top - TRIGGER_GAP - menu.height)
      : trigger.bottom + TRIGGER_GAP;

    // El ancla es la derecha del botón, pero sin dejar que el menú se salga por la izquierda.
    const rightLimit = Math.max(VIEWPORT_MARGIN, window.innerWidth - menu.width - VIEWPORT_MARGIN);
    const right = Math.min(
      Math.max(VIEWPORT_MARGIN, window.innerWidth - trigger.right),
      rightLimit,
    );

    const maxHeight = Math.max(opensUp ? spaceAbove : spaceBelow, 0);

    const isSame =
      Math.abs(top - position.top) < 0.5 &&
      Math.abs(right - position.right) < 0.5 &&
      Math.abs(maxHeight - position.maxHeight) < 0.5;

    if (isSame) return;

    setPosition({ top, right, maxHeight });
  }, [isOpen, position]);

  // El menú vive en un portal al final de `document.body`, así que el orden
  // natural del Tab no lo alcanza al abrirse: hay que llevar el foco al
  // primer ítem a mano en cuanto el menú ya está montado (tras calcular
  // `position`) para que el siguiente Tab caiga dentro de él.
  useEffect(() => {
    if (!isOpen || !position) return;
    const firstEnabledIndex = actions.findIndex((action) => !action.disabled);
    if (firstEnabledIndex === -1) return;
    itemRefs.current[firstEnabledIndex]?.focus();
  }, [isOpen, position, actions]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    // Cierra en scroll/resize en vez de reposicionarse en cada evento: más
    // simple y evita jank; basta con volver a abrirlo si hace falta.
    // `capture: true` es necesario para detectar el scroll interno de
    // `.table__scroll`, que no burbujea hasta `window`.
    const handleViewportChange = () => setIsOpen(false);

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [isOpen]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const enabledIndexes = actions
      .map((action, index) => (action.disabled ? -1 : index))
      .filter((index) => index !== -1);
    if (enabledIndexes.length === 0) return;

    const moveFocusBy = (step: number) => {
      const currentIndex = itemRefs.current.findIndex(
        (el) => el === document.activeElement,
      );
      const currentPos = enabledIndexes.indexOf(currentIndex);
      const nextPos =
        (currentPos + step + enabledIndexes.length) % enabledIndexes.length;
      const nextIndex = enabledIndexes[nextPos];
      /* v8 ignore next -- defensivo: `nextPos` siempre cae dentro de `enabledIndexes` (no vacío en este punto) por el módulo; `noUncheckedIndexedAccess` obliga a comprobarlo igualmente. */
      if (nextIndex === undefined) return;
      itemRefs.current[nextIndex]?.focus();
    };

    switch (event.key) {
      case "Tab":
        // Se atrapa el foco dentro del menú (con bucle) en vez de dejar que
        // escape al final de `document.body`, donde vive el portal.
        event.preventDefault();
        moveFocusBy(event.shiftKey ? -1 : 1);
        break;
      case "ArrowDown":
        event.preventDefault();
        moveFocusBy(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        moveFocusBy(-1);
        break;
      case "Home": {
        event.preventDefault();
        const firstIndex = enabledIndexes[0];
        /* v8 ignore next -- defensivo: `enabledIndexes` nunca está vacío en este punto (se retorna antes si lo está), así que el primer índice siempre existe; `noUncheckedIndexedAccess` obliga a comprobarlo igualmente. */
        if (firstIndex === undefined) break;
        itemRefs.current[firstIndex]?.focus();
        break;
      }
      case "End": {
        event.preventDefault();
        const lastIndex = enabledIndexes[enabledIndexes.length - 1];
        /* v8 ignore next -- defensivo: mismo motivo que en "Home", el último índice siempre existe. */
        if (lastIndex === undefined) break;
        itemRefs.current[lastIndex]?.focus();
        break;
      }
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="table__row-actions__trigger"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <MoreVerticalIcon />
      </button>

      {isOpen &&
        position &&
        createPortal(
          <ul
            ref={menuRef}
            className="table__actions__menu"
            role="menu"
            data-outside-click-ignore=""
            style={{
              position: "fixed",
              top: position.top,
              right: position.right,
              // Con muchas acciones y una ventana corta, el menú se desplaza por dentro en vez de desbordarse.
              maxHeight: position.maxHeight,
              overflowY: "auto",
            }}
            onKeyDown={handleMenuKeyDown}
          >
            {actions.map((action, index) => (
              <li key={action.key} role="presentation">
                <button
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role="menuitem"
                  disabled={action.disabled}
                  className={`table__actions__item${
                    action.variant === "danger" ? " table__actions__item--danger" : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    action.onClick();
                  }}
                >
                  {action.icon && (
                    <action.icon className="table__actions__item__icon" />
                  )}
                  {action.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </>
  );
}
