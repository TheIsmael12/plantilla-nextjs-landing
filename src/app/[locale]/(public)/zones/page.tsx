import ZonesIndexViewPage from '@/views/(public)/zones/ZonesIndexViewPage';

interface ZonesIndexPageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Índice de zonas de cobertura del sitio público.
 * @param {ZonesIndexPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista renderizada
 */
export default async function ZonesIndexPage({ params }: ZonesIndexPageProps) {
    const { locale } = await params;

    return <ZonesIndexViewPage locale={locale} />;
}
