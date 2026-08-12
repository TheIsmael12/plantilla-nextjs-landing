import {
  Bell,
  Briefcase,
  Building2,
  Calendar,
  DoorClosed,
  FileText,
  KeyRound,
  Languages,
  LayoutDashboard,
  Lock,
  Monitor,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  SunMoon,
  TriangleAlert,
  Trees,
  User,
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
  concierge: "/images/services/concierge.jpg",
  security: "/images/services/security.jpg",
  pools: "/images/services/pools.jpg",
  cleaning: "/images/services/cleaning.jpg",
  gardening: "/images/services/gardening.jpg",
  maintenance: "/images/services/maintenance.jpg",
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
    pathname: "/forgot-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/reset-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/change-password",
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
    pathname: "/forgot-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/reset-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/change-password",
    shownInNavbar: false,
    shownInFooter: false,
  },
  {
    pathname: "/verify-email",
    shownInNavbar: false,
    shownInFooter: false,
  },
];

// Todo el área privada del portal cuelga de `/private-area`: perfil (datos
// personales + seguridad) y las tres secciones de servicios/presupuestos/
// facturas son subrutas hermanas, todas bajo el mismo layout común
// (`ClientAreaHeader`). El portal no tiene RBAC ni sesiones/dispositivos
// listables (backend `client-portal-panel.controller.ts`).
//
// Las 4 secciones de primer nivel (`profile`, `services`, `quotes`,
// `invoices`) llevan `isShownInSidebar: true` para aparecer tanto en el
// menú desplegable de `User` (`MenuItems path="/private-area"`) como en
// cualquier sidebar futuro del home. Las rutas de detalle (`.../[id]`) se
// registran sin `shownInNavbar` a propósito: no son ítems de navegación,
// solo entradas del catálogo para que `findRouteByPathname` resuelva su
// icono y su título traducido.
export const PRIVATE_ROUTES: Route[] = [
  {
    pathname: "/private-area",
    icon: User,
    subRoutes: [
      {
        pathname: "/private-area/profile",
        category: "menu",
        icon: User,
        isShownInSidebar: true,
        subRoutes: [
          {
            pathname: "/private-area/profile/security",
            category: "account",
            icon: Lock,
            isShownInSidebar: true,
          },
          {
            pathname: "/private-area/profile/sessions",
            category: "account",
            icon: Monitor,
            isShownInSidebar: true,
          },
          /*
           * El histórico de notificaciones, en «Cuenta» junto a sesiones y seguridad.
           *
           * Cuelga del perfil y no de `/private-area` porque el menú lateral se construye con
           * `MenuItems path="/private-area/profile"`: una ruta hermana no podría aparecer ahí, y hasta ahora
           * la única forma de llegar al histórico era el «ver todas» de la campana.
           *
           * Comparte nombre con `preferences/notifications` a propósito: son dos cosas distintas —lo que te
           * han avisado y cómo quieres que te avisemos— y el grupo del menú («Cuenta» frente a
           * «Preferencias») es lo que las distingue, igual que en cualquier aplicación con bandeja y ajustes.
           */
          {
            pathname: "/private-area/profile/notifications",
            category: "account",
            icon: Bell,
            isShownInSidebar: true,
          },
          {
            // Solo agrupa: la pantalla real es cada una de sus subrutas
            // (mismo patrón que `plantilla-nextjs`).
            pathname: "/private-area/profile/preferences",
            category: "preferences",
            icon: SlidersHorizontal,
            isShownInSidebar: true,
            hasPage: false,
            subRoutes: [
              {
                pathname: "/private-area/profile/preferences/locale",
                icon: Languages,
                isShownInSidebar: true,
              },
              {
                pathname: "/private-area/profile/preferences/theme",
                icon: SunMoon,
                isShownInSidebar: true,
              },
              {
                pathname: "/private-area/profile/preferences/datetime",
                icon: Calendar,
                isShownInSidebar: true,
              },
              {
                pathname: "/private-area/profile/preferences/notifications",
                icon: Bell,
                isShownInSidebar: true,
              },
            ],
          },
        ],
      },
      {
        // Sin `isShownInSidebar`: ya está en el navbar horizontal del área de
        // cliente (`shownInNavbar`), y `MenuItems path="/private-area"` (el
        // desplegable del menú de usuario) solo debe llevar lo que no está ahí.
        pathname: "/private-area/services",
        category: "menu",
        shownInNavbar: true,
        icon: Briefcase,
      },
      {
        pathname: "/private-area/services/[id]",
        shownInNavbar: false,
        icon: Briefcase,
      },
      {
        // Sin `shownInNavbar`: el enlace del navbar lo pinta `ClientAreaHeaderNav`
        // a partir de `communityHref` (resuelto en `ClientAreaHeader`, que decide
        // entre saltar directo a la única comunidad o al selector) — con esta
        // entrada también marcada `shownInNavbar: true` aparecían los dos enlaces
        // a la vez, ambos con el mismo texto "Comunidades".
        pathname: "/private-area/communities",
        category: "menu",
        icon: Building2,
      },
      {
        pathname: "/private-area/communities/[serviceId]",
        shownInNavbar: false,
        icon: Building2,
      },
      {
        pathname: "/private-area/communities/[serviceId]/residents",
        shownInNavbar: false,
        icon: Users,
      },
      {
        pathname: "/private-area/communities/[serviceId]/units",
        shownInNavbar: false,
        icon: Building2,
      },
      {
        pathname: "/private-area/communities/[serviceId]/keyrings",
        shownInNavbar: false,
        icon: KeyRound,
      },
      {
        pathname: "/private-area/communities/[serviceId]/locks",
        shownInNavbar: false,
        icon: DoorClosed,
      },
      {
        pathname: "/private-area/communities/[serviceId]/incidents",
        shownInNavbar: false,
        icon: TriangleAlert,
      },
      {
        pathname: "/private-area/communities/[serviceId]/access-log",
        shownInNavbar: false,
        icon: ScrollText,
      },
      {
        pathname: "/private-area/communities/[serviceId]/settings",
        shownInNavbar: false,
        icon: Settings,
      },
      {
        pathname: "/private-area/quotes",
        category: "menu",
        shownInNavbar: true,
        icon: FileText,
      },
      {
        pathname: "/private-area/quotes/[id]",
        shownInNavbar: false,
        icon: FileText,
      },
      {
        pathname: "/private-area/invoices",
        category: "menu",
        shownInNavbar: true,
        icon: Receipt,
      },
      {
        pathname: "/private-area/invoices/[id]",
        shownInNavbar: false,
        icon: Receipt,
      },
      {
        pathname: "/private-area/incidents",
        category: "menu",
        shownInNavbar: true,
        icon: TriangleAlert,
      },
      // Antes que `[id]`: es una ruta estática, y así se lee en el catálogo en el mismo orden en
      // que Next.js las resuelve (lo estático gana a lo dinámico).
      {
        pathname: "/private-area/incidents/new",
        shownInNavbar: false,
        icon: TriangleAlert,
      },
      {
        pathname: "/private-area/incidents/[id]",
        shownInNavbar: false,
        icon: TriangleAlert,
      },
    ],
  },
];

