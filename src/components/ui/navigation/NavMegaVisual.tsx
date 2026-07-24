'use client';

// El CSS de Swiper se importa desde `Navbar.tsx` (no aquí): Next no aplica
// de forma fiable el CSS de un módulo cargado vía `dynamic(..., { ssr: false })`
// (se queda "preloaded pero sin usar" y el carrusel se renderiza sin
// tamaño/estilos). El JS de este componente sí se sigue difiriendo.
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Autoplay, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import { SERVICE_SLUGS, SERVICE_VISUALS } from '@/config/routing';

/**
 * Carrusel de fotos del mega-menú de "Servicios": aislado en su propio
 * componente para poder cargarlo con `next/dynamic({ ssr: false })` desde
 * {@link NavDropdownItem} — el mega-menú solo se ve si el usuario abre ese
 * desplegable, así que ni Swiper ni sus imágenes deben ir en el JS que se
 * ejecuta en cada carga de página (el navbar es global).
 * @returns {JSX.Element} El carrusel de fotos del mega-menú renderizado
 */
export default function NavMegaVisual() {
  const servicesT = useTranslations('Services.items');

  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 3200, disableOnInteraction: false, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }}
      loop
      className="nav__mega-swiper"
    >
      {SERVICE_SLUGS.map((slug) => (
        <SwiperSlide key={slug}>
          <div className="nav__mega-visual-slide">
            <Image
              src={SERVICE_VISUALS[slug]}
              alt={servicesT(`${slug}.title`)}
              fill
              sizes="(max-width: 768px) 0px, 28vw"
              className="nav__mega-visual-image"
            />
            <div className="nav__mega-visual-overlay" />
            <p className="nav__mega-visual-caption">
              {servicesT(`${slug}.title`)}
            </p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
