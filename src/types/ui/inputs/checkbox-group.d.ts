/**
 * Opción disponible en {@link CheckboxGroup}.
 * @interface CheckboxGroupOption
 * @property {string} value - Valor interno de la opción, usado para comparar con `value`/`onChange`
 * @property {string} label - Texto visible junto a la casilla de la opción
 */
export interface CheckboxGroupOption {
  value: string;
  label: string;
}

/**
 * Props de {@link CheckboxGroup}.
 * @interface CheckboxGroupProps
 * @property {string} [name] - Nombre del grupo de casillas (atributo `name` nativo de cada input)
 * @property {string[]} value - Valores actualmente marcados
 * @property {CheckboxGroupOption[]} options - Opciones disponibles en el grupo
 * @property {(value: string[]) => void} onChange - Handler invocado con la lista completa de valores marcados
 * @property {boolean} [disabled] - Deshabilita todas las opciones del grupo
 * @property {string} [label] - Etiqueta visible sobre las opciones; también se usa como `aria-label` del grupo
 * @property {string} [description] - Breve explicación de qué controla el grupo, visible bajo `label`
 * @property {string} [className] - Clases CSS adicionales del contenedor
 */
export interface CheckboxGroupProps {
  name?: string;
  value: string[];
  options: CheckboxGroupOption[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}
