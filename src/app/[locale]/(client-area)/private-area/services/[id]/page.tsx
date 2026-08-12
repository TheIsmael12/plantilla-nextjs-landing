import ServicesDetailsViewPage from '@/views/(client-area)/private-area/services/details/ServicesDetailsViewPage';

interface ServiceDetailPageProps {
    params: Promise<{ locale: string; id: string }>;
}

/**
 * Página de `/private-area/services/[id]`: detalle de un servicio contratado.
 * @param {ServiceDetailPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de detalle del servicio renderizada
 */
export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
    const { locale, id } = await params;

    return <ServicesDetailsViewPage id={id} locale={locale} />;
}
