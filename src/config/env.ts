/**
 * Variables de entorno **públicas**: todas leídas de `NEXT_PUBLIC_*`, seguras
 * de importar desde un Client Component — un bundle de cliente se descompila,
 * así que nada que no deba ser público puede vivir aquí. Las variables de
 * solo servidor (`API_BASE_URL`, `NEXTAUTH_SECRET`...) están en
 * `config/env.server.ts`, en un módulo aparte a propósito: ver el comentario
 * de cabecera de ese fichero para el bug real que causó tenerlas juntas.
 */

/**
 * Una coordenada leída del entorno, o `undefined` si no está puesta o no es un número.
 *
 * **Sin valor por defecto, a propósito.** Antes caían al centro de Madrid, y eso convertía una variable sin
 * rellenar en un mapa que funciona pero señala otro sitio: el pin salía en la Puerta del Sol mientras la
 * dirección impresa justo al lado decía otra calle y otro código postal, y nada en la pantalla delataba que
 * faltara configuración. Sin coordenadas no se pinta el mapa, y eso sí se nota.
 * @param {string | undefined} value - El valor de la variable de entorno
 * @returns {number | undefined} La coordenada, o `undefined`
 */
const coordinate = (value: string | undefined): number | undefined => {
  const parsed = Number(value);
  return value !== undefined && value !== "" && Number.isFinite(parsed) ? parsed : undefined;
};

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

  /*
   * Identidad legal: **sin valores de ejemplo**.
   *
   * Los que había aquí acabaron publicados en imora.es —CIF `B12345678`, «Calle Ejemplo, 123»— porque
   * estas variables no estaban puestas en el entorno del despliegue y el valor por defecto salió solo. Un
   * dato legal que falta tiene que verse que falta; `checkCompanyIdentity` (config/companyIdentity.ts) lo
   * comprueba al construir y en producción corta el build.
   *
   * Se deja cadena vacía y no un `throw` porque este módulo lo carga también el navegador: reventar aquí
   * tumbaría la página entera por un dato que solo importa en dos pantallas.
   */
  COMPANY_CIF: process.env.NEXT_PUBLIC_COMPANY_CIF || "",
  COMPANY_NAME: process.env.NEXT_PUBLIC_COMPANY_NAME || "Imora Servicios S.L.",
  
  // Contact information
  COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@imora.es",
  COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || "",

  // La dirección de la sede, por el mismo motivo que el CIF: sin ejemplos.
  COMPANY_ADDRESS: process.env.NEXT_PUBLIC_COMPANY_STREET_ADDRESS || "",
  COMPANY_POSTAL_CODE: process.env.NEXT_PUBLIC_COMPANY_POSTAL_CODE || "",
  COMPANY_CITY: process.env.NEXT_PUBLIC_COMPANY_CITY || "",
  COMPANY_STATE: process.env.NEXT_PUBLIC_COMPANY_STATE || "",
  COMPANY_COUNTRY: process.env.NEXT_PUBLIC_COMPANY_COUNTRY || "",

  // Coordenadas de la sede: el pin del mapa y el marcado `geo`. Tienen que ser
  // las de COMPANY_ADDRESS, y sin ellas no se pinta ningún mapa — ver
  // `coordinate` arriba y `utils/companyAddressUtils.ts`.
  COMPANY_LATITUDE: coordinate(process.env.NEXT_PUBLIC_COMPANY_LATITUDE),
  COMPANY_LONGITUDE: coordinate(process.env.NEXT_PUBLIC_COMPANY_LONGITUDE),

  COMPANY_SCHEDULE: process.env.NEXT_PUBLIC_COMPANY_SCHEDULE || "Oficina: L-V 9:00-18:00 · Urgencias 24h, 365 días",

  /*
   * Teléfono de urgencias, 24h/365 para incidencias fuera de horario.
   *
   * Sin ejemplo: un número inventado en un botón de urgencias es peor que no tener botón — quien lo pulsa
   * a las tres de la mañana cree que ha llamado a alguien.
   */
  COMPANY_EMERGENCY_PHONE: process.env.NEXT_PUBLIC_COMPANY_EMERGENCY_PHONE || "",

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
