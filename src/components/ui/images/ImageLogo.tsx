"use client";

import "@/styles/04-components/ui/images/image-logo.scss";

import { useIsMounted } from "@/hooks/useIsMounted";
import { useTheme } from "next-themes";

import Image from "next/image";

import type { ImageLogoProps } from "@/types/ui/images/image-logo";

/**
 * Logo de la aplicación, resuelto automáticamente entre las variantes clara y
 * oscura según el tema activo (`next-themes`), salvo que `style` fuerce una
 * variante concreta. Antes de montar evita el parpadeo mostrando un placeholder
 * vacío, ya que el tema resuelto solo se conoce en cliente.
 * @param {ImageLogoProps} props - Propiedades del logo
 * @returns {JSX.Element} La imagen del logo, o un placeholder mientras se resuelve el tema
 */
export default function ImageLogo({
  width = 120,
  height = 30,
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
      <Image
        src="/images/logo.png"
        alt=""
        width={width}
        height={height}
        priority={false}
        aria-hidden
        className="image-logo__placeholder"
      />
    );
  }

  return (
    <Image
      src={getLogoSrc()}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      fetchPriority="high"
      className={className}
    />
  );
}
