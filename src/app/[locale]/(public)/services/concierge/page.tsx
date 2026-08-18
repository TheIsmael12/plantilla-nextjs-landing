import ConciergeViewPage from '@/views/(public)/services/ConciergeViewPage';

interface ConciergeServicePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de la ficha del servicio de conserjería y control de accesos.
 * @param {ConciergeServicePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha de servicio renderizada
 */
export default async function ConciergeServicePage({ params }: ConciergeServicePageProps) {
    const { locale } = await params;

    return <ConciergeViewPage locale={locale} />;
}
