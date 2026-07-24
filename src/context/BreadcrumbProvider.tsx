"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

interface BreadcrumbContextValue {
  label: string | undefined;
  setLabel: (label: string | undefined) => void;
}

const noopSetLabel = () => {};
const FALLBACK_CONTEXT: BreadcrumbContextValue = { label: undefined, setLabel: noopSetLabel };

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(undefined);

/**
 * Provee la etiqueta dinámica inyectable por las páginas (vía
 * {@link useBreadcrumbLabel}) para el último segmento dinámico de
 * {@link Breadcrumbs} (p. ej. el nombre de un usuario ya cargado, en vez de
 * su id).
 * @param {{children: ReactNode}} props Contenido hijo
 * @returns {JSX.Element} El proveedor de contexto renderizado
 */
export default function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState<string | undefined>(undefined);

  const value = useMemo(() => ({ label, setLabel }), [label]);

  return <BreadcrumbContext.Provider value={value}>{children}</BreadcrumbContext.Provider>;
}

/**
 * Lee la etiqueta dinámica actual (y su setter) provista por el
 * {@link BreadcrumbProvider} más cercano, o un valor por defecto (sin
 * etiqueta, setter no operativo) si no hay ninguno en el árbol.
 * @returns {BreadcrumbContextValue} La etiqueta dinámica actual y su setter
 */
export function useBreadcrumbContext(): BreadcrumbContextValue {
  const context = useContext(BreadcrumbContext);
  return context ?? FALLBACK_CONTEXT;
}

/**
 * Inyecta `label` como la etiqueta a mostrar para el último segmento
 * dinámico de {@link Breadcrumbs} mientras el componente que la llama esté
 * montado (p. ej. una página `/users/[id]` que ya cargó el nombre real del
 * usuario); la limpia al desmontar para no dejarla filtrarse a otras páginas.
 * @param {string} [label] Etiqueta a mostrar; si se omite, no sobreescribe nada
 * @returns {void}
 */
export function useBreadcrumbLabel(label?: string): void {
  const { setLabel } = useBreadcrumbContext();

  useEffect(() => {
    setLabel(label);
    return () => setLabel(undefined);
  }, [label, setLabel]);
}
