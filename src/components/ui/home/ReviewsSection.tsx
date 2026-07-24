"use client";

import { Quote, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import '@/styles/04-components/home/homeBase.scss';
import '@/styles/04-components/home/reviewsSection.scss';

const reviews = [
  {
    key: 'marta',
  },
  {
    key: 'luis',
  },
  {
    key: 'anna',
  },
] as const;

/**
 * Carrusel de reseñas de clientes de la home: cabecera con título y
 * subtítulo, y tarjetas con puntuación, cita y autor, navegables con Swiper
 * (flechas, paginación y autoplay).
 * @returns {JSX.Element} La sección de reseñas renderizada
 */
export default function ReviewsSection() {
  const t = useTranslations('Home.reviews');

  return (
    <section className="home__reviews">
      <div className="home__container">
        <div className="home__reviews-header">
          <h2 className="home__title-lg">{t('title')}</h2>
          <p className="home__text-muted">{t('subtitle')}</p>
        </div>

        <div className="home__reviews-shell">
          <button className="home__reviews-nav home__reviews-nav--prev" aria-label={t('prev')} type="button">
            <span>‹</span>
          </button>

          <Swiper
            modules={[Navigation, Pagination, A11y, Autoplay]}
            spaceBetween={14}
            slidesPerView={1.1}
            navigation={{
              prevEl: '.home__reviews-nav--prev',
              nextEl: '.home__reviews-nav--next',
            }}
            pagination={{
              clickable: true,
              el: '.home__reviews-pagination',
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: { slidesPerView: 1.5 },
              1024: { slidesPerView: 2.2 },
              1280: { slidesPerView: 3 },
            }}
            className="home__reviews-swiper"
          >
            {reviews.map((review, index) => {
              const name = t(`items.${review.key}.name`);
              return (
                <SwiperSlide key={review.key}>
                  <article className="home__review-card" aria-label={t('slideLabel', { index: index + 1, name })}>
                    <Quote className="home__review-mark" aria-hidden="true" />

                    <div className="home__stars" role="img" aria-label={t('ratingLabel')}>
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star key={`${review.key}-star-${starIndex}`} size={16} fill="currentColor" />
                      ))}
                    </div>

                    <p className="home__review-quote">{t(`items.${review.key}.quote`)}</p>

                    <div className="home__review-author">
                      <span className="home__review-avatar">
                        {name.charAt(0)}
                      </span>
                      <div>
                        <p className="home__review-name">{name}</p>
                        <p className="home__review-role">{t(`items.${review.key}.role`)}</p>
                      </div>
                    </div>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>

          <button className="home__reviews-nav home__reviews-nav--next" aria-label={t('next')} type="button">
            <span>›</span>
          </button>
        </div>

        <div className="home__reviews-pagination" />
      </div>
    </section>
  );
}

