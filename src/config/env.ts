/**
 * Variables de entorno **públicas**: todas leídas de `NEXT_PUBLIC_*`, seguras
 * de importar desde un Client Component — un bundle de cliente se descompila,
 * así que nada que no deba ser público puede vivir aquí. Las variables de
 * solo servidor (`API_BASE_URL`, `NEXTAUTH_SECRET`...) están en
 * `config/env.server.ts`, en un módulo aparte a propósito: ver el comentario
 * de cabecera de ese fichero para el bug real que causó tenerlas juntas.
 */

export const ENV = {
  // App settings
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Imora",
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  PORT: process.env.PORT || 3000,

  // Captcha (Cloudflare Turnstile) — site key pública, se monta en cliente.
  TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",

  // SEO & GEO
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://imora.es",
  OG_IMAGE: process.env.NEXT_PUBLIC_OG_IMAGE || "/images/og-image.png",
  GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  // Analítica — contenedor de Google Tag Manager (`GTM-XXXXXXX`), que es
  // quien monta dentro las etiquetas de GA4 y demás. Vacío = sin medición:
  // `GoogleTagManager` no pinta nada y no se carga ningún script externo.
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || "",

  // Company information
  COMPANY_CIF: process.env.NEXT_PUBLIC_COMPANY_CIF || "B12345678",
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "Imora Servicios S.L.",
  
  // Contact information
  COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@imora.es",
  COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || "+34 913 559 135",

  // Address information (PENDIENTE: sustituir por la dirección real de la sede)
  COMPANY_ADDRESS: process.env.NEXT_PUBLIC_COMPANY_STREET_ADDRESS || "Calle Ejemplo, 123",
  COMPANY_POSTAL_CODE: process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE || "28029",
  COMPANY_CITY: process.env.NEXT_PUBLIC_COMPANY_CITY || "Madrid",
  COMPANY_STATE: process.env.NEXT_PUBLIC_COMPANY_STATE || "Madrid",
  COMPANY_COUNTRY: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || "España",

  // Coordenadas de la sede, para el marcado `geo` (PENDIENTE: sustituir por
  // las reales de la dirección definitiva; por defecto, centro de Madrid)
  COMPANY_LATITUDE: Number(process.env.NEXT_PUBLIC_COMPANY_LATITUDE) || 40.4168,
  COMPANY_LONGITUDE: Number(process.env.NEXT_PUBLIC_COMPANY_LONGITUDE) || -3.7038,

  COMPANY_SCHEDULE: process.env.NEXT_PUBLIC_COMPANY_SCHEDULE || "Oficina: L-V 9:00-18:00 · Urgencias 24h, 365 días",

  // Teléfono de urgencias, disponible 24h/365 días para incidencias fuera de horario
  COMPANY_EMERGENCY_PHONE: process.env.NEXT_PUBLIC_COMPANY_EMERGENCY_PHONE || "+34 900 123 456",

  // Legal and privacy contact emails
  COMPANY_PRIVACY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_PRIVACY_EMAIL || "privacy@imora.es",
  COMPANY_SECURITY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_SECURITY_EMAIL || "security@imora.es",
  COMPANY_LEGAL_EMAIL: process.env.NEXT_PUBLIC_COMPANY_LEGAL_EMAIL || "legal@imora.es",

  // Department contact emails
  COMPANY_SALES_EMAIL: process.env.NEXT_PUBLIC_COMPANY_SALES_EMAIL || "comercial@imora.es",
  COMPANY_SUPPORT_EMAIL: process.env.NEXT_PUBLIC_COMPANY_SUPPORT_EMAIL || "soporte@imora.es",
  COMPANY_BILLING_EMAIL: process.env.NEXT_PUBLIC_COMPANY_BILLING_EMAIL || "administracion@imora.es",

  // Social media links
  SOCIAL_TWITTER: process.env.NEXT_PUBLIC_SOCIAL_TWITTER,
  SOCIAL_FACEBOOK: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK,
  SOCIAL_LINKEDIN: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN,
  SOCIAL_INSTAGRAM: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM,
  SOCIAL_YOUTUBE: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE,
  SOCIAL_TIKTOK: process.env.NEXT_PUBLIC_SOCIAL_TIKTOK,
};
