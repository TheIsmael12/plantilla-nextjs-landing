import type { Metadata } from 'next';

import { getBlogPostBySlug } from '@/actions/blog/blog-actions';
import { generateBlogPostMetadata } from '@/lib/generateBlogPostMetadata';
import BlogPostViewPage from '@/views/(public)/blog/BlogPostViewPage';

interface BlogPostPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

/**
 * Metadatos de la página de detalle de un post, generados a partir del
 * contenido real (ver `generateBlogPostMetadata`) en vez del namespace
 * `Metadata.routes.*` centralizado que usa el resto del sitio: si el post no
 * existe, se devuelve un objeto vacío (Next usa el metadata del layout
 * padre) — el propio `page.tsx` es quien dispara el 404 real.
 * @param {BlogPostPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<Metadata>} Los metadatos del post, o un objeto vacío si no existe
 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const response = await getBlogPostBySlug(slug, locale);

    if (!response.data) return {};

    return generateBlogPostMetadata(response.data, locale);
}

/**
 * Página de detalle de un post del blog público.
 * @param {BlogPostPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de detalle del post renderizada
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { locale, slug } = await params;

    return <BlogPostViewPage locale={locale} slug={slug} />;
}
