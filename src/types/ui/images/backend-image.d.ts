import type { ReactNode } from "react";

/**
 * Props de {@link BackendImage}.
 * @interface BackendImageProps
 * @property {string | null} [src] - URL de la imagen servida por el backend, ya resuelta a absoluta (ver `utils/fetchUtils.ts` `resolveBackendAssetUrl`)
 * @property {string} alt - Texto alternativo de accesibilidad
 * @property {string} [className] - Clases CSS adicionales, aplicadas tanto a la imagen como al contenedor de `fallback`
 * @property {ReactNode} [fallback] - Contenido mostrado si no hay `src` o la imagen falla al cargar (p. ej. un icono genérico)
 */
export interface BackendImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}
