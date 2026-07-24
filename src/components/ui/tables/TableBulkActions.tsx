"use client";

import { useRef, useState } from "react";

import { useTranslations } from "next-intl";

import { useOutsideClick } from "@/hooks/useOutsideClick";

import type { TableBulkActionsProps } from "@/types/ui/tables/table";

import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";

/**
 * Contador de filas seleccionadas + menú desplegable de acciones masivas de
 * {@link Table} (a la derecha de la barra de herramientas, solo montado
 * cuando se pasan `actions`). Gestiona su propio estado de apertura: nada
 * fuera de este componente depende de si el menú está abierto.
 * @template TData - Tipo de fila de la tabla
 * @param {TableBulkActionsProps<TData>} props - Propiedades del componente
 * @returns {JSX.Element} El contador de selección y el menú de acciones masivas renderizados
 */
export default function TableBulkActions<TData>({
  actions,
  selectedRows,
  selectedCount,
  onClearSelection,
}: TableBulkActionsProps<TData>) {
  const t = useTranslations("Table");

  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useOutsideClick(ref, {
    onOutsideClick: () => setIsOpen(false),
    isActive: isOpen,
  });

  return (
    <div className="table__toolbar__right" ref={ref}>
      {selectedCount > 0 && (
        <span className="table__selected-count">
          <button
            type="button"
            className="table__selected-count__clear"
            aria-label={t("clearSelection")}
            onClick={onClearSelection}
          >
            <XIcon />
          </button>
          {t("selected", { count: selectedCount })}
        </span>
      )}

      <div className="table__actions">
        <button
          type="button"
          className="table__actions__trigger"
          disabled={selectedCount === 0}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {t("actions")}
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>

        {isOpen && (
          <div className="table__actions__menu" role="menu">
            {actions.map((action) => (
              <button
                key={action.key}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                className={`table__actions__item${
                  action.variant === "danger" ? " table__actions__item--danger" : ""
                }`}
                onClick={() => {
                  action.onClick(selectedRows);
                  setIsOpen(false);
                }}
              >
                {action.icon && <action.icon className="table__actions__item__icon" />}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
