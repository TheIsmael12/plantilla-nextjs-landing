"use client";

import "@/styles/04-components/ui/errors/state.scss";

import { useTranslations } from "next-intl";

import { ErrorStateProps } from "@/types/ui/errors/error-state";

import { AlertTriangleIcon } from "lucide-react";

/**
 * Estado de error genérico para secciones que fallan al cargar datos: usa
 * un título traducido por defecto (`Common.Errors.generic`) si no se indica `title`.
 * @param {ErrorStateProps} props - Propiedades del componente
 * @returns {JSX.Element} El estado de error renderizado
 */
export default function ErrorState({
  title,
  message,
  icon: Icon = AlertTriangleIcon,
  action,
  className,
}: ErrorStateProps) {
  const t = useTranslations("Common.Errors");

  return (
    <div
      role="alert"
      className={`state state--error${className ? ` ${className}` : ""}`}
    >
      <Icon className="state__icon" aria-hidden="true" />
      <p className="state__title">{title ?? t("generic")}</p>
      <p className="state__message">{message}</p>
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}
