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
}

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
      top: rect.bottom + 6,
      right: window.innerWidth - rect.right,
    });
  }, [isOpen]);

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
            style={{ position: "fixed", top: position.top, right: position.right }}
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
