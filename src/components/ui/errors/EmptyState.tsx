"use client";

import "@/styles/04-components/ui/errors/state.scss";

import { EmptyStateProps } from "@/types/ui/errors/empty-state";

import { InboxIcon } from "lucide-react";

/**
 * Estado vacío genérico para listas o secciones sin contenido: icono
 * configurable (por defecto `InboxIcon`), título, descripción y acción opcionales.
 * @param {EmptyStateProps} props - Propiedades del componente
 * @returns {JSX.Element} El estado vacío renderizado
 */
export default function EmptyState({
  title,
  description,
  icon: Icon = InboxIcon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={`state state--empty${className ? ` ${className}` : ""}`}>
      <Icon className="state__icon" />
      {title && <p className="state__title">{title}</p>}
      {description && <p className="state__description">{description}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}
