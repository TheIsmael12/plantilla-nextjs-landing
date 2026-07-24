/**
 * Opción disponible en {@link RadioGroup}.
 * @interface RadioGroupOption
 * @property {string} value - Valor interno de la opción, usado para comparar con `value`/`onChange`
 * @property {string} label - Texto visible junto al indicador de la opción
 */
export interface RadioGroupOption {
  value: string;
  label: string;
}

/**
 * Props de {@link RadioGroup}.
 * @interface RadioGroupProps
 * @property {string} name - Nombre del grupo de radios (atributo `name` nativo)
 * @property {string} value - Valor de la opción actualmente seleccionada
 * @property {RadioGroupOption[]} options - Opciones disponibles en el grupo
 * @property {(value: string) => void} onChange - Handler invocado con el valor de la opción elegida
 * @property {boolean} [disabled] - Deshabilita todas las opciones del grupo
 * @property {string} [label] - Etiqueta visible sobre las opciones; también se usa como `aria-label` del grupo
 * @property {string} [description] - Breve explicación de qué controla el grupo, visible bajo `label`
 * @property {string} [className] - Clases CSS adicionales del contenedor (p. ej. `"radio-group__normal"` para que no ocupe el ancho completo)
 */
export interface RadioGroupProps {
  name: string;
  value: string;
  options: RadioGroupOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}
