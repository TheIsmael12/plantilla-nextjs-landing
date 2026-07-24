"use client";

import { useEffect, useRef } from "react";

import { CheckIcon, MinusIcon } from "lucide-react";

import type { IndeterminateCheckboxProps } from "@/types/ui/tables/table";

/**
 * Checkbox/radio de selección de fila de {@link Table}: soporta el estado
 * indeterminado (parcialmente seleccionado, en la cabecera cuando solo
 * algunas filas de la página están marcadas) y un modo radio (selección
 * única), ya que el atributo HTML `indeterminate` no puede fijarse por JSX,
 * solo imperativamente sobre el nodo del DOM.
 * @param {IndeterminateCheckboxProps} props - Propiedades del componente
 * @returns {JSX.Element} El checkbox/radio de selección renderizado
 */
export default function IndeterminateCheckbox({
  indeterminate,
  checked,
  radio,
  className,
  ...rest
}: IndeterminateCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    /* v8 ignore next -- defensivo: el `<input ref={ref}>` siempre se renderiza junto con este efecto, así que `ref.current` nunca es nulo cuando el efecto corre; solo lo exige la tipación de `useRef<HTMLInputElement>(null)`. */
    if (ref.current) ref.current.indeterminate = indeterminate ?? false;
  }, [indeterminate]);

  const modifier = indeterminate
    ? " table__checkbox--indeterminate"
    : checked
      ? " table__checkbox--checked"
      : "";

  return (
    <label
      className={`table__checkbox${radio ? " table__checkbox--radio" : ""}${modifier}${className ? ` ${className}` : ""}`}
    >
      <input ref={ref} type={radio ? "radio" : "checkbox"} checked={checked} {...rest} />
      <span className="table__checkbox__box">
        {indeterminate ? <MinusIcon /> : <CheckIcon />}
      </span>
    </label>
  );
}
