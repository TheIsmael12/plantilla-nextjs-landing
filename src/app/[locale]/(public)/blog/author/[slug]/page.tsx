import BlogAuthorViewPage from '@/views/(public)/blog/BlogAuthorViewPage';

interface BlogAuthorPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

/**
 * Página pública de autor del blog.
 * @param {BlogAuthorPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de autor renderizada
 */
export default async function BlogAuthorPage({ params }: BlogAuthorPageProps) {
    const { locale, slug } = await params;

    return <BlogAuthorViewPage locale={locale} slug={slug} />;
}
