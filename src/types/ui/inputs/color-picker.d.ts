/**
 * Un color con nombre de la paleta ofrecida por {@link ColorPicker}.
 * @interface ColorOption
 * @property {string} value - Lo que **se guarda** al elegirlo. Normalmente el propio color en hexadecimal (`#RRGGBB`)
 * @property {string} label - Nombre visible, usado como nombre accesible del botón
 * @property {string} [swatch] - Color con el que se pinta la muestra, cuando `value` no es un color. Hace falta para los catálogos que guardan una **variante semántica** (`success`, `error`) en vez de un tono: lo que se elige es el significado y el tono lo decide el tema, así que la muestra tiene que poder pintarse con el color del tema mientras se guarda la variante
 */
export interface ColorOption {
  value: string;
  label: string;
  swatch?: string;
}

/**
 * Props de {@link ColorPicker}: paleta cerrada de colores con nombre, más la opción de no poner
 * ninguno. No es un selector libre de color: un campo decorativo con 16 millones de opciones acaba
 * con quince tonos de rojo distintos en la misma pantalla.
 * @interface ColorPickerProps
 * @property {string} [id] - Id del grupo, usado para asociar la etiqueta
 * @property {string} [name] - Nombre del campo, usado por el input oculto para Formik
 * @property {string} [label] - Etiqueta visible encima de la paleta (texto ya traducido)
 * @property {string} [description] - Aclaración breve bajo la etiqueta
 * @property {(string|null)} value - Color seleccionado en hexadecimal, o `null` si no hay ninguno
 * @property {(color: string | null) => void} onChange - Handler invocado con el color elegido, o `null` al quitarlo
 * @property {ColorOption[]} [options] - Paleta ofrecida; por defecto, la del sistema de diseño
 * @property {boolean} [allowEmpty] - Ofrece la opción "sin color"; por defecto `true`
 * @property {string} [emptyLabel] - Texto de la opción "sin color" (ya traducido)
 * @property {boolean} [disabled] - Deshabilita toda la paleta
 * @property {string} [className] - Clases CSS adicionales del contenedor
 */
export interface ColorPickerProps {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  value: string | null;
  onChange: (color: string | null) => void;
  options?: ColorOption[];
  allowEmpty?: boolean;
  emptyLabel?: string;
  disabled?: boolean;
  className?: string;
}
