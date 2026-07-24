import "@/styles/04-components/ui/inputs/radio-group.scss";

import { RadioGroupProps } from "@/types/ui/radio-group/radio-group";

/**
 * Grupo de opciones tipo radio con estilo de sistema de diseño propio. `label`
 * y `description` se muestran como cabecera del grupo (mismo patrón que
 * `Toggle`), para que quede claro qué controla antes de elegir una opción.
 * @param {RadioGroupProps} props - Propiedades del componente
 * @returns {JSX.Element} El grupo de radios renderizado
 */
export default function RadioGroup({
  name,
  value,
  options,
  onChange,
  disabled,
  label,
  description,
  className,
}: RadioGroupProps) {
  return (
    <div
      className={`radio-group__field${className ? ` ${className}` : ""}`}
      role="group"
      aria-label={label}
    >
      {(label || description) && (
        <div className="radio-group__info">
          {label && <span className="radio-group__label">{label}</span>}
          {description && (
            <span className="radio-group__description">{description}</span>
          )}
        </div>
      )}

      <div className="radio-group">
        {options.map((opt) => (
          <label
            key={opt.value}
            className={[
              "radio-group__option",
              value === opt.value ? "radio-group__option--active" : "",
              disabled ? "radio-group__option--disabled" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              disabled={disabled}
              onChange={() => !disabled && onChange(opt.value)}
            />
            <span className="radio-group__option__indicator" aria-hidden="true" />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}
