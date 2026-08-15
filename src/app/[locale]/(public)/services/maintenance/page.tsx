import MaintenanceViewPage from '@/views/(public)/services/MaintenanceViewPage';

interface MaintenanceServicePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de la ficha del servicio de mantenimiento de edificios.
 * @param {MaintenanceServicePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha de servicio renderizada
 */
export default async function MaintenanceServicePage({ params }: MaintenanceServicePageProps) {
    const { locale } = await params;

    return <MaintenanceViewPage locale={locale} />;
}
