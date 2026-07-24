import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Opción disponible en {@link CardRadioGroup}.
 * @interface CardRadioOption
 * @property {string} value - Valor interno de la opción, usado para comparar con `value`/`onChange`
 * @property {string} label - Texto visible de la opción
 * @property {string} [description] - Breve explicación de esta opción concreta
 * @property {LucideIcon} [icon] - Icono mostrado junto al texto de la opción
 * @property {ReactNode} [preview] - Vista previa visual de la opción (p. ej. una miniatura), mostrada sobre el texto
 */
export interface CardRadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  preview?: ReactNode;
}

/**
 * Props de {@link CardRadioGroup}.
 * @interface CardRadioGroupProps
 * @property {string} name - Nombre del grupo de radios (atributo `name` nativo)
 * @property {string} value - Valor de la opción actualmente seleccionada
 * @property {CardRadioOption[]} options - Opciones disponibles en el grupo
 * @property {(value: string) => void} onChange - Handler invocado con el valor de la opción elegida
 * @property {boolean} [disabled] - Deshabilita todas las opciones del grupo
 * @property {string} [label] - Etiqueta visible sobre las opciones; también se usa como `aria-label` del grupo
 * @property {string} [description] - Breve explicación de qué controla el grupo, visible bajo `label`
 * @property {string} [className] - Clases CSS adicionales del contenedor (p. ej. `"card-radio-group__normal"` para que las tarjetas no se estiren a ocupar toda la fila)
 */
export interface CardRadioGroupProps {
  name: string;
  value: string;
  options: CardRadioOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}
