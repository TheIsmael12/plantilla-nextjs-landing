import Skeleton from '@/components/ui/loaders/Skeleton';

import '@/styles/04-components/blog/blogBase.scss';

/**
 * Estado de carga del detalle de un post (Next.js `loading.tsx`), mientras
 * `BlogPostViewPage` resuelve el fetch del post y sus relacionados.
 * @returns {JSX.Element} El esqueleto de carga renderizado
 */
export default function BlogPostLoading() {
    return (
        <main className="blog">
            <div className="blog__container" style={{ maxWidth: '48rem', textAlign: 'center', paddingTop: '3rem' }}>
                <Skeleton width="30%" height="1rem" />
                <Skeleton width="80%" height="2.5rem" />
                <Skeleton width="50%" height="1rem" />
                <Skeleton variant="rectangular" height="22rem" />
            </div>
            <div className="blog__container blog__post-content">
                <Skeleton count={8} />
            </div>
        </main>
    );
}
