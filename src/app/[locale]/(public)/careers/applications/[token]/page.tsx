import type { Metadata } from 'next';

import ApplicationStatusViewPage from '@/views/(public)/careers/ApplicationStatusViewPage';

interface ApplicationStatusPageProps {
    params: Promise<{ locale: string; token: string }>;
}

/**
 * Metadatos del seguimiento de una candidatura: `noindex, nofollow` y nada más.
 *
 * No se hereda del layout a propósito. Es la página de una sola persona, a la que se llega por un enlace
 * firmado que va en un correo; que el token acabe en el índice de un buscador sería una fuga, no un
 * problema de posicionamiento. `robots.ts` bloquea además la ruta entera.
 * @returns {Metadata} Metadatos mínimos, sin indexación
 */
export function generateMetadata(): Metadata {
    return { robots: 'noindex, nofollow, noarchive' };
}

/**
 * Seguimiento de una candidatura desde el enlace del correo.
 * @param {ApplicationStatusPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} El seguimiento renderizado
 */
export default async function ApplicationStatusPage({ params }: ApplicationStatusPageProps) {
    const { locale, token } = await params;

    return <ApplicationStatusViewPage locale={locale} token={token} />;
}
