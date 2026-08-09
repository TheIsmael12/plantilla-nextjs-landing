import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Tipos HTML soportados por {@link Input}.
 * @typedef {("text"|"email"|"password"|"number"|"tel"|"url"|"search"|"date"|"time"|"datetime-local")} InputType
 */
export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  // Los horarios de puerta y la vigencia de una credencial son los primeros
  // campos del portal que editan hora: `text` con patrón obligaría a teclear
  // "08:00" a mano en vez de usar el selector nativo del navegador.
  | "time"
  | "datetime-local";

/**
 * Props de {@link Input}.
 * @interface InputProps
 * @property {string} id - Id del campo, usado para asociar el `label` (`htmlFor`)
 * @property {string} name - Nombre del campo, usado por Formik para el binding
 * @property {string} [label] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`
 * @property {string} [ariaLabel] - `aria-label` del input nativo
 * @property {string} [accept] - Atributo `accept` nativo (tipos de fichero aceptados)
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {InputType} [type] - Tipo HTML del campo; determina el comportamiento especial de `password` (toggle mostrar/ocultar) y `search` (icono por defecto); por defecto "text"
 * @property {string} [placeholder] - Clave de traducción (namespace `Placeholders`) o texto literal si `noTranslate` es `true`
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error de Yup/servidor; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {string} [value] - Valor controlado del campo; por defecto una cadena vacía
 * @property {ChangeEventHandler<HTMLInputElement>} onChange - Handler de cambio
 * @property {FocusEventHandler<HTMLInputElement>} [onBlur] - Handler de blur, usado por Formik para marcar `touched`
 * @property {KeyboardEventHandler<HTMLInputElement>} [onKeyDown] - Handler de teclado
 * @property {boolean} [readonly] - Muestra el valor pero impide su edición
 * @property {number} [min] - Valor mínimo (tipos numéricos/fecha)
 * @property {number} [max] - Valor máximo (tipos numéricos/fecha)
 * @property {number} [maxLength] - Longitud máxima del texto
 * @property {number} [minLength] - Longitud mínima del texto
 * @property {boolean} [disabled] - Deshabilita el campo
 * @property {string} [className] - Clases CSS del contenedor del input, sustituyendo la clase por defecto `input__full`
 * @property {LucideIcon} [icon] - Icono renderizado dentro del campo; si no se indica y `type` es `search`, se usa `SearchIcon` por defecto
 * @property {boolean} [noTranslate] - Si es `true`, `label`/`placeholder` se usan tal cual, sin pasar por next-intl
 * @property {string} [autoComplete] - Atributo `autoComplete` nativo; por defecto "off"
 */
export interface InputProps {
  id: string;
  name: string;
  label?: string;
  ariaLabel?: string;
  accept?: string;
  required?: boolean;
  type?: InputType;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  value?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  readonly?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
  noTranslate?: boolean;
  autoComplete?: string;
}
