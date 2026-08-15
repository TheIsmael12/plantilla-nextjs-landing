export const locales = ["en", "es"] as const;

export const pathnames = {
  // Página principal
  "/": "/",

  // Páginas estáticas
  "/services": {
    en: "/services",
    es: "/servicios",
  },
  // Una entrada por servicio (no una ruta dinámica `[service]`), para que
  // cada uno tenga su propio segmento traducido en español — igual que el
  // resto de páginas estáticas. Los slugs son los mismos que `SERVICE_SLUGS`
  // en `config/routing.ts`.
  "/services/concierge": {
    en: "/services/concierge",
    es: "/servicios/conserjeria",
  },
  "/services/security": {
    en: "/services/security",
    es: "/servicios/seguridad",
  },
  "/services/pools": {
    en: "/services/pools",
    es: "/servicios/piscinas",
  },
  "/services/cleaning": {
    en: "/services/cleaning",
    es: "/servicios/limpieza",
  },
  "/services/gardening": {
    en: "/services/gardening",
    es: "/servicios/jardineria",
  },
  "/services/maintenance": {
    en: "/services/maintenance",
    es: "/servicios/mantenimiento",
  },
  "/about": {
    en: "/about",
    es: "/sobre-nosotros",
  },
  // Landing dirigida a administradores de fincas (requisitos-seo.md §6): cliente B2B
  // que gestiona varias comunidades a la vez, con intención de búsqueda distinta a la
  // de un presidente de comunidad, así que necesita su propia página y no solo un
  // párrafo dentro de /about.
  "/for/property-managers": {
    en: "/for/property-managers",
    es: "/para/administradores-de-fincas",
  },
  // Índice de zonas (requisitos-seo.md §13, auditoría 2026-08-15): sin esta página, `/zonas`
  // (quitar el último segmento de la URL de cualquier zona) daba 404 — no había ningún sitio
  // que listara las 20 juntas.
  "/zones": {
    en: "/zones",
    es: "/zonas",
  },
  // Páginas de zona (requisitos-seo.md §4): una por cada municipio de `config/zones.ts`, no
  // una ruta dinámica `[city]` — mismo criterio que los servicios de arriba, y necesario para
  // que `generateMetadata.ts`/`BreadcrumbJsonLd.tsx` las resuelvan (ambos excluyen
  // explícitamente cualquier pathname con `[`). El nombre del municipio no se traduce entre
  // idiomas (es un topónimo, no un término de catálogo), así que el slug es el mismo en `en`/`es`.
  "/zones/madrid": {
    en: "/zones/madrid",
    es: "/zonas/madrid",
  },
  "/zones/pozuelo-de-alarcon": {
    en: "/zones/pozuelo-de-alarcon",
    es: "/zonas/pozuelo-de-alarcon",
  },
  "/zones/alcorcon": {
    en: "/zones/alcorcon",
    es: "/zonas/alcorcon",
  },
  "/zones/majadahonda": {
    en: "/zones/majadahonda",
    es: "/zonas/majadahonda",
  },
  "/zones/las-rozas": {
    en: "/zones/las-rozas",
    es: "/zonas/las-rozas",
  },
  "/zones/boadilla-del-monte": {
    en: "/zones/boadilla-del-monte",
    es: "/zonas/boadilla-del-monte",
  },
  "/zones/alcobendas": {
    en: "/zones/alcobendas",
    es: "/zonas/alcobendas",
  },
  "/zones/san-sebastian-de-los-reyes": {
    en: "/zones/san-sebastian-de-los-reyes",
    es: "/zonas/san-sebastian-de-los-reyes",
  },
  "/zones/tres-cantos": {
    en: "/zones/tres-cantos",
    es: "/zonas/tres-cantos",
  },
  "/zones/getafe": {
    en: "/zones/getafe",
    es: "/zonas/getafe",
  },
  "/zones/leganes": {
    en: "/zones/leganes",
    es: "/zonas/leganes",
  },
  "/zones/fuenlabrada": {
    en: "/zones/fuenlabrada",
    es: "/zonas/fuenlabrada",
  },
  "/zones/mostoles": {
    en: "/zones/mostoles",
    es: "/zonas/mostoles",
  },
  "/zones/torrejon-de-ardoz": {
    en: "/zones/torrejon-de-ardoz",
    es: "/zonas/torrejon-de-ardoz",
  },
  "/zones/coslada": {
    en: "/zones/coslada",
    es: "/zonas/coslada",
  },
  "/zones/rivas-vaciamadrid": {
    en: "/zones/rivas-vaciamadrid",
    es: "/zonas/rivas-vaciamadrid",
  },
  "/zones/colmenar-viejo": {
    en: "/zones/colmenar-viejo",
    es: "/zonas/colmenar-viejo",
  },
  "/zones/torrelodones": {
    en: "/zones/torrelodones",
    es: "/zonas/torrelodones",
  },
  "/zones/collado-villalba": {
    en: "/zones/collado-villalba",
    es: "/zonas/collado-villalba",
  },
  "/zones/arganda-del-rey": {
    en: "/zones/arganda-del-rey",
    es: "/zonas/arganda-del-rey",
  },
  "/contact": {
    en: "/contact",
    es: "/contacto",
  },

  // Otras páginas
  // Blog
  "/blog": "/blog",
  "/blog/[slug]": "/blog/[slug]",
  "/blog/author/[slug]": "/blog/author/[slug]",

  // Baja de comunicaciones comerciales (solo accesible desde el enlace del email)
  "/unsubscribe": {
    en: "/unsubscribe",
    es: "/darse-de-baja",
  },

  // Empleo
  "/careers": {
    en: "/careers",
    es: "/empleo",
  },

  // Ayuda y soporte
  "/help": {
    en: "/help",
    es: "/ayuda",
  },
  "/help/faq": {
    en: "/help/faq",
    es: "/ayuda/preguntas-frecuentes",
  },
  "/help/support": {
    en: "/help/support",
    es: "/ayuda/soporte",
  },

  // Términos y políticas
  "/privacy-policy": {
    en: "/privacy-policy",
    es: "/politica-privacidad",
  },
  "/conditions": {
    en: "/conditions",
    es: "/condiciones",
  },
  "/cookies-policy": {
    en: "/cookies-policy",
    es: "/politica-cookies",
  },

  "/complaints-channel": {
    en: "/complaints-channel",
    es: "/canal-de-reclamaciones",
  },

  // Autenticación y registro
  "/login": {
    en: "/login",
    es: "/iniciar-sesion",
  },
  "/forgot-password": {
    en: "/forgot-password",
    es: "/recuperar-acceso",
  },
  "/reset-password": {
    en: "/reset-password",
    es: "/recuperar-contrasena",
  },
  "/change-password": {
    en: "/change-password",
    es: "/cambiar-contrasena",
  },
  "/verify-email": {
    en: "/verify-email",
    es: "/verificar-email",
  },

  /* Enlaces de un vecino (app móvil), no del portal de cliente: el mismo pathname en los dos idiomas,
     a propósito, igual que `/blog/[slug]`. El backend (`ResidentAuthService`/`ResidentsService`)
     construye estas URLs una sola vez, en texto fijo, para el correo — no sabe en qué idioma las va a
     abrir quien lo lea. Un slug traducido aquí serviría solo para el idioma con el que coincidiera por
     casualidad; en el otro, el enlace del correo apuntaría a una ruta que Next.js no reconoce. */
  "/resident/reset-password/[token]": "/resident/reset-password/[token]",
  "/resident/invitation/[token]": "/resident/invitation/[token]",

  /* Área privada del cliente: perfil (datos personales + seguridad),
     servicios contratados, presupuestos y facturas, todo bajo el mismo
     prefijo `/private-area` (`/area-privada` en español). Clave canónica en
     inglés, como el resto del catálogo. */

  "/private-area": {
    en: "/private-area",
    es: "/area-privada",
  },
  "/private-area/profile": {
    en: "/private-area/profile",
    es: "/area-privada/perfil",
  },
  "/private-area/profile/security": {
    en: "/private-area/profile/security",
    es: "/area-privada/perfil/seguridad",
  },
  "/private-area/profile/sessions": {
    en: "/private-area/profile/sessions",
    es: "/area-privada/perfil/sesiones",
  },
  "/private-area/profile/preferences": {
    en: "/private-area/profile/preferences",
    es: "/area-privada/perfil/preferencias",
  },
  "/private-area/profile/preferences/locale": {
    en: "/private-area/profile/preferences/locale",
    es: "/area-privada/perfil/preferencias/idioma",
  },
  "/private-area/profile/preferences/theme": {
    en: "/private-area/profile/preferences/theme",
    es: "/area-privada/perfil/preferencias/tema",
  },
  "/private-area/profile/preferences/datetime": {
    en: "/private-area/profile/preferences/datetime",
    es: "/area-privada/perfil/preferencias/fecha-hora",
  },
  "/private-area/profile/preferences/notifications": {
    en: "/private-area/profile/preferences/notifications",
    es: "/area-privada/perfil/preferencias/notificaciones",
  },
  "/private-area/services": {
    en: "/private-area/services",
    es: "/area-privada/servicios",
  },
  "/private-area/services/[id]": {
    en: "/private-area/services/[id]",
    es: "/area-privada/servicios/[id]",
  },
  "/private-area/quotes": {
    en: "/private-area/quotes",
    es: "/area-privada/presupuestos",
  },
  "/private-area/quotes/[id]": {
    en: "/private-area/quotes/[id]",
    es: "/area-privada/presupuestos/[id]",
  },
  "/private-area/profile/notifications": {
    en: "/private-area/profile/notifications",
    es: "/area-privada/perfil/notificaciones",
  },
  /* Las incidencias del portal no cuelgan de una comunidad: `clientServiceId`
     puede ser `null`, así que viven en su propia ruta de primer nivel en vez
     de bajo `/communities/[serviceId]`. */
  "/private-area/incidents": {
    en: "/private-area/incidents",
    es: "/area-privada/incidencias",
  },
  /* Antes de `[id]` porque es estática: Next.js resuelve primero el segmento literal, así que
     `/incidencias/nueva` no cae en el detalle de una incidencia con id «nueva». */
  "/private-area/incidents/new": {
    en: "/private-area/incidents/new",
    es: "/area-privada/incidencias/nueva",
  },
  "/private-area/incidents/[id]": {
    en: "/private-area/incidents/[id]",
    es: "/area-privada/incidencias/[id]",
  },
  "/private-area/invoices": {
    en: "/private-area/invoices",
    es: "/area-privada/facturas",
  },
  "/private-area/invoices/[id]": {
    en: "/private-area/invoices/[id]",
    es: "/area-privada/facturas/[id]",
  },

  /* Módulo de comunidad: solo existe para los servicios contratados que
     tienen la app de comunidad activada, así que el segmento dinámico es el
     `serviceId` de ese servicio (no un id de comunidad propio). Cada
     subsección es una ruta estática colgando de él. */

  "/private-area/communities": {
    en: "/private-area/communities",
    es: "/area-privada/comunidades",
  },
  "/private-area/communities/[serviceId]": {
    en: "/private-area/communities/[serviceId]",
    es: "/area-privada/comunidades/[serviceId]",
  },
  "/private-area/communities/[serviceId]/residents": {
    en: "/private-area/communities/[serviceId]/residents",
    es: "/area-privada/comunidades/[serviceId]/vecinos",
  },
  "/private-area/communities/[serviceId]/units": {
    en: "/private-area/communities/[serviceId]/units",
    es: "/area-privada/comunidades/[serviceId]/unidades",
  },
  "/private-area/communities/[serviceId]/keyrings": {
    en: "/private-area/communities/[serviceId]/keyrings",
    es: "/area-privada/comunidades/[serviceId]/llaveros",
  },
  "/private-area/communities/[serviceId]/locks": {
    en: "/private-area/communities/[serviceId]/locks",
    es: "/area-privada/comunidades/[serviceId]/puertas",
  },
  "/private-area/communities/[serviceId]/incidents": {
    en: "/private-area/communities/[serviceId]/incidents",
    es: "/area-privada/comunidades/[serviceId]/incidencias",
  },
  "/private-area/communities/[serviceId]/access-log": {
    en: "/private-area/communities/[serviceId]/access-log",
    es: "/area-privada/comunidades/[serviceId]/registro-accesos",
  },
  "/private-area/communities/[serviceId]/settings": {
    en: "/private-area/communities/[serviceId]/settings",
    es: "/area-privada/comunidades/[serviceId]/configuracion",
  },
} as const;
