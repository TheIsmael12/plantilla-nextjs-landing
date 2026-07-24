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
  "/blog/[id]": "/blog/[id]",

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
  "/reset-password": {
    en: "/reset-password",
    es: "/recuperar-contrasena",
  },
  "/verify-email": {
    en: "/verify-email",
    es: "/verificar-email",
  },

  /* Área de cliente */

  "/dashboard": {
    en: "/dashboard",
    es: "/panel",
  },
  "/profile": {
    en: "/profile",
    es: "/perfil",
  },
  "/profile/sessions": {
    en: "/profile/sessions",
    es: "/perfil/sesiones",
  },
  "/profile/security": {
    en: "/profile/security",
    es: "/perfil/seguridad",
  },
  "/profile/notifications": {
    en: "/profile/notifications",
    es: "/perfil/notificaciones",
  },
  "/profile/preferences": {
    en: "/profile/preferences",
    es: "/perfil/preferencias",
  },
  "/profile/preferences/locale": {
    en: "/profile/preferences/locale",
    es: "/perfil/preferencias/idioma",
  },
  "/profile/preferences/theme": {
    en: "/profile/preferences/theme",
    es: "/perfil/preferencias/apariencia",
  },
  "/profile/preferences/datetime": {
    en: "/profile/preferences/datetime",
    es: "/perfil/preferencias/fecha-hora",
  },
  "/users": {
    en: "/users",
    es: "/usuarios",
  },
  "/users/[id]": {
    en: "/users/[id]",
    es: "/usuarios/[id]",
  },
} as const;
