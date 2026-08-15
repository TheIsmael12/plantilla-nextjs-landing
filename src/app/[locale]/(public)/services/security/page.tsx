import SecurityViewPage from '@/views/(public)/services/SecurityViewPage';

interface SecurityServicePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de la ficha del servicio de seguridad y CCTV.
 * @param {SecurityServicePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha de servicio renderizada
 */
export default async function SecurityServicePage({ params }: SecurityServicePageProps) {
    const { locale } = await params;

    return <SecurityViewPage locale={locale} />;
}
