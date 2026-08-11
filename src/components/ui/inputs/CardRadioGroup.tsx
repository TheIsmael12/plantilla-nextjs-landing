import "@/styles/04-components/ui/inputs/card-radio-group.scss";

import { CheckIcon } from "lucide-react";

import type { CardRadioGroupProps } from "@/types/ui/inputs/card-radio-group";

/**
 * Grupo de opciones tipo radio con estilo de tarjeta: cada opción puede llevar
 * una vista previa visual, un icono y su propia descripción, en vez de un
 * simple punto de radio. Pensado para elecciones pocas y muy visuales (p. ej.
 * tema claro/oscuro), donde ver el resultado ayuda más que leer una etiqueta.
 * @param {CardRadioGroupProps} props - Propiedades del componente
 * @returns {JSX.Element} El grupo de tarjetas seleccionables renderizado
 */
export default function CardRadioGroup({
  name,
  value,
  options,
  onChange,
  disabled,
  label,
  ariaLabel,
  description,
  className,
}: CardRadioGroupProps) {
  return (
    <div
      className={`card-radio-group__field${className ? ` ${className}` : ""}`}
      role="radiogroup"
      // `ariaLabel` para cuando el nombre ya lo pone un encabezado de fuera y repetirlo en pantalla sobraría.
      aria-label={ariaLabel ?? label}
    >
      {(label || description) && (
        <div className="card-radio-group__info">
          {label && <span className="card-radio-group__label">{label}</span>}
          {description && (
            <span className="card-radio-group__description">{description}</span>
          )}
        </div>
      )}

      <div className="card-radio-group">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = value === opt.value;
          const descriptionId = opt.description
            ? `${name}-${opt.value}-description`
            : undefined;

          return (
            <label
              key={opt.value}
              className={[
                "card-radio-group__option",
                isActive ? "card-radio-group__option--active" : "",
                disabled ? "card-radio-group__option--disabled" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <input
                type="radio"
                name={name}
                value={opt.value}
                checked={isActive}
                disabled={disabled}
                aria-describedby={descriptionId}
                onChange={() => !disabled && onChange(opt.value)}
              />

              {opt.preview && (
                <div className="card-radio-group__preview">{opt.preview}</div>
              )}

              <div className="card-radio-group__content">
                {Icon && <Icon className="card-radio-group__icon" />}
                <span className="card-radio-group__text">
                  <span className="card-radio-group__option-label">{opt.label}</span>
                  {opt.description && (
                    // aria-hidden: el texto ya se expone como descripción
                    // accesible vía aria-describedby; si no se oculta aquí,
                    // al estar dentro del <label> pasaría a formar parte
                    // también del nombre accesible del radio (duplicado y,
                    // como las descripciones se mencionan entre sí --p. ej.
                    // "claro" aparece en la descripción de la opción
                    // "oscuro"--, ambigüo para quien lo consulte por nombre).
                    <span
                      id={descriptionId}
                      className="card-radio-group__option-description"
                      aria-hidden="true"
                    >
                      {opt.description}
                    </span>
                  )}
                </span>
              </div>

              {isActive && (
                <span className="card-radio-group__check" aria-hidden="true">
                  <CheckIcon />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
