"use client";

import "@/styles/04-components/ui/files/zoomable-image.scss";

import { useEffect, useState } from "react";

import type { ZoomableImageProps } from "@/types/ui/files/zoomable-image";

/**
 * Imagen del visor con zoom real (redimensiona el elemento, no un `transform`
 * CSS), usada por {@link FileViewer} en vez de un `<img>` (o `BackendImage`)
 * suelto.
 *
 * `transform: scale()` es puramente visual: no cambia el tamaño de layout del
 * elemento, así que el contenedor nunca gana el `scrollWidth`/`scrollHeight`
 * extra que necesitaría para poder desplazarse — con zoom aplicado así, no
 * había nada que arrastrar. Aquí el zoom se traduce a un `width`/`height` en
 * píxeles reales sobre el tamaño natural de la imagen, calculado una vez que
 * la imagen carga (`naturalWidth`/`naturalHeight`).
 *
 * El "hueco disponible" para el ajuste inicial se mide sobre
 * `containerElement` (el contenedor con scroll de `FileViewer`), no sobre el
 * propio wrapper de este componente: ese wrapper es justo el que crece con
 * el zoom, así que medirse a sí mismo entraría en un bucle de
 * retroalimentación (su tamaño dependería del resultado de medir su tamaño).
 * @param {ZoomableImageProps} props - Propiedades de la imagen
 * @returns {JSX.Element} La imagen renderizada a su tamaño real (ajustado y con zoom aplicado)
 */
export default function ZoomableImage({ src, alt, zoom, containerElement }: ZoomableImageProps) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerElement) return;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(containerElement);

    return () => observer.disconnect();
  }, [containerElement]);

  if (hasError) return null;

  const fitScale =
    naturalSize && containerSize
      ? Math.min(
          containerSize.width / naturalSize.width,
          containerSize.height / naturalSize.height,
          // La imagen nunca se estira por encima de su tamaño real solo para
          // llenar el hueco: a "zoom 1" se ve tal cual es, como con un PDF.
          1,
        )
      : null;

  const size =
    naturalSize && fitScale
      ? { width: naturalSize.width * fitScale * zoom, height: naturalSize.height * fitScale * zoom }
      : null;

  return (
    <div className="zoomable-image">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="zoomable-image__img"
        style={size ?? undefined}
        onLoad={(event) => {
          const img = event.currentTarget;
          setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
        }}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
