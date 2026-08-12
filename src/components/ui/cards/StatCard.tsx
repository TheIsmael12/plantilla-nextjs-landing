import "@/styles/04-components/ui/cards/stat-card.scss";

import type { StatCardProps } from "@/types/ui/cards/stat-card";

/**
 * Tarjeta de una única métrica (usada en cuadros de estadísticas/reporting,
 * p. ej. el informe de facturación): etiqueta, valor grande y una
 * descripción secundaria opcional, con una franja de color lateral que
 * codifica la variante semántica — misma paleta que {@link Badge}, así "importe
 * vencido" en `danger` y "total cobrado" en `success` se leen de un vistazo
 * sin depender solo del texto. A diferencia de {@link Card}, no admite
 * `children` libres: está pensada específicamente para una métrica con
 * valor, no para contenido arbitrario.
 * @param {StatCardProps} props - Propiedades de la tarjeta
 * @returns {JSX.Element} La tarjeta de estadística renderizada
 */
export default function StatCard({
  label,
  value,
  description,
  icon: Icon,
  variant = "neutral",
  className,
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}${className ? ` ${className}` : ""}`}>
      <div className="stat-card__header">
        <p className="stat-card__label">{label}</p>
        {Icon && <Icon className="stat-card__icon" aria-hidden="true" />}
      </div>
      <p className="stat-card__value">{value}</p>
      {description && <p className="stat-card__description">{description}</p>}
    </div>
  );
}
