import { safeJsonLd } from "@/utils/jsonLdUtils";

/** Lo mínimo de la API de Trusted Types que usa la política. */
interface TrustedTypesLike {
  createPolicy: (
    name: string,
    rules: {
      createHTML: (value: string) => string | null;
      createScript: (value: string) => string;
      createScriptURL: (value: string) => string | null;
    },
  ) => unknown;
}

/**
 * Registra la política Trusted Types `default`. **Se serializa con `toString()`** y se ejecuta como script
 * inline en `[locale]/layout.tsx`, antes que nada más: por eso no puede usar nada que no sea global
 * (`window`, `document`, `URL`) ni importar nada — todo lo que necesita va dentro o llega por parámetro.
 *
 * Antes era una política de paso (`createHTML: (s) => s` y lo mismo para las otras dos), y eso anulaba
 * `require-trusted-types-for 'script'`: cualquier `innerHTML` o `script.src` que no pasara por una política
 * propia (Next, Swiper, GTM) caía en `default` y se aceptaba sin mirar, que es justo el hueco que un XSS
 * basado en DOM aprovecha. Ahora:
 *
 * - `createHTML` **rechaza** (devuelve `null`, y el navegador bloquea la asignación) el HTML con lo que
 *   convierte un `innerHTML` en ejecución: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<base>`, `<meta>`,
 *   `<link>`, `<form>`, atributos `on*=`, `srcdoc=` y URLs `javascript:`/`vbscript:`/`data:text/html`. Deja
 *   pasar el resto: lo usan librerías de terceros con HTML propio e inocuo (los controles y la atribución de
 *   Leaflet, los tooltips de ECharts), y los JSON-LD, que ya van escapados por `safeJsonLd` y no llevan `<`.
 *   Es una lista de denegación, no un saneador completo: no convierte en seguro un HTML arbitrario, pero
 *   corta los vectores de ejecución directa.
 * - `createScriptURL` solo acepta scripts del propio origen (incluidos los `blob:` propios, que usan los
 *   workers) y de los orígenes de `script-src` (`config/csp.ts`, {@link buildTrustedTypesPolicyScript}):
 *   Turnstile y, con contenedor configurado, los de medición de Google. El script de arranque de GTM crea
 *   el `<script src="https://www.googletagmanager.com/gtm.js">` desde fuera de su propia política, así que
 *   pasa por aquí y está en la lista.
 * - `createScript` sigue de paso: lo usa `next/script` para el script inline de arranque de GTM y no hay
 *   forma de validar JavaScript arbitrario con una comprobación de texto. La protección contra scripts
 *   inline inyectados la da el nonce de `script-src`, no esta política.
 * @param {string[]} allowedOrigins - Orígenes de terceros admitidos para URLs de script (con `*.` de comodín)
 * @returns {void}
 */
function registerDefaultTrustedTypesPolicy(allowedOrigins: string[]): void {
  const trustedTypes = (window as unknown as { trustedTypes?: TrustedTypesLike }).trustedTypes;
  if (!trustedTypes || !trustedTypes.createPolicy) return;

  const dangerousHtml = [
    /<\s*(script|iframe|frame|object|embed|base|meta|link|form)\b/i,
    /[\s"'/]on[a-z]+\s*=/i,
    /srcdoc\s*=/i,
    /(javascript|vbscript)\s*:/i,
    /data\s*:\s*text\/html/i,
  ];

  const emptyScriptElement = /^<script><\/script>$/;

  const isAllowedOrigin = (url: URL): boolean => {
    if (url.origin === window.location.origin) return true;

    return allowedOrigins.some((allowed) => {
      const wildcard = allowed.indexOf("://*.");
      if (wildcard === -1) return url.origin === allowed;

      const protocol = allowed.slice(0, wildcard + 1);
      const suffix = allowed.slice(wildcard + 4);
      return url.protocol === protocol && url.hostname.endsWith(suffix);
    });
  };

  try {
    trustedTypes.createPolicy("default", {
      // Sin `<` no hay markup: el valor es texto plano (típicamente el JSON-LD de un post, que `safeJsonLd`
      // ya deja sin `<`) y no puede crear elementos. Pasarle las regex de abajo daba falsos positivos con
      // texto del artículo («javascript:», « on x = »...) y React reventaba con «requires 'TrustedHTML'
      // assignment» al hidratar la página.
      //
      // Excepción exacta: React crea CADA `<script>` en el cliente con
      // `div.innerHTML` con un script vacío (react-dom, `createElement`, caso "script") para que el
      // navegador no lo ejecute. Es un elemento vacío y sin atributos: inocuo, y bloquearlo tumba la
      // hidratación de toda página con JSON-LD o con el arranque de GTM.
      //
      // OJO: esta función se serializa dentro de un `<script>` inline, así que aquí no puede aparecer el texto de
      // cierre de script literal —cerraría la etiqueta a mitad de la política y daría «Invalid or unexpected token»—.
      // Por eso es una regex con la barra escapada y no una comparación de cadenas.
      createHTML: (value) =>
        emptyScriptElement.test(value) ||
        value.indexOf("<") === -1 ||
        !dangerousHtml.some((pattern) => pattern.test(value))
          ? value
          : null,
      createScript: (value) => value,
      createScriptURL: (value) => {
        try {
          return isAllowedOrigin(new URL(value, document.baseURI)) ? value : null;
        } catch {
          return null;
        }
      },
    });
  } catch {
    // Ya registrada (p. ej. otra instancia del layout en la misma página): se deja la que había.
  }
}

/**
 * El código del script inline que registra la política `default`, con los orígenes admitidos ya dentro.
 * @param {string[]} allowedOrigins - Orígenes de terceros admitidos para URLs de script
 * @returns {string} El script, listo para `dangerouslySetInnerHTML`
 */
export function buildTrustedTypesPolicyScript(allowedOrigins: string[]): string {
  return `(${registerDefaultTrustedTypesPolicy.toString()})(${safeJsonLd(allowedOrigins)});`;
}
