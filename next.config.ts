import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isDevelopment = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
	// `babel-plugin-react-compiler` ya está instalado como devDependency:
	// esta flag lo activa de verdad (si no, el paquete no hace nada).
	reactCompiler: true,

	experimental: {
		// El formulario de candidatura sube el CV por una acción de servidor, y el tope por defecto de su
		// cuerpo es 1 MB: un currículum de 5 MB (`CAREERS_MAX_CV_MB` en el backend) fallaba antes de salir
		// del navegador, con un error genérico y sin pista de cuál era el límite. Se deja un poco por encima
		// del máximo real para que el rechazo lo dé el backend, que sí explica el motivo.
		serverActions: {
			bodySizeLimit: '6mb',
		},
		// PageSpeed marcaba ~19 archivos CSS de 1-3,6 KiB cada uno bloqueando el renderizado
		// (~650ms de LCP): son los `import '@/styles/....scss'` que hace cada componente por
		// separado. `'graph'` es el modo de fusión basado en coste que soporta Turbopack
		// (`false`/`'strict'` son solo para webpack), requiere Next ≥16.3.1 (antes solo existía
		// `true`/`'strict'`, sin el shape de objeto). Probado con `requestCost` en 60000 y en
		// 200000 (10x el default): en ningún caso bajó el número de archivos CSS de la home —
		// el algoritmo agrupa por árbol de dependencias de import, y con ~20 componentes
		// importando cada uno su propio `.scss` sin compartir un padre común, no hay grupos que
		// fusionar por mucho que suba el coste. La causa real es la cantidad de imports de
		// estilos por componente, no algo que este flag pueda arreglar por sí solo — se deja
		// activo por si ayuda en el futuro (no empeora nada), pero el problema de fondo requiere
		// consolidar esos imports, un cambio de arquitectura de CSS aparte.
		//
		// Solo bajo `TURBOPACK` (variable que el propio `next dev`/`next build` define al
		// arrancar con Turbopack de verdad): `@storybook/nextjs-vite` importa este fichero para
		// reutilizar su configuración dentro de un pipeline Vite, y Next rechaza `'graph'` fuera
		// de un contexto Turbopack real con `Error: experimental.cssChunking: "graph" is only
		// supported with Turbopack` — rompía `vitest run --project=unit`, que carga toda
		// `vitest.config.ts` (incluido el proyecto de Storybook) aunque solo filtre por "unit".
		...(process.env.TURBOPACK
			? {
					cssChunking: {
						type: 'graph' as const,
						requestCost: 60000,
					},
				}
			: {}),
	},
	images: {
		remotePatterns: [
			// Backend en desarrollo, sirve las portadas/avatares del blog en
			// `/media/blog/**` (URLs absolutas, sin firma).
			{ protocol: 'http', hostname: 'localhost', port: '5000' },
			// TODO: añadir aquí el hostname real del backend en producción.
			{ protocol: 'https', hostname: 'api.imora.es' },
		],
		// Next.js solo sirve las calidades declaradas aquí; cualquier `quality`
		// que pida un componente y no esté en esta lista se ignora en
		// silencio y cae a 75 (el `quality={60}` de `ImageLogo.tsx` no
		// hacía nada sin esto — la URL de producción seguía saliendo con
		// `q=75` aunque el código ya pedía 60).
		qualities: [60, 75],
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
