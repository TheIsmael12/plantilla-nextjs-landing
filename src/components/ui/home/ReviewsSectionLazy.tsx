'use client';

import dynamic from 'next/dynamic';

// `next/dynamic` con `ssr: false` solo se permite desde un Client Component
// (de ahí este wrapper): sacamos Swiper del JS que se ejecuta durante la
// carga/hidratación inicial, ya que esta sección va debajo del fold.
const ReviewsSection = dynamic(() => import('./ReviewsSection'), {
  ssr: false,
});

/**
 * Envoltorio cliente que difiere la carga de {@link ReviewsSection} (y de
 * Swiper) hasta después de la hidratación inicial.
 * @returns {JSX.Element} La sección de reseñas renderizada
 */
export default function ReviewsSectionLazy() {
  return <ReviewsSection />;
}
