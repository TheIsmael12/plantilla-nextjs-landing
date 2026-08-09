import ServiceDetailViewPage from '@/views/(client-area)/private-area/services/[id]/ServiceDetailViewPage';

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

    return <ServiceDetailViewPage id={id} locale={locale} />;
}
