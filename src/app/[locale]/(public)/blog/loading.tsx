import Skeleton from '@/components/ui/loaders/Skeleton';

import '@/styles/04-components/blog/blogBase.scss';
import '@/styles/04-components/blog/blogPostCard.scss';
import '@/styles/04-components/blog/blogFeaturedPostCard.scss';

/**
 * Estado de carga del listado del blog (Next.js `loading.tsx`, mostrado
 * mientras `BlogViewPage` resuelve el fetch del Server Component): imita la
 * card destacada ({@link BlogFeaturedPostCard}) y la cuadrícula de
 * {@link BlogPostCard} con bloques de {@link Skeleton}.
 * @returns {JSX.Element} El esqueleto de carga renderizado
 */
export default function BlogLoading() {
    return (
        <main className="blog">
            <section className="blog__list-section">
                <div className="blog__container">
                    <div className="blog__featured">
                        <Skeleton variant="rectangular" height="22rem" className="blog__featured-media" />
                    </div>

                    <div className="blog__grid">
                        {Array.from({ length: 6 }, (_, index) => (
                            <div className="blog__card" key={index}>
                                <Skeleton variant="rectangular" height="14rem" />
                                <div style={{ padding: '1.75rem' }}>
                                    <Skeleton width="60%" />
                                    <Skeleton count={3} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
