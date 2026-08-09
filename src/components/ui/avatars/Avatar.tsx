import React from "react";

import "@/styles/04-components/ui/avatars/avatar.scss";

interface AvatarProps {
  name?: string;
  image?: string;
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  bordered?: boolean;
}

/**
 * Avatar de usuario: muestra la imagen si se recibe `src`/`image`, o en su
 * defecto las iniciales del nombre. No usa `next/image` porque el origen de
 * la imagen (backend, proveedor OAuth...) varía por entorno y no está
 * cubierto por `images.remotePatterns`, igual que {@link BackendImage}.
 * @param {AvatarProps} props Datos del usuario e imagen a mostrar
 * @returns {JSX.Element} El avatar renderizado
 */
export default function Avatar({ name, image, src, alt, size = "md", bordered = false }: AvatarProps) {
  const initials = (name ?? "User")
    .split(" ")
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const resolvedImage = src ?? image;

  return (
    <div className={`avatar avatar--${size}${bordered ? " avatar--bordered" : ""}`}>
      {resolvedImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={resolvedImage} alt={alt ?? name ?? "Avatar"} />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
