"use client";

import "@/styles/04-components/ui/images/backend-image.scss";

import { useState } from "react";

import type { BackendImageProps } from "@/types/ui/images/backend-image";

/**
 * Imagen servida por el backend (avatares, ficheros subidos por el
 * usuario...), a diferencia de {@link ImageLogo} (activos estáticos locales
 * con variante clara/oscura). No usa `next/image`: el origen del backend
 * cambia por entorno y el proyecto no tiene `images.remotePatterns`
 * configurado. Si no hay `src`, o la imagen falla al cargar (URL caducada,
 * fichero borrado...), se muestra `fallback` en su lugar.
 * @param {BackendImageProps} props - Propiedades de la imagen
 * @returns {JSX.Element} La imagen del backend, o `fallback` si no hay `src` o falla al cargar
 */
export default function BackendImage({
  src,
  alt,
  className,
  fallback,
}: BackendImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`backend-image__fallback ${className ?? ""}`.trim()}
      >
        {fallback}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
}
