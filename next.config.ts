import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
	// `babel-plugin-react-compiler` ya está instalado como devDependency:
	// esta flag lo activa de verdad (si no, el paquete no hace nada).
	reactCompiler: true,
	experimental: {
		// Por defecto Next genera un archivo CSS por cada punto de entrada que
		// importa estilos (cada componente con su propio `import '*.scss'`), lo
		// que en el home se traducía en más de una decena de `<link>` que
		// bloquean el render, cada uno de un par de KiB. `'strict'` agrupa el
		// CSS que comparten las páginas en menos archivos más grandes, tantas
		// peticiones bloqueantes menos en la ruta crítica.
		cssChunking: 'strict',
	},
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
	 * Cabeceras de seguridad aplicadas a todas las rutas, salvo la CSP: esa la
	 * pone `proxy.ts` (`config/csp.ts`) porque necesita variar por petición
	 * (el nonce de `script-src`) — algo que este `headers()` estático no puede
	 * hacer. HSTS y COOP se omiten en desarrollo: HSTS porque en
	 * `http://localhost` no aplica y, una vez enviada, el navegador la
	 * recuerda durante meses para todo el dominio; COOP porque no aporta nada
	 * mientras no haya CSP con la que razonar en conjunto ahí.
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
					...(isDevelopment
						? []
						: [
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
