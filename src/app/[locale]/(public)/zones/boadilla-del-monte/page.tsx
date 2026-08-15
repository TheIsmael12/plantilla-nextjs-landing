import ZoneViewPage from '@/views/(public)/zones/ZoneViewPage';

interface ZonePageProps {
    params: Promise<{ locale: string }>;
}

/**
 * Página de zona: boadilla-del-monte.
 * @param {ZonePageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La página de zona renderizada
 */
export default async function ZonePage({ params }: ZonePageProps) {
    const { locale } = await params;

    return <ZoneViewPage slug="boadilla-del-monte" locale={locale} />;
}
