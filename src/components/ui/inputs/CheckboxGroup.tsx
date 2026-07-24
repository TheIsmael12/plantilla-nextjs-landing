"use client";

import "@/styles/04-components/ui/inputs/checkbox-group.scss";

import Button from "@/components/ui/buttons/Button";

import { CheckboxGroupProps } from "@/types/ui/inputs/checkbox-group";

import { CheckIcon } from "lucide-react";

/**
 * Grupo de casillas de selección múltiple, con un botón "Seleccionar todo"/
 * "Deseleccionar todo" bajo las opciones que alterna según si ya están todas
 * marcadas. A diferencia de `Select` con `multiple` (un desplegable), aquí
 * todas las opciones son visibles a la vez.
 * @param {CheckboxGroupProps} props - Propiedades del componente
 * @returns {JSX.Element} El grupo de casillas renderizado
 */
export default function CheckboxGroup({
  name,
  value,
  options,
  onChange,
  disabled,
  label,
  description,
  className,
}: CheckboxGroupProps) {
  const allSelected = options.length > 0 && options.every((opt) => value.includes(opt.value));

  const toggleAll = () => {
    onChange(allSelected ? [] : options.map((opt) => opt.value));
  };

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  };

  return (
    <div
      className={`checkbox-group__field${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
      {(label || description) && (
        <div className="checkbox-group__info">
          {label && <span className="checkbox-group__label">{label}</span>}
          {description && (
            <span className="checkbox-group__description">{description}</span>
          )}
        </div>
      )}

      <div className="checkbox-group">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={[
              "checkbox-group__option",
              value.includes(opt.value) ? "checkbox-group__option--active" : "",
              disabled ? "checkbox-group__option--disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="checkbox"
              name={name}
              value={opt.value}
              checked={value.includes(opt.value)}
              disabled={disabled}
              onChange={() => !disabled && toggleOption(opt.value)}
            />
            <span className="checkbox-group__option__indicator" aria-hidden="true">
              <CheckIcon />
            </span>
            {opt.label}
          </label>
        ))}
      </div>

      <Button
        size="sm"
        title={allSelected ? "deselectAll" : "selectAll"}
        disabled={disabled || options.length === 0}
        onClick={toggleAll}
      />
    </div>
  );
}
