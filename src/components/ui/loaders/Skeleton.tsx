"use client";

import "@/styles/04-components/ui/loaders/skeleton.scss";

import { SkeletonProps } from "@/types/ui/loaders/skeleton";

/**
 * Placeholder de carga (skeleton): renderiza uno o varios bloques (`count`)
 * según la variante indicada mientras el contenido real está disponible.
 * @param {SkeletonProps} props - Propiedades del componente
 * @returns {JSX.Element} El o los bloques de skeleton renderizados
 */
export default function Skeleton({
  variant = "text",
  width,
  height,
  count = 1,
  className,
}: SkeletonProps) {
  const skeletonClassName = `skeleton skeleton--${variant}${
    className ? ` ${className}` : ""
  }`;
  const style = { width, height };

  if (count <= 1) {
    return (
      <span className={skeletonClassName} style={style} aria-hidden="true" />
    );
  }

  return (
    <span className="skeleton__group" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={skeletonClassName} style={style} />
      ))}
    </span>
  );
}
