import { ENV } from "@/config/env";
import { pathnames } from "@/config/pathnames";
import { SERVICE_SLUGS } from "@/config/routing";
import { ZONES } from "@/config/zones";
import type { StaticPathname } from "@/types/route";

import esViews from "@/i18n/locales/es/views.json";

const BASE_URL = ENV.APP_URL.replace(/\/$/, "");

/**
 * Resuelve la URL absoluta en español de una ruta canónica de
 * `config/pathnames.ts`. `llms.txt` es un único fichero por sitio (como
 * `robots.txt`), no uno por idioma, así que enlaza siempre a la versión en
 * español (mercado principal), que al ser el locale por defecto
 * (`localePrefix: "as-needed"`) se sirve sin prefijo.
 * @param {StaticPathname} pathname - Ruta canónica
 * @returns {string} La URL absoluta en español
 */
function esUrl(pathname: StaticPathname): string {
  const entry = pathnames[pathname as keyof typeof pathnames];
  const localized = typeof entry === "string" ? entry : entry.es;
  return `${BASE_URL}${localized === "/" ? "" : localized}`;
}

/**
 * Genera `llms.txt` (convención de llmstxt.org): un resumen de la empresa en
 * Markdown con enlaces a las páginas públicas clave, para que los modelos de
 * lenguaje que consultan el sitio (GEO — Generative Engine Optimization,
 * permitidos explícitamente en `robots.ts`) entiendan de un vistazo qué
 * ofrece Imora y dónde encontrar cada cosa, sin tener que rastrear todo el
 * sitio.
 * @returns {Response} El fichero `llms.txt`, servido como texto Markdown plano
 */
export async function GET(): Promise<Response> {
  const services = SERVICE_SLUGS.map((slug) => {
    const item = esViews.Services.items[slug];
    return `- [${item.title}](${esUrl(`/services/${slug}`)}): ${item.summary}`;
  }).join("\n");

  // Zonas de cobertura (requisitos-seo.md §4): igual que con los servicios, se listan las 20
  // desde `ZONES` (única fuente de verdad, `config/zones.ts`) en vez de mantener una lista
  // aparte que pudiera desincronizarse si se añade o quita una zona del catálogo.
  const zones = ZONES.map((zone) => {
    const item = (esViews.Zones.items as Record<string, { heroSubtitle: string }>)[zone.slug];
    return `- [Servicios en ${zone.name}](${esUrl(`/zones/${zone.slug}` as StaticPathname)}): ${item.heroSubtitle}`;
  }).join("\n");

  const body = `# ${ENV.APP_NAME}

> ${esViews.Home.hero.subtitle}

## Servicios

- [Todos los servicios](${esUrl("/services")}): Catálogo completo de servicios de mantenimiento y gestión de edificios.
${services}

## Empresa

- [Sobre nosotros](${esUrl("/about")}): ${esViews.About.hero.subtitle}
- [Servicios para administradores de fincas](${esUrl("/for/property-managers")}): ${esViews.ForPropertyManagers.hero.subtitle}
- [Contacto](${esUrl("/contact")}): ${esViews.Contact.hero.subtitle}

## Zonas de cobertura

${zones}

## Ayuda

- [Centro de ayuda](${esUrl("/help")}): ${esViews.Help.hero.subtitle}
- [Preguntas frecuentes](${esUrl("/help/faq")}): ${esViews.Faq.hero.subtitle}
- [Soporte para clientes](${esUrl("/help/support")}): ${esViews.Support.hero.subtitle}

## Legal

- [Política de privacidad](${esUrl("/privacy-policy")})
- [Términos y condiciones](${esUrl("/conditions")})
- [Política de cookies](${esUrl("/cookies-policy")})
- [Canal de reclamaciones](${esUrl("/complaints-channel")})
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}
