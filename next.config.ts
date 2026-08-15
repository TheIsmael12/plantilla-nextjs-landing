import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Origen del backend, necesario en `img-src`/`connect-src`: las portadas del
 * blog y otros recursos se sirven desde ahí, no desde el propio dominio. Se
 * deduce de `API_BASE_URL` (la misma variable que usa `config/env.ts`); si no
 * está definida, la CSP se queda sin ese origen en vez de impedir el arranque
 * — de que falte la variable ya se queja `env.ts`.
 */
const backendOrigin = (() => {
	try {
		return new URL(process.env.API_BASE_URL ?? '').origin;
	} catch {
		return '';
	}
})();

/** Widget de captcha del formulario de contacto (`Captcha.tsx`): único script de terceros de la app. */
const TURNSTILE_ORIGIN = 'https://challenges.cloudflare.com';

/**
 * Content-Security-Policy de la aplicación, aplicada solo en producción.
 *
 * En desarrollo se omite por completo (ver `headers()`): Turbopack usa
 * `eval()` para el recargado en caliente en más puntos de los que cubre
 * `'unsafe-eval'`, y Trusted Types bloquearía tanto ese runtime de dev como
 * la propia app (`Captcha.tsx` asigna `script.src` como string plano). Pelear
 * contra las herramientas de desarrollo no protege a nadie — la CSP importa
 * en producción, que es donde de verdad se sirve a usuarios.
 *
 * `'unsafe-inline'` en `script-src` es obligado mientras no haya un nonce por
 * petición: Next.js inyecta en línea los scripts de arranque y la carga útil
 * de RSC.
 *
 * `require-trusted-types-for 'script'` obliga a que cualquier asignación a un
 * sumidero DOM peligroso (`innerHTML`, `document.write`...) pase por un
 * `TrustedTypePolicy`, en vez de aceptar cualquier string.
 *
 * `trusted-types default html 'allow-duplicates'` — y no `'none'` — porque hay
 * dos políticas legítimas en juego, y una de ellas se registra más de una vez:
 *
 * - `default`: la registra `[locale]/layout.tsx` en un script inline, antes de
 *   que cargue nada más, para el propio runtime de producción de React/Next
 *   (hidratación, algún `innerHTML` interno de una librería). Sin ella, esas
 *   asignaciones quedaban bloqueadas de verdad en producción («This document
 *   requires 'TrustedHTML' assignment», no solo un aviso).
 * - `html`: la registra **Swiper** (`ReviewsSection.tsx`/`ServicesCarouselSection.tsx`,
 *   `swiper/shared/utils.mjs` → `setInnerHTML`) cada vez que necesita asignar
 *   `innerHTML` — y lo hace con `trustedTypes.createPolicy('html', …)` sin
 *   comprobar si ya existe. Como cada carrusel se carga con su propio
 *   `next/dynamic(() => import(...))` (`ReviewsSectionLazy.tsx`/
 *   `ServicesCarouselSectionLazy.tsx`), Turbopack empaqueta el runtime de
 *   Swiper por duplicado en dos chunks distintos; cuando ambos carruseles
 *   están montados en el home a la vez, el segundo `createPolicy('html', …)`
 *   choca con el primero («Policy with name "html" already exists»). No hay
 *   forma de inyectarle a Swiper 14.0.2 una política ya creada — es
 *   `setInnerHTML` quien decide, no algo configurable desde fuera—, así que
 *   `'allow-duplicates'` es la salida real: es la keyword que la propia CSP
 *   ofrece para esto, permite registrar una política con un nombre ya usado
 *   en vez de bloquearla.
 *
 * Cuando existe una política llamada exactamente `default`, el navegador la
 * usa automáticamente para cualquier asignación que no pase ya por una
 * política explícita.
 */
const contentSecurityPolicy = [
	"default-src 'self'",
	`script-src 'self' 'unsafe-inline' ${TURNSTILE_ORIGIN}`,
	"style-src 'self' 'unsafe-inline'",
	`img-src 'self' data: blob:${backendOrigin ? ` ${backendOrigin}` : ''}`,
	"font-src 'self' data:",
	`connect-src 'self'${backendOrigin ? ` ${backendOrigin}` : ''}`,
	`frame-src 'self' ${TURNSTILE_ORIGIN}`,
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	"frame-ancestors 'none'",
	"require-trusted-types-for 'script'",
	"trusted-types default html 'allow-duplicates'",
].join('; ');

const nextConfig: NextConfig = {
	// `babel-plugin-react-compiler` ya está instalado como devDependency:
	// esta flag lo activa de verdad (si no, el paquete no hace nada).
	reactCompiler: true,
	images: {
		remotePatterns: [
			// Backend en desarrollo, sirve las portadas/avatares del blog en
			// `/media/blog/**` (URLs absolutas, sin firma).
			{ protocol: 'http', hostname: 'localhost', port: '5000' },
			// TODO: añadir aquí el hostname real del backend en producción.
			{ protocol: 'https', hostname: 'api.imora.es' },
		],
	},

	/**
	 * Cabeceras de seguridad aplicadas a todas las rutas. HSTS se omite en
	 * desarrollo: en `http://localhost` no aplica y, una vez enviada, el
	 * navegador la recuerda durante meses para todo el dominio.
	 * @returns {Promise<{source: string, headers: {key: string, value: string}[]}[]>} Las cabeceras de cada respuesta
	 */
	async headers() {
		return [
			{
				source: '/:path*',
				headers: [
					{ key: 'X-Content-Type-Options', value: 'nosniff' },
					{ key: 'X-Frame-Options', value: 'DENY' },
					{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
					{
						key: 'Permissions-Policy',
						value: 'camera=(), microphone=(), geolocation=(), payment=()',
					},
					// CSP, COOP y HSTS solo en producción: en desarrollo, Turbopack
					// (eval() del HMR) y Trusted Types (script.src de Turnstile,
					// innerHTML del propio runtime de React) chocan con una política
					// pensada para el bundle final. Ver comentario de `contentSecurityPolicy`.
					...(isDevelopment
						? []
						: [
								{ key: 'Content-Security-Policy', value: contentSecurityPolicy },
								{ key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
								{
									key: 'Strict-Transport-Security',
									value: 'max-age=63072000; includeSubDomains; preload',
								},
							]),
				],
			},
		];
	},
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
