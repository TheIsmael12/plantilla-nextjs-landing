import { MetadataRoute } from "next";

import { ENV } from "@/config/env";

/**
 * Web app manifest (`/manifest.webmanifest`, convención de Next.js): sin él
 * el navegador móvil no puede instalar el sitio como app y usa un color de
 * chrome por defecto en vez de `--primary-color` (`00-settings/_colors.scss`).
 * @returns {MetadataRoute.Manifest} El manifest del sitio
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ENV.APP_NAME,
    short_name: ENV.APP_NAME,
    description: "Conserjería, videovigilancia, limpieza, piscinas y mantenimiento para comunidades de propietarios, empresas y edificios en Madrid.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e3a5f",
    // `sizes: "any"` y no un tamaño concreto: los únicos PNG disponibles
    // (`public/images/logo*.png`) son wordmarks horizontales (1350×300,
    // 1198×329), no íconos cuadrados — declarar 512×512 sobre un archivo que
    // no lo es habría sido un dato falso, exactamente lo que
    // `companyIdentity.ts` existe para evitar en otros campos.
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
