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
 * `trusted-types default html` — y no `'none'` — porque hay dos políticas
 * legítimas que registrarse en esta página:
 *
 * - `default`: la registra `[locale]/layout.tsx` en un script inline, antes de
 *   que cargue nada más, para el propio runtime de producción de React/Next
 *   (hidratación, algún `innerHTML` interno de una librería). Sin ella, esas
 *   asignaciones quedaban bloqueadas de verdad en producción («This document
 *   requires 'TrustedHTML' assignment», no solo un aviso).
 * - `html`: la registra el propio script de **Turnstile** (`Captcha.tsx`) al
 *   cargar — es Cloudflare quien la nombra así, no esta app—. Con solo
 *   `default` en la lista, Turnstile se rompía con «Policy "html" disallowed»
 *   en cuanto el widget del formulario de contacto intentaba iniciarse.
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
	"trusted-types default html",
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
