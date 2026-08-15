import CleaningViewPage from '@/views/(public)/services/CleaningViewPage';

interface CleaningServicePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de la ficha del servicio de limpieza y jardinería.
 * @param {CleaningServicePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha de servicio renderizada
 */
export default async function CleaningServicePage({ params }: CleaningServicePageProps) {
    const { locale } = await params;

    return <CleaningViewPage locale={locale} />;
}
