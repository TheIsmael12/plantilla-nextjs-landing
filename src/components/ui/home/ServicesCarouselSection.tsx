"use client";

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/servicesCarouselSection.scss';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

import { SERVICE_SLUGS, SERVICE_VISUALS } from '@/config/routing';

/**
 * Carrusel de servicios de la home: cabecera con título y subtítulo, y
 * tarjetas con imagen, etiqueta y resumen de cada servicio, navegables con
 * Swiper (flechas y paginación). Cada tarjeta enlaza a la ficha real del
 * servicio en su propia ruta (mismos slugs de `config/routing.ts`).
 * @returns {JSX.Element} La sección de servicios renderizada
 */
export default function ServicesCarouselSection() {
  const t = useTranslations('Home.services');
  const itemsT = useTranslations('Services.items');

  return (
    <section className="home__services">
      <div className="home__container">
        <div className="home__services-header">
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('subtitle')}</p>
        </div>

        <div className="home__carousel-shell">
          <button className="home__services-nav home__services-nav--prev" aria-label={t('prev')} type="button">
            <ArrowLeftIcon />
          </button>

          <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={14}
            slidesPerView={1.08}
            watchSlidesProgress
            navigation={{
              prevEl: '.home__services-nav--prev',
              nextEl: '.home__services-nav--next',
            }}
            pagination={{
              clickable: true,
              el: '.home__services-pagination',
            }}
            breakpoints={{
              640: { slidesPerView: 1.6 },
              768: { slidesPerView: 2.2 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: 4 },
            }}
            className="home__services-swiper"
          >
            {SERVICE_SLUGS.map((slug, index) => {
              const name = itemsT(`${slug}.title`);
              return (
                <SwiperSlide key={slug}>
                  <article className="home__service-card" aria-label={t('slideLabel', { index: index + 1, name })}>
                    <Image
                      src={SERVICE_VISUALS[slug]}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 92vw, (max-width: 1200px) 45vw, 30vw"
                      className="home__service-image"
                    />
                    <div className="home__service-overlay" />

                    <div className="home__service-content">
                      <p className="home__service-tag">{itemsT(`${slug}.tag`)}</p>
                      <h3>{name}</h3>
                      <p className="home__service-summary">{itemsT(`${slug}.summary`)}</p>
                      <Link
                        href={`/services/${slug}`}
                        className="home__service-link"
                        aria-label={t('serviceLinkAria', { name })}
                      >
                        {t('viewService')}
                      </Link>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button className="home__services-nav home__services-nav--next" aria-label={t('next')} type="button">
            <ArrowRightIcon />
          </button>
        </div>

        <div className="home__services-pagination" />
      </div>
    </section>
  );
}
