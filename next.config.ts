import path from 'node:path';

import {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// El paquete `next-auth` no está instalado (todavía no hay autenticación
// real conectada): se redirige al stub local en ambos bundlers (webpack y
// Turbopack), igual que hace `types/next-auth.d.ts` para el tipado y
// `.storybook/main.ts` para Storybook.
const NEXT_AUTH_REACT_STUB = path.resolve(__dirname, 'src/lib/next-auth-react.tsx');

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'images.unsplash.com',
			},
		],
	},
	webpack: (config) => {
		config.resolve.alias['next-auth/react'] = NEXT_AUTH_REACT_STUB;
		return config;
	},
	turbopack: {
		resolveAlias: {
			'next-auth/react': NEXT_AUTH_REACT_STUB,
		},
	},
};
 
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);