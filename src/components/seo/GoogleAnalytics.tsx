import Script from 'next/script';

import { ENV } from '@/config/env';

interface GoogleAnalyticsProps {
  nonce: string | undefined;
}

/**
 * Carga `gtag.js` (Google Analytics 4) solo si `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` está
 * configurado — sin `measurementId`, no se inyecta ningún script, así que un despliegue sin
 * GA4 no manda peticiones a Google de todas formas.
 *
 * `strategy="afterInteractive"` en vez de `beforeInteractive`: la medición de tráfico no debe
 * competir por el hilo principal con el contenido de la primera pintura (LCP), a diferencia de
 * un script que sí condicione lo que se ve primero.
 *
 * El `nonce` es obligatorio pasarlo aquí y no confiar solo en `'strict-dynamic'` de la CSP
 * (`config/csp.ts`): Next.js firma el `<script>` con este nonce, y aunque `'strict-dynamic'`
 * dejaría que un script con nonce cargue otros sin nonce propio, sin pasarlo explícitamente
 * `next/script` no sabría qué nonce estampar y el navegador lo bloquearía como si fuera
 * `'unsafe-inline'` (que la CSP ya no permite).
 * @param {GoogleAnalyticsProps} props - El nonce de la petición actual (`x-nonce`, ver `proxy.ts`)
 * @returns {JSX.Element | null} Los dos `<script>` de `gtag.js`, o `null` si no hay `measurementId` configurado
 */
export default function GoogleAnalytics({ nonce }: GoogleAnalyticsProps) {
  const measurementId = ENV.GOOGLE_ANALYTICS_ID;

  if (!measurementId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        nonce={nonce}
      />
      <Script id="google-analytics" strategy="afterInteractive" nonce={nonce}>
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
