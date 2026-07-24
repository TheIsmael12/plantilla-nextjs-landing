/**
 * Props de {@link OtpInput}.
 * @interface OtpInputProps
 * @property {string} [id] - Id asignado a la primera casilla, para asociar un `label` externo
 * @property {string} [name] - Nombre de campo asignado a la primera casilla, usado por Formik para el binding
 * @property {number} [length] - Número de casillas/dígitos del código; por defecto 6
 * @property {string} value - Código actual, controlado por el componente padre
 * @property {(value: string) => void} onChange - Se invoca con el código completo cada vez que cambia cualquier casilla
 * @property {string} [error] - Clave de traducción (namespace `Validations`) del error; solo se pinta si `touched` es `true`
 * @property {boolean} [touched] - Si el campo ha sido interactuado; controla cuándo se muestra `error`
 * @property {boolean} [disabled] - Deshabilita todas las casillas
 * @property {boolean} [autoFocus] - Si la primera casilla debe recibir el foco al montar
 */
export interface OtpInputProps {
  id?: string;
  name?: string;
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  touched?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
}
