import "@/styles/04-components/ui/cards/card.scss";

import type { CardProps } from "@/types/ui/cards/card";

/**
 * Tarjeta de contenido genérica y reutilizable: cabecera opcional (título +
 * acciones) y un área de contenido, en dos variantes — "surface" (fondo
 * sólido, para secciones de página) u "outline" (borde, fondo transparente,
 * para agrupar contenido dentro de otra tarjeta, p. ej. una categoría de
 * permisos dentro del formulario de rol). A diferencia de `SettingsSection`,
 * no lleva icono ni fuerza una descripción: pensada para cualquier bloque de
 * contenido que necesite delimitarse visualmente, no solo ajustes.
 * @param {CardProps} props - Propiedades de la tarjeta
 * @returns {JSX.Element} La tarjeta renderizada
 */
export default function Card({
  title,
  actions,
  variant = "surface",
  children,
  className,
}: CardProps) {
  const hasHeader = title || actions;

  return (
    <section className={`card card--${variant}${className ? ` ${className}` : ""}`}>
      {hasHeader && (
        <div className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {actions && <div className="card__actions">{actions}</div>}
        </div>
      )}
      {children && <div className="card__content">{children}</div>}
    </section>
  );
}
