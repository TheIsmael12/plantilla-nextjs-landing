/**
 * Props de {@link Toggle}.
 * @interface ToggleProps
 * @property {string} [id] - Id del input nativo, útil para asociar un `label` externo
 * @property {string} [name] - Nombre del campo, usado por Formik para el binding
 * @property {string} [label] - Texto principal visible junto al toggle
 * @property {string} [description] - Descripción secundaria visible debajo del label
 * @property {string} [ariaLabel] - `aria-label` del interruptor, usado como nombre accesible cuando no hay `label` visible
 * @property {boolean} checked - Estado activo del toggle (prop controlada)
 * @property {(checked: boolean) => void} onChange - Handler invocado con el nuevo estado al cambiar
 * @property {boolean} [disabled] - Deshabilita el toggle e impide cualquier interacción
 */
export interface ToggleProps {
  id?: string;
  name?: string;
  label?: string;
  description?: string;
  ariaLabel?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
