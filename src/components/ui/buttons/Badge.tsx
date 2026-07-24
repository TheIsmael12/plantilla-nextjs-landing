import "@/styles/04-components/ui/buttons/badge.scss";

import type { BadgeProps } from "@/types/ui/buttons/badge";

/**
 * Insignia (badge) del sistema de diseño: una pequeña píldora de color usada
 * para estados (activo/bloqueado...), verificaciones (correo verificado) u
 * otras etiquetas cortas. Comparte la misma paleta semántica que {@link Alert}
 * (`info`/`success`/`warning`/`error`/`danger`/`neutral`).
 * @param {BadgeProps} props - Propiedades de la insignia
 * @returns {JSX.Element} La insignia renderizada
 */
export default function Badge({
  variant = "neutral",
  text,
  icon: Icon,
  children,
  className,
  status,
  value,
  ...rest
}: BadgeProps) {
  const resolvedVariant = status ?? variant;
  const resolvedText = children ?? value ?? text ?? resolvedVariant;

  return (
    <p
      className={`badge badge--${resolvedVariant}${className ? ` ${className}` : ""}`}
      {...rest}
    >
      {Icon && <Icon className="badge__icon" />}
      {resolvedText}
    </p>
  );
}