// Secciones internas de una comunidad ya seleccionada. Es una lista propia y
// no un `MenuItems` sobre `PRIVATE_ROUTES` a propósito: el catálogo de
// `routing.ts` fue diseñado para rutas estáticas y `MenuItems` no sabe
// resolver el segmento `[serviceId]`, que aquí llega en tiempo de ejecución.
// `CommunitySidebar` construye los `href` a partir de estas claves canónicas,
// y usa `requiredFlag` para no ofrecer una sección cuyo módulo el cliente no
// tiene activado: el backend ya rechaza esas rutas con 403
// (`assertKeyringEnabled`, requisitos-app-comunidad.md sección 7.6), así que
// mostrarlas sin más llevaría a un enlace que siempre falla.
export const COMMUNITY_SECTION_ROUTES: {
  pathname: string;
  icon: LucideIcon;
  requiredFlag?: "keyringEnabled";
}[] = [
  // La portada de la comunidad va primera y sin `requiredFlag`: es el resumen, y siempre hay algo que
  // resumir aunque no haya llaveros contratados.
  { pathname: "/private-area/communities/[serviceId]", icon: LayoutDashboard },
  { pathname: "/private-area/communities/[serviceId]/residents", icon: Users },
  { pathname: "/private-area/communities/[serviceId]/units", icon: Building2 },
  {
    pathname: "/private-area/communities/[serviceId]/keyrings",
    icon: KeyRound,
    requiredFlag: "keyringEnabled",
  },
  {
    pathname: "/private-area/communities/[serviceId]/locks",
    icon: DoorClosed,
    requiredFlag: "keyringEnabled",
  },
  {
    pathname: "/private-area/communities/[serviceId]/incidents",
    icon: TriangleAlert,
  },
  {
    pathname: "/private-area/communities/[serviceId]/access-log",
    icon: ScrollText,
    requiredFlag: "keyringEnabled",
  },
  {
    pathname: "/private-area/communities/[serviceId]/settings",
    icon: Settings,
  },
];

// Servicios, presupuestos y facturas de primer nivel (sin perfil), para los
// enlaces centrados de `ClientAreaHeader` — no necesita todo `PRIVATE_ROUTES`.
// El `Navbar` público NO debe mostrar estos enlaces: solo tienen sentido
// dentro del área privada, con sesión ya iniciada.
export const AREA_PRIVADA_ROUTES: Route[] =
  PRIVATE_ROUTES[0].subRoutes?.filter(
    (route) => route.pathname !== "/private-area/profile",
  ) ?? [];
