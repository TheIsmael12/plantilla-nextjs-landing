import type { ReactNode } from "react";

/**
 * Variantes visuales soportadas por {@link Alert}, mapeadas 1:1 a las claves
 * de `ALERT_ICONS` (`constants/ui/alerts.ts`) y a las clases `alert--<type>`.
 * @typedef {("info"|"success"|"warning"|"error"|"danger"|"neutral")} AlertType
 */
export type AlertType = "info" | "success" | "warning" | "error" | "danger" | "neutral";

/**
 * Props de {@link Alert}.
 * @interface AlertProps
 * @property {string} [id] - Id del contenedor del alert, útil para asociarlo desde `aria-describedby` u otro elemento
 * @property {AlertType} [type] - Tipo de alerta: determina el icono y el color; por defecto "info"
 * @property {ReactNode} message - Mensaje mostrado en el alert; acepta un `ReactNode` (no solo `string`) para que una acción pueda incrustarse como texto dentro de la propia frase, vía `t.rich(...)`, en vez de como un botón aparte
 * @property {() => void} [onClose] - Handler de cierre; si se omite, no se muestra el botón de cierre
 * @property {string} [className] - Clases CSS adicionales
 */
export interface AlertProps {
  id?: string;
  type?: AlertType;
  message: ReactNode;
  onClose?: () => void;
  className?: string;
}
