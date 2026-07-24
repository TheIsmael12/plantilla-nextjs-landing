import {
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Trees,
  Users,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Route } from "@/types/route";

// Slugs reales de `Services.items` (i18n): única fuente de verdad para las
// rutas de servicios, su icono y su orden en navbar/footer. Cada uno tiene
// su propia entrada en `config/pathnames.ts` (p. ej. `/services/concierge`
// en inglés, `/servicios/conserjeria` en español), no una ruta dinámica.
// La página de detalle y el listado recorren este mismo array, así que
// añadir un servicio aquí es lo único que hace falta para que aparezca
// enlazado en todas partes (además de su carpeta en `src/app` y su entrada
// en `pathnames.ts`).
export const SERVICE_SLUGS = [
  "concierge",
  "security",
  "pools",
  "cleaning",
  "gardening",
  "maintenance",
] as const;

/** Slug de servicio válido, tal y como los define {@link SERVICE_SLUGS}. */
export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export const SERVICE_ICONS: Record<ServiceSlug, LucideIcon> = {
  concierge: Users,
  security: ShieldCheck,
  pools: Waves,
  cleaning: Sparkles,
  gardening: Trees,
  maintenance: Wrench,
};

// Misma foto real por servicio en toda la web (mega-menú, carrusel de la
// home, listado y detalle de `/services`), para no repetir URLs sueltas.
export const SERVICE_VISUALS: Record<ServiceSlug, string> = {
  concierge:
    "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?auto=format&fit=crop&w=1000&q=80",
  security:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=80",
  pools:
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80",
  cleaning:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
  gardening:
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=80",
  maintenance:
    "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&w=1000&q=80",
};


export const PUBLIC_ROUTES: Route[] = [
  {
    pathname: "/",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/services",
    shownInNavbar: true,
    shownInFooter: true,
    subRoutes: SERVICE_SLUGS.map((slug) => ({
      pathname: `/services/${slug}`,
      shownInNavbar: true,
      shownInFooter: true,
      icon: SERVICE_ICONS[slug],
    })),
  },
  {
    pathname: "/about",
    shownInNavbar: true,
    shownInFooter: false,
  },
  {
    pathname: "/blog",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/contact",
    shownInNavbar: true,
    shownInFooter: false,
  },
  {
    pathname: "/careers",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/help",
    shownInNavbar: false,
    shownInFooter: true,
    subRoutes: [
      {
        pathname: "/help/support",
        shownInNavbar: false,
        shownInFooter: true,
      },
      {
        pathname: "/help/faq",
        shownInNavbar: false,
        shownInFooter: true,
      },
    ],
  },
  {
    pathname: "/privacy-policy",
    shownInNavbar: false,
    shownInFooter: true,
    category: "legal",
  },
  {
    pathname: "/conditions",
    shownInNavbar: false,
    shownInFooter: true,
    category: "legal",
  },
  {
    pathname: "/cookies-policy",
    shownInNavbar: false,
    shownInFooter: true,
    category: "legal",
  },
  {
    pathname: "/complaints-channel",
    shownInNavbar: false,
    shownInFooter: true,
    category: "legal",
  },
  {
    pathname: "/login",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/reset-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/verify-email",
    shownInNavbar: false,
    shownInFooter: false,
  },
];

export const AUTH_ROUTES: Route[] = [
  {
    pathname: "/login",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/reset-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/verify-email",
    shownInNavbar: false,
    shownInFooter: false,
  },
];

export const PRIVATE_ROUTES: Route[] = [
  {
    pathname: "/dashboard",
    category: "general",
    icon: LayoutDashboard,
    isShownInSidebar: true,
  },
  {
    pathname: "/users",
    category: "general",
    icon: Users,
    isShownInSidebar: true,
  },
  {
    pathname: "/users/[id]",
    hasPage: false,
  },
  {
    pathname: "/profile",
    subRoutes: [
      {
        pathname: "/profile/sessions",
        category: "sessionsAndSecurity",
        isShownInSidebar: true,
      },
      {
        pathname: "/profile/security",
        category: "sessionsAndSecurity",
        isShownInSidebar: true,
      },
      {
        pathname: "/profile/notifications",
        category: "account",
        isShownInSidebar: true,
      },
      {
        pathname: "/profile/preferences",
        category: "account",
        isShownInSidebar: true,
        subRoutes: [
          {
            pathname: "/profile/preferences/locale",
            isShownInSidebar: true,
          },
          {
            pathname: "/profile/preferences/theme",
            isShownInSidebar: true,
          },
          {
            pathname: "/profile/preferences/datetime",
            isShownInSidebar: true,
          },
        ],
      },
    ],
  },
];
