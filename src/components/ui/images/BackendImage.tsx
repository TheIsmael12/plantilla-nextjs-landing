'use client';

import '@/styles/04-components/ui/images/backend-image.scss';

import { useState } from 'react';

import type { BackendImageProps } from '@/types/ui/images/backend-image';

/**
 * Imagen servida por el backend (portadas/avatares del blog...), a
 * diferencia de `next/image` con `remotePatterns`: el origen del backend
 * cambia por entorno (`ENV.BACKEND_URL`) y ese origen puede fallar en
 * tiempo de build/optimización sin que el propio archivo esté roto (el
 * optimizador de Next hace su propio fetch server-side, con sus propios
 * fallos de red, timeouts o resolución de host, independientes de que la
 * imagen sea válida). Un `<img>` nativo delega la carga directamente al
 * navegador del visitante, evitando esa capa intermedia. Si no hay `src`,
 * o la imagen falla al cargar (URL caducada, fichero borrado...), se
 * muestra `fallback` en su lugar.
 * @param {BackendImageProps} props - Propiedades de la imagen
 * @returns {JSX.Element} La imagen del backend, o `fallback` si no hay `src` o falla al cargar
 */
export default function BackendImage({ src, alt, fill = false, className, fallback }: BackendImageProps) {
  const [hasError, setHasError] = useState(false);

  const fillClassName = fill ? 'backend-image--fill' : '';

  if (!src || hasError) {
    /*
     * `alt=""` es la forma estándar de decir «esta imagen es decorativa, no la anuncies»: la usan las
     * portadas del blog, donde el titular ya está al lado en texto.
     *
     * En el respaldo eso se traducía a `role="img" aria-label=""`, que es lo peor de las dos opciones: un
     * lector de pantalla anuncia que hay una imagen y a continuación no sabe decir de qué. Sin texto que dar,
     * lo correcto es esconder el respaldo del árbol de accesibilidad en vez de anunciar un hueco.
     */
    const isDecorative = alt.trim() === '';

    return (
      <span
        role={isDecorative ? undefined : 'img'}
        aria-label={isDecorative ? undefined : alt}
        aria-hidden={isDecorative || undefined}
        className={`backend-image__fallback ${fillClassName} ${className ?? ''}`.trim()}
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
      className={`${fillClassName} ${className ?? ''}`.trim()}
      onError={() => setHasError(true)}
    />
  );
}
