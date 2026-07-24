/**
 * Opción disponible en {@link Select}.
 * @interface SelectOption
 * @property {string} value - Valor interno de la opción, usado para comparar con `value`/`onChange`
 * @property {string} label - Texto visible de la opción en el listbox
 */
export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Tamaños soportados por {@link Select}.
 * @typedef {("sm"|"md")} SelectSize
 */
export type SelectSize = "sm" | "md";

/**
 * Props comunes a las variantes de selección simple y múltiple de {@link Select}.
 * @interface SelectBaseProps
 * @property {string} [id] - Id del trigger, usado para asociar el `label` y el listbox
 * @property {string} [name] - Nombre del campo, usado en los inputs ocultos para Formik
 * @property {string} [label] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`
 * @property {string} [description] - Breve explicación de qué controla el campo, visible bajo `label` (texto ya traducido, no pasa por `noTranslate`)
 * @property {string} [placeholder] - Clave de traducción (namespace `Placeholders`) o texto literal si `noTranslate` es `true`; se muestra en el trigger mientras no hay ninguna opción seleccionada
 * @property {string} [ariaLabel] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`; `aria-label` del trigger usado como nombre accesible cuando no hay `label` visible
 * @property {SelectOption[]} options - Opciones disponibles en el listbox
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {boolean} [disabled] - Deshabilita el selector e impide abrir el listbox
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error de Yup/servidor; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {SelectSize} [size] - Tamaño visual del selector; por defecto "md"
 * @property {string} [className] - Clases CSS adicionales del contenedor
 * @property {boolean} [noTranslate] - Si es `true`, `label`/`placeholder` se usan tal cual, sin pasar por next-intl
 */
export interface SelectBaseProps {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  ariaLabel?: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  size?: SelectSize;
  className?: string;
  noTranslate?: boolean;
}

/**
 * Props de {@link Select} en modo de selección simple.
 * @interface SelectSingleProps
 * @augments SelectBaseProps
 * @property {false} [multiple] - Desactiva la selección múltiple (comportamiento por defecto)
 * @property {string} value - Valor seleccionado; cadena vacía si no hay selección
 * @property {(value: string) => void} onChange - Handler invocado con el valor de la opción elegida
 */
export interface SelectSingleProps extends SelectBaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props de {@link Select} en modo de selección múltiple.
 * @interface SelectMultipleProps
 * @augments SelectBaseProps
 * @property {true} multiple - Activa la selección múltiple
 * @property {string[]} value - Valores seleccionados
 * @property {(value: string[]) => void} onChange - Handler invocado con la lista completa de valores seleccionados
 */
export interface SelectMultipleProps extends SelectBaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Props de {@link Select}: unión discriminada por `multiple` entre selección simple y múltiple.
 * @typedef {(SelectSingleProps|SelectMultipleProps)} SelectProps
 */
export type SelectProps = SelectSingleProps | SelectMultipleProps;
