import type { Metadata } from 'next';

import { getPublicJob } from '@/actions/careers/careers-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { generateJobPostingMetadata } from '@/lib/generateJobPostingMetadata';
import JobDetailViewPage from '@/views/(public)/careers/JobDetailViewPage';

interface JobDetailPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

/**
 * Metadatos de la ficha, generados a partir de la oferta real (ver `generateJobPostingMetadata`). Quien
 * dispara el 404, la redirección al otro idioma o la página de «proceso cerrado» es la propia vista.
 *
 * Con una oferta ya cerrada (la API responde `410`) se devuelve `noindex, follow`, y esto sí importa: la
 * página explica que el proceso terminó y enlaza al buscador, así que responde `200` —el enrutador de Next
 * no permite emitir un `410` desde una página—, y sin el `noindex` esa URL se quedaría indexada como si
 * siguiera habiendo una oferta detrás. El `follow` mantiene el enlace al buscador, que es lo útil que queda.
 * @param {JobDetailPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<Metadata>} Los metadatos de la oferta, o lo justo para no indexarla
 */
export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const response = await getPublicJob(slug, locale);

    if (!response.data) {
        return response.status === HTTPStatus.GONE ? { robots: 'noindex, follow' } : {};
    }

    return generateJobPostingMetadata(response.data, locale);
}

/**
 * Ficha pública de una oferta de empleo.
 * @param {JobDetailPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La ficha renderizada
 */
export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const { locale, slug } = await params;

    return <JobDetailViewPage locale={locale} slug={slug} />;
}
