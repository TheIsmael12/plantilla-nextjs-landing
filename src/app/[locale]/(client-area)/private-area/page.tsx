import PrivateAreaHomeViewPage from '@/views/(client-area)/private-area/PrivateAreaHomeViewPage';

interface PrivateAreaHomePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de `/private-area`: el panel del área de cliente, con lo que tiene pendiente —facturas por pagar,
 * presupuestos por responder, incidencias en curso—, su facturación del año y los accesos a sus servicios y
 * comunidades.
 * @param {PrivateAreaHomePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} El panel del área privada renderizado
 */
export default async function PrivateAreaHomePage({ params }: PrivateAreaHomePageProps) {
    const { locale } = await params;

    return <PrivateAreaHomeViewPage locale={locale} />;
}
