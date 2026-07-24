'use client';

import dynamic from 'next/dynamic';

// `next/dynamic` con `ssr: false` solo se permite desde un Client Component
// (de ahí este wrapper): sacamos Swiper del JS que se ejecuta durante la
// carga/hidratación inicial, ya que esta sección va debajo del fold.
const ServicesCarouselSection = dynamic(() => import('./ServicesCarouselSection'), {
  ssr: false,
});

/**
 * Envoltorio cliente que difiere la carga de {@link ServicesCarouselSection}
 * (y de Swiper) hasta después de la hidratación inicial.
 * @returns {JSX.Element} La sección de servicios renderizada
 */
export default function ServicesCarouselSectionLazy() {
  return <ServicesCarouselSection />;
}
