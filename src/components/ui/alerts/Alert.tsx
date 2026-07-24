import "@/styles/04-components/ui/alerts/alert.scss";

import { XIcon } from "lucide-react";

import { ALERT_ICONS } from "@/constants/ui/alerts";
import { AlertProps } from "@/types/ui/alerts/alert";

/**
 * Alerta contextual (info/success/warning/error) con icono según `type` y
 * botón de cierre opcional cuando se recibe `onClose`.
 * @param {AlertProps} props - Propiedades del componente
 * @returns {JSX.Element} El elemento de alerta renderizado
 */
export default function Alert({
  id,
  type = "info",
  message,
  onClose,
  className,
}: AlertProps) {
  const Icon = ALERT_ICONS[type] ?? ALERT_ICONS.info;

  return (
    <div
      id={id}
      role="alert"
      className={`alert alert--${ALERT_ICONS[type] ? type : "info"}${className ? ` ${className}` : ""}`}
    >
      <Icon className="alert__icon" aria-hidden="true" />
      <p className="alert__message">{message}</p>

      {onClose && (
        <button
          type="button"
          className="alert__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <XIcon aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
