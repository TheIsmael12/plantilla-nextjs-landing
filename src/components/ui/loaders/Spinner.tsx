"use client";

import "@/styles/04-components/ui/loaders/spinner.scss";

import { SpinnerProps } from "@/types/ui/loaders/spinner";

/**
 * Indicador de carga (spinner) con variante y tamaño configurables.
 * @param {SpinnerProps} props - Propiedades del componente
 * @returns {JSX.Element} El spinner renderizado
 */
export default function Spinner({
  variant = "orbit",
  size,
  className,
}: SpinnerProps) {
  return (
    <span
      className={`spinner spinner--${variant}${className ? ` ${className}` : ""}`}
      style={size ? { fontSize: size } : undefined}
      role="status"
      aria-label="Cargando..."
    />
  );
}
