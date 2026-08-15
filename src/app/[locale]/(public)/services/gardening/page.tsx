import GardeningViewPage from '@/views/(public)/services/GardeningViewPage';

interface GardeningServicePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de la ficha del servicio de jardinería.
 * @param {GardeningServicePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha de servicio renderizada
 */
export default async function GardeningServicePage({ params }: GardeningServicePageProps) {
    const { locale } = await params;

    return <GardeningViewPage locale={locale} />;
}
