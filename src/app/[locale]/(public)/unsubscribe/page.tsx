import UnsubscribeViewPage from '@/views/(public)/unsubscribe/UnsubscribeViewPage';

interface UnsubscribePageProps {
    searchParams: Promise<{ token?: string }>;
}

/**
 * Página pública de baja de comunicaciones comerciales, accesible solo
 * desde el enlace de un email (nunca enlazada en la navegación del sitio).
 * @param {UnsubscribePageProps} props - Query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de baja renderizada
 */
export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
    const { token } = await searchParams;

    return <UnsubscribeViewPage token={token} />;
}
