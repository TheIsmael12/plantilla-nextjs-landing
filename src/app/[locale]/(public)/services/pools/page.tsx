import PoolsViewPage from '@/views/(public)/services/PoolsViewPage';

interface PoolsServicePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de la ficha del servicio de mantenimiento de piscinas.
 * @param {PoolsServicePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha de servicio renderizada
 */
export default async function PoolsServicePage({ params }: PoolsServicePageProps) {
    const { locale } = await params;

    return <PoolsViewPage locale={locale} />;
}
