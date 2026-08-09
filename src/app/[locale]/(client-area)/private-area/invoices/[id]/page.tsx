import InvoiceDetailViewPage from '@/views/(client-area)/private-area/invoices/[id]/InvoiceDetailViewPage';

interface InvoiceDetailPageProps {
    params: Promise<{ locale: string; id: string }>;
}

/**
 * Página de `/private-area/invoices/[id]`: detalle de una factura, con sus
 * líneas, totales, cobros y abonos.
 * @param {InvoiceDetailPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de detalle de la factura renderizada
 */
export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
    const { locale, id } = await params;

    return <InvoiceDetailViewPage id={id} locale={locale} />;
}
