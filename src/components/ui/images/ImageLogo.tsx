"use client";

import "@/styles/04-components/ui/images/image-logo.scss";

import { useIsMounted } from "@/hooks/useIsMounted";
import { useTheme } from "next-themes";

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
 * oscura según el tema activo (`next-themes`), salvo que `style` fuerce una
 * variante concreta. Antes de montar evita el parpadeo mostrando un placeholder
 * vacío, ya que el tema resuelto solo se conoce en cliente.
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
  const { resolvedTheme } = useTheme();

  const isDark =
    style === "dark"
      ? true
      : style === "light"
        ? false
        : resolvedTheme === "dark";

  const getLogoSrc = () => {
    if (size === "small") {
      return isDark ? "/images/logo-small-dark.png" : "/images/logo-small.png";
    }
    return isDark ? "/images/logo-dark.png" : "/images/logo.png";
  };

  if (!isMounted || !resolvedTheme) {
    return (
      <span className="image-logo image-logo__placeholder" aria-hidden>
        <Image
          src="/images/logo.png"
          alt=""
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
