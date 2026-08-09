import type { InputType } from "@/types/ui/inputs/input";

/**
 * Cómo se listan los valores ya añadidos en {@link TagsInput}:
 *
 * - `tags`: etiquetas redondeadas en línea, que fluyen y saltan de línea. Va bien para
 *   valores cortos y pocos (correos, teléfonos, tags).
 * - `rows`: una fila por valor, apiladas hacia abajo con su número de orden, a modo de
 *   tabla. Es lo que necesita una lista larga de valores parecidos entre sí —números de
 *   serie— donde hay que poder recorrerlos con la vista y localizar uno concreto: en
 *   línea, veinte códigos casi idénticos son ilegibles.
 * @typedef {("tags"|"rows")} TagsInputLayout
 */
export type TagsInputLayout = "tags" | "rows";

/**
 * Props de {@link TagsInput}: campo para introducir una lista corta de
 * valores de texto (correos, teléfonos, tags...) añadidos de uno en uno con
 * "Enter" o el botón "+", cada uno validado por separado antes de añadirse,
 * hasta un máximo configurable. A diferencia de un `Input` con valores
 * separados por comas, cada elemento se ve y se quita de forma
 * independiente.
 * @interface TagsInputProps
 * @property {string} id - Id del campo de texto interno, usado para asociar el `label` (`htmlFor`)
 * @property {string} [label] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`
 * @property {string} [placeholder] - Clave de traducción (namespace `Placeholders`) o texto literal si `noTranslate` es `true`
 * @property {InputType} [type] - Tipo HTML del campo de texto interno; por defecto "text"
 * @property {string[]} value - Valores actuales
 * @property {(value: string[]) => void} onChange - Handler invocado con la lista completa tras añadir/quitar un valor
 * @property {number} [max] - Número máximo de valores permitidos; al alcanzarlo, el campo de alta se deshabilita
 * @property {(value: string) => string | undefined} [validate] - Valida un valor candidato antes de añadirlo; devuelve una clave de traducción del namespace `Validations` si no es válido, o `undefined` si lo es
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {boolean} [disabled] - Deshabilita el campo de alta y la opción de quitar valores existentes
 * @property {TagsInputLayout} [layout] - Cómo se listan los valores ya añadidos; por defecto "tags"
 * @property {string} [className] - Clases CSS del contenedor, sustituyendo la clase por defecto `input__full`
 * @property {boolean} [noTranslate] - Si es `true`, `label`/`placeholder` se usan tal cual, sin pasar por next-intl
 */
export interface TagsInputProps {
  id: string;
  label?: string;
  placeholder?: string;
  type?: InputType;
  value: string[];
  onChange: (value: string[]) => void;
  max?: number;
  validate?: (value: string) => string | undefined;
  required?: boolean;
  disabled?: boolean;
  layout?: TagsInputLayout;
  className?: string;
  noTranslate?: boolean;
}
