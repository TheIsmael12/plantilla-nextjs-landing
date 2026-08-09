import { getBlogFeedEntries } from "@/actions/blog/blog-actions";
import { ENV } from "@/config/env";
import { DEFAULT_LOCALE } from "@/config/locales";

const BASE_URL = ENV.APP_URL.replace(/\/$/, "");

/**
 * Escapa los caracteres especiales de XML en un texto, para poder incrustar
 * títulos/extractos arbitrarios del backend dentro del feed sin romper el
 * XML si contienen `&`, `<`, `>` o comillas.
 * @param {string} value - Texto a escapar
 * @returns {string} El texto seguro para insertar en un nodo XML
 */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Genera el feed RSS 2.0 del blog (`/feed.xml`), en el idioma por defecto
 * del sitio (mismo criterio que `llms.txt`: un único fichero por sitio, no
 * uno por idioma). Solo incluye el resumen de cada entrada
 * (`GET /blog/feed-entries`, nunca el body completo) — un lector RSS enlaza
 * al post real para leerlo entero.
 * @returns {Promise<Response>} El feed, servido como `application/rss+xml`
 */
export async function GET(): Promise<Response> {
  const response = await getBlogFeedEntries(DEFAULT_LOCALE);
  const entries = response.data ?? [];

  const items = entries
    .map((entry) => {
      const url = `${BASE_URL}/blog/${entry.slug}`;
      const pubDate = new Date(entry.publishedAt).toUTCString();

      return `    <item>
      <title>${escapeXml(entry.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="false">${escapeXml(entry.guid)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(entry.excerpt)}</description>
      <author>${escapeXml(entry.author)}</author>
      ${entry.category ? `<category>${escapeXml(entry.category)}</category>` : ""}
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(ENV.APP_NAME)} — Blog</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(ENV.APP_NAME)}</description>
    <language>${DEFAULT_LOCALE}</language>
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
