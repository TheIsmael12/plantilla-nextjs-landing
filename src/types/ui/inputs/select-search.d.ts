/**
 * Opción disponible en {@link SelectSearch}.
 * @interface SelectSearchOption
 * @property {string} value - Valor interno de la opción, usado para comparar con `value`/`onChange`
 * @property {string} label - Texto visible de la opción en el listbox, resaltado según el término de búsqueda
 */
export interface SelectSearchOption {
  value: string;
  label: string;
}

/**
 * Props comunes a las variantes de selección simple y múltiple de {@link SelectSearch}.
 * @interface SelectSearchBaseProps
 * @property {string} [id] - Id del trigger, usado para asociar el `label` y el listbox
 * @property {string} [name] - Nombre del campo, usado en los inputs ocultos para Formik
 * @property {string} [label] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`
 * @property {string} [description] - Breve explicación de qué controla el campo, visible bajo `label` (texto ya traducido, no pasa por `noTranslate`)
 * @property {string} [placeholder] - Clave de traducción (namespace `Placeholders`) o texto literal si `noTranslate` es `true`; texto mostrado cuando no hay opción seleccionada
 * @property {string} [ariaLabel] - Clave de traducción (namespace `Labels`) o texto literal si `noTranslate` es `true`; `aria-label` del trigger usado como nombre accesible cuando no hay `label` visible
 * @property {SelectSearchOption[]} options - Opciones disponibles, filtradas por el buscador interno
 * @property {boolean} [required] - Marca el campo como obligatorio y pinta un asterisco junto al label
 * @property {boolean} [disabled] - Deshabilita el selector e impide abrir el desplegable
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error de Yup/servidor; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {string} [searchPlaceholder] - Placeholder del campo de búsqueda interno; texto literal (no es clave de traducción), independiente de `noTranslate`. Sin indicarlo, se usa la clave `Placeholders.search`
 * @property {string} [noResultsText] - Texto mostrado cuando el filtro no arroja resultados
 * @property {string} [className] - Clases CSS adicionales del contenedor
 * @property {boolean} [defaultOpen] - Estado inicial del desplegable al montar; solo pensado para demos/documentación
 * @property {string} [defaultSearchTerm] - Texto de búsqueda inicial al montar; solo pensado para demos/documentación
 * @property {boolean} [noTranslate] - Si es `true`, `label`/`placeholder` se usan tal cual, sin pasar por next-intl
 */
export interface SelectSearchBaseProps {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  ariaLabel?: string;
  options: SelectSearchOption[];
  required?: boolean;
  disabled?: boolean;
  error?: string;
  touched?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  className?: string;
  defaultOpen?: boolean;
  defaultSearchTerm?: string;
  noTranslate?: boolean;
}

/**
 * Props de {@link SelectSearch} en modo de selección simple.
 * @interface SelectSearchSingleProps
 * @augments SelectSearchBaseProps
 * @property {false} [multiple] - Desactiva la selección múltiple (comportamiento por defecto)
 * @property {string} value - Valor seleccionado; cadena vacía si no hay selección
 * @property {(value: string) => void} onChange - Handler invocado con el valor de la opción elegida
 */
export interface SelectSearchSingleProps extends SelectSearchBaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Props de {@link SelectSearch} en modo de selección múltiple.
 * @interface SelectSearchMultipleProps
 * @augments SelectSearchBaseProps
 * @property {true} multiple - Activa la selección múltiple
 * @property {string[]} value - Valores seleccionados
 * @property {(value: string[]) => void} onChange - Handler invocado con la lista completa de valores seleccionados
 */
export interface SelectSearchMultipleProps extends SelectSearchBaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

/**
 * Props de {@link SelectSearch}: unión discriminada por `multiple` entre selección simple y múltiple.
 * @typedef {(SelectSearchSingleProps|SelectSearchMultipleProps)} SelectSearchProps
 */
export type SelectSearchProps = SelectSearchSingleProps | SelectSearchMultipleProps;
