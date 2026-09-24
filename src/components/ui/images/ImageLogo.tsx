"use client";

import "@/styles/04-components/ui/images/image-logo.scss";

import { useIsDarkTheme } from "@/hooks/useIsDarkTheme";
import { useIsMounted } from "@/hooks/useIsMounted";

import Image from "next/image";

import type { ImageLogoProps } from "@/types/ui/images/image-logo";

// El logo siempre se usa como marca de cabecera/navegación (nav, footer, header del área de cliente,
// layout de auth), nunca a tamaño de página completa: un ancho de renderizado generoso para ese caso
// cubre a todos los sitios de uso sin necesitar que cada uno declare su propio `sizes`.
const LOGO_SIZES = "160px";

// Los `.png` del logo son de colores planos (dos tonos, sin degradado ni detalle fino): la calidad por
// defecto de `next/image` (75, pensada para fotos) no aporta nada visible aquí y sí unos KiB de más en
// cada variante que Next genera.
const LOGO_QUALITY = 60;

/**
 * Logo de la aplicación, resuelto automáticamente entre las variantes clara y
 * oscura según el tema activo, salvo que `style` fuerce una variante concreta.
 * Antes de montar evita el parpadeo mostrando un placeholder vacío, ya que el
 * tema real solo se conoce en cliente.
 *
 * El tema se lee de la clase `dark` en `<html>` (`useIsDarkTheme`) y no de
 * `useTheme().resolvedTheme` (`next-themes`): son cosas distintas mientras el
 * `ThemeProvider` raíz usa `forcedTheme` (ver ese hook) — el selector de tema
 * de Preferencias pinta esa clase directamente para el cambio instantáneo, y
 * es la misma clase de la que depende ya todo el CSS del sitio (`.dark { ... }`
 * en `_colors.scss`). Seguir a `resolvedTheme` aquí dejaba el logo mostrando
 * el tema anterior mientras el resto de la interfaz ya había cambiado.
 *
 * No recibe `width`/`height`: ocupa el 100% del contenedor (`fill`) y se
 * ajusta con `object-fit: contain`, así que el tamaño real lo decide siempre
 * el CSS del sitio de uso (p.ej. `.nav__logo { width: 3rem; height: 3rem }`)
 * sin deformar ni recortar el logo, sea cual sea el tamaño solicitado.
 * @param {ImageLogoProps} props - Propiedades del logo
 * @returns {JSX.Element} La imagen del logo, o un placeholder mientras se resuelve el tema
 */
export default function ImageLogo({
  size = "default",
  style = "default",
  alt = "App Logo",
  priority = true,
  className,
}: ImageLogoProps) {
  const isMounted = useIsMounted();
  const isDarkTheme = useIsDarkTheme();

  const isDark =
    style === "dark"
      ? true
      : style === "light"
        ? false
        : isDarkTheme;

  const getLogoSrc = () => {
    if (size === "small") {
      return isDark ? "/images/logo-small-dark.png" : "/images/logo-small.png";
    }
    return isDark ? "/images/logo-dark.png" : "/images/logo.png";
  };

  if (!isMounted) {
    // Sin `aria-hidden` y con el `alt` real (no vacío): este es el HTML que
    // recibe cualquiera que no ejecute JS todavía —el propio SSR, un lector
    // de pantalla antes de la hidratación, un crawler— y suele envolver un
    // `<Link>` sin más texto (`Navbar.tsx`: `nav__logo`). Con `alt=""` aquí,
    // ese enlace no tenía ningún nombre accesible en el HTML servido
    // (auditoría externa, "Interactive element names").
    return (
      <span className="image-logo image-logo__placeholder">
        <Image
          src="/images/logo.png"
          alt={alt}
          fill
          sizes={LOGO_SIZES}
          quality={LOGO_QUALITY}
          priority={false}
          className="image-logo__img"
        />
      </span>
    );
  }

  return (
    <span className={`image-logo ${className ?? ""}`.trim()}>
      <Image
        src={getLogoSrc()}
        alt={alt}
        fill
        sizes={LOGO_SIZES}
        quality={LOGO_QUALITY}
        priority={priority}
        fetchPriority="high"
        className="image-logo__img"
      />
    </span>
  );
}
