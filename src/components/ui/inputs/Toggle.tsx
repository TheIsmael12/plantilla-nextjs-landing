import "@/styles/04-components/ui/inputs/toggle.scss";

import type { ToggleProps } from "@/types/ui/inputs/toggle";

/**
 * Interruptor (switch) de tipo checkbox con etiqueta y descripción opcionales.
 * @param {ToggleProps} props - Propiedades del componente
 * @returns {JSX.Element} El interruptor renderizado
 */
export default function Toggle({
  id,
  name,
  label,
  description,
  ariaLabel,
  checked,
  onChange,
  disabled,
}: ToggleProps) {
  return (
    <div className="toggle__group">
      {(label || description) && (
        <div className="toggle__info">
          {label && <span className="toggle__label">{label}</span>}
          {description && (
            <span className="toggle__description">{description}</span>
          )}
        </div>
      )}
      <label className="toggle" aria-label={label || ariaLabel}>
        <input
          id={id}
          name={name}
          type="checkbox"
          role="switch"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="toggle__slider" />
      </label>
    </div>
  );
}
