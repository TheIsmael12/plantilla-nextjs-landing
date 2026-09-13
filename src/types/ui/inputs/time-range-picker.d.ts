/**
 * Props de {@link TimeRangePicker}: un tramo horario «de … a …» como un solo campo.
 *
 * Sustituye a la pareja de `<input type="time">` que había antes. Dos campos nativos sueltos
 * dejaban el navegador decidir el formato —12 h en unos equipos, 24 h en otros— y no había forma de
 * decir que el fin va antes que el inicio sin escribirlo a mano en cada pantalla que los usara.
 * @interface TimeRangePickerProps
 * @property {string} [id] - Id base del grupo; cada extremo añade su sufijo
 * @property {string} [name] - Nombre base del campo, usado por los inputs ocultos para Formik (`{name}Start`/`{name}End`)
 * @property {string} [label] - Etiqueta visible encima del tramo (texto ya traducido)
 * @property {string} startTime - Hora de inicio en formato `HH:MM`
 * @property {string} endTime - Hora de fin en formato `HH:MM`
 * @property {(range: { startTime: string; endTime: string }) => void} onChange - Handler invocado con el tramo completo cada vez que un extremo queda en una hora válida
 * @property {string} [startLabel] - Nombre accesible del extremo de inicio (ya traducido)
 * @property {string} [endLabel] - Nombre accesible del extremo de fin (ya traducido)
 * @property {boolean} [allowOvernight] - Acepta tramos que cruzan la medianoche (22:00–06:00) sin marcarlos como error
 * @property {boolean} [disabled] - Deshabilita los dos extremos
 * @property {string} [error] - Mensaje de error ya traducido, mostrado bajo el campo
 * @property {string} [className] - Clases CSS adicionales del contenedor
 */
export interface TimeRangePickerProps {
  id?: string;
  name?: string;
  label?: string;
  startTime: string;
  endTime: string;
  onChange: (range: { startTime: string; endTime: string }) => void;
  startLabel?: string;
  endLabel?: string;
  allowOvernight?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}
