"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

/**
 * Si el tema oscuro está activo ahora mismo, leído directamente de la clase `dark` en `<html>` en vez
 * de `useTheme().resolvedTheme` (`next-themes`).
 *
 * Existe porque no son lo mismo: el `ThemeProvider` raíz usa `forcedTheme` para que la preferencia
 * guardada gane siempre a `localStorage` desde el primer frame (evita el flash al tema equivocado al
 * iniciar sesión en otro dispositivo), y mientras `forcedTheme` tiene valor, `next-themes` ignora
 * cualquier `setTheme` posterior — por eso el selector de tema de Preferencias
 * (`PortalThemeSection.tsx`) no usa `setTheme` para el efecto instantáneo: pinta la clase `dark`
 * directamente sobre `<html>`, igual que lee todo el CSS del sitio (`.dark { ... }` en `_colors.scss`).
 *
 * `resolvedTheme` no se entera de ese cambio hasta que `router.refresh()` recalcula `forcedTheme` en
 * el layout de servidor —con una carrera de por medio entre la sesión de next-auth y el propio
 * refresh—, así que cualquier componente que decida su variante por `resolvedTheme` (como
 * `ImageLogo`) se queda mostrando el tema anterior mientras el resto de la interfaz ya cambió. Leer
 * la misma clase que ya gobierna el CSS es lo que mantiene a estos componentes sincronizados con el
 * cambio instantáneo, sin depender de que el ciclo de servidor termine.
 * @returns {boolean} `false` en el servidor y en el primer render de cliente (el tema real solo se conoce tras hidratar)
 */
export function useIsDarkTheme(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
