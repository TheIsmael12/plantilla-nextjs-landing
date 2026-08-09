import type { LeadAttribution } from "@/types/leads/leads";

/**
 * Lee la atribución de la URL actual y del referente del documento.
 *
 * **Solo debe llamarse cuando `attributionConsent` va a viajar en `true`**:
 * los `utm_*`/`gclid`/`fbclid` y el referente son identificadores de
 * seguimiento, y el backend los descarta igualmente si no llega ese
 * consentimiento — la decisión está protegida en los dos lados, pero esta
 * función no decide por su cuenta si debe llamarse.
 *
 * Devuelve un objeto sin las claves vacías, para no mandar cadenas en
 * blanco que en la base de datos se leerían como "vino sin `utm_source`" en
 * vez de "no lo sabemos".
 * @returns {LeadAttribution} Los parámetros presentes en la URL, o un objeto vacío fuera del navegador
 */
export function readAttribution(): LeadAttribution {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  const attribution: LeadAttribution = {
    utmSource: params.get("utm_source") ?? undefined,
    utmMedium: params.get("utm_medium") ?? undefined,
    utmCampaign: params.get("utm_campaign") ?? undefined,
    utmTerm: params.get("utm_term") ?? undefined,
    utmContent: params.get("utm_content") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    fbclid: params.get("fbclid") ?? undefined,
    landingUrl: window.location.href,
    referrer: document.referrer || undefined,
  };

  return Object.fromEntries(
    Object.entries(attribution).filter(([, value]) => Boolean(value)),
  ) as LeadAttribution;
}
