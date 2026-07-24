import type { ChangeEventHandler, FocusEventHandler, KeyboardEventHandler } from "react";

/**
 * Props de {@link Textarea}.
 * @interface TextareaProps
 * @property {string} id - Id del campo, usado para asociar el `label` (`htmlFor`)
 * @property {string} name - Nombre del campo, usado por Formik para el binding
 * @property {string} [label] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`
 * @property {string} [ariaLabel] - `aria-label` del textarea nativo
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {string} [placeholder] - Clave de traducción (namespace `Placeholders`) o texto literal si `noTranslate` es `true`
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error de Yup/servidor; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {string} [value] - Valor controlado del campo; por defecto una cadena vacía
 * @property {ChangeEventHandler<HTMLTextAreaElement>} onChange - Handler de cambio
 * @property {FocusEventHandler<HTMLTextAreaElement>} [onBlur] - Handler de blur, usado por Formik para marcar `touched`
 * @property {KeyboardEventHandler<HTMLTextAreaElement>} [onKeyDown] - Handler de teclado
 * @property {number} [rows] - Número de filas visibles; por defecto 5
 * @property {number} [maxLength] - Longitud máxima del texto
 * @property {number} [minLength] - Longitud mínima del texto
 * @property {boolean} [disabled] - Deshabilita el campo
 * @property {boolean} [readonly] - Muestra el valor pero impide su edición
 * @property {string} [className] - Clases CSS adicionales del propio `<textarea>`
 * @property {boolean} [noTranslate] - Si es `true`, `label`/`placeholder` se usan tal cual, sin pasar por next-intl
 * @property {string} [autoComplete] - Atributo `autoComplete` nativo; por defecto "off"
 */
export interface TextareaProps {
  id: string;
  name: string;
  label?: string;
  ariaLabel?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  touched?: boolean;
  value?: string;
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onBlur?: FocusEventHandler<HTMLTextAreaElement>;
  onKeyDown?: KeyboardEventHandler<HTMLTextAreaElement>;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  readonly?: boolean;
  className?: string;
  noTranslate?: boolean;
  autoComplete?: string;
}
