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
