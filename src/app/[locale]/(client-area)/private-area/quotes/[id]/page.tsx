import QuotesDetailsViewPage from '@/views/(client-area)/private-area/quotes/details/QuotesDetailsViewPage';

interface QuoteDetailPageProps {
    params: Promise<{ locale: string; id: string }>;
}

/**
 * Página de `/private-area/quotes/[id]`: detalle de un presupuesto, con las
 * acciones de aceptar/rechazar cuando sigue pendiente de respuesta.
 * @param {QuoteDetailPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de detalle del presupuesto renderizada
 */
export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
    const { locale, id } = await params;

    return <QuotesDetailsViewPage id={id} locale={locale} />;
}
