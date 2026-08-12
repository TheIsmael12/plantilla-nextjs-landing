"use client";

import "@/styles/04-components/ui/inputs/color-picker.scss";

import { useTranslations } from "next-intl";

import type { ColorOption, ColorPickerProps } from "@/types/ui/inputs/color-picker";

import { BanIcon, CheckIcon } from "lucide-react";

/**
 * La paleta por defecto: seis colores con nombre, no un arcoíris.
 *
 * Salen del catálogo de estados del sistema de diseño (error, aviso, éxito, información) más dos
 * neutros, porque de un color en una lista lo único que se espera entender es la urgencia. Van en
 * hexadecimal y no como variables CSS porque el valor se guarda en la base de datos y tiene que
 * seguir significando lo mismo dentro de dos años.
 */
const DEFAULT_OPTIONS: ColorOption[] = [
  { value: "#B3261E", label: "red" },
  { value: "#C77700", label: "amber" },
  { value: "#2E7D32", label: "green" },
  { value: "#1E3A5F", label: "blue" },
  { value: "#6A1B9A", label: "purple" },
  { value: "#546E7A", label: "slate" },
];

/**
 * Selector de color de una paleta cerrada.
 *
 * **No es un selector libre de color**, y es deliberado: el color aquí es una ayuda para leer una
 * lista de un vistazo, no una decisión de diseño. Con un `<input type="color">` acaban conviviendo
 * quince rojos distintos en la misma pantalla y el color deja de significar nada; con seis
 * opciones con nombre, «el rojo» quiere decir lo mismo en todos los avisos.
 *
 * Cada color se elige con un botón y no con un `radio` nativo porque hay que poder **quitarlo**:
 * volver a pulsar el color ya elegido lo desmarca, igual que la opción explícita de «sin color».
 * Un grupo de radios no se puede desmarcar sin añadir un botón aparte para lo mismo.
 *
 * El nombre viaja como clave de traducción (`Common.Colors.*`), no como texto: el color es el
 * valor, y su nombre depende del idioma de quien mira.
 * @param {ColorPickerProps} props - Propiedades del componente
 * @returns {JSX.Element} El selector renderizado
 */
export default function ColorPicker({
  id,
  name,
  label,
  description,
  value,
  onChange,
  options = DEFAULT_OPTIONS,
  allowEmpty = true,
  emptyLabel,
  disabled,
  className,
}: ColorPickerProps) {
  const t = useTranslations("Common.Colors");

  const nameOf = (option: ColorOption) => (t.has(option.label) ? t(option.label) : option.label);

  return (
    <div className={`color-picker${className ? ` ${className}` : ""}`}>
      {label && (
        <span className="color-picker__label" id={id ? `${id}-label` : undefined}>
          {label}
        </span>
      )}

      {description && <span className="color-picker__description">{description}</span>}

      {/* Oculto y solo para Formik: el valor real lo llevan los botones. */}
      {name && <input type="hidden" name={name} value={value ?? ""} readOnly />}

      <div
        className="color-picker__swatches"
        role="group"
        aria-labelledby={label && id ? `${id}-label` : undefined}
      >
        {allowEmpty && (
          <button
            type="button"
            className={`color-picker__swatch color-picker__swatch--empty${
              value === null ? " color-picker__swatch--selected" : ""
            }`}
            aria-pressed={value === null}
            aria-label={emptyLabel ?? t("none")}
            title={emptyLabel ?? t("none")}
            disabled={disabled}
            onClick={() => onChange(null)}
          >
            <BanIcon aria-hidden="true" />
          </button>
        )}

        {options.map((option) => {
          const isSelected = value?.toUpperCase() === option.value.toUpperCase();

          return (
            <button
              key={option.value}
              type="button"
              className={`color-picker__swatch${isSelected ? " color-picker__swatch--selected" : ""}`}
              /*
                La muestra se pinta con `swatch` si lo trae, y con el propio valor si no.
                Existe para los catálogos que guardan una **variante semántica** (`success`, `error`) en
                vez de un tono: ahí lo que se elige es el significado, el tono lo pone el tema, y sin esta
                separación la muestra intentaría pintarse con la palabra «success» y saldría transparente.
              */
              style={{ backgroundColor: option.swatch ?? option.value }}
              aria-pressed={isSelected}
              aria-label={nameOf(option)}
              title={nameOf(option)}
              disabled={disabled}
              // Volver a pulsar el color ya elegido lo quita: es lo que se intenta por instinto
              // antes de buscar un botón de "ninguno".
              onClick={() => onChange(isSelected ? null : option.value)}
            >
              {isSelected && <CheckIcon aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
