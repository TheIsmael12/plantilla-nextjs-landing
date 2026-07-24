'use client';

import '@/styles/04-components/navigation/goToTop.scss';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUp } from 'lucide-react';

const SHOW_AFTER_PX = 480;

/**
 * Botón flotante para volver al principio de la página: aparece a partir de
 * `SHOW_AFTER_PX` de scroll y hace un desplazamiento suave hasta el
 * principio (instantáneo si el usuario prefiere reducir el movimiento).
 * @returns {JSX.Element} El botón de volver arriba renderizado
 */
export default function GoToTop() {
  const t = useTranslations('Common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > SHOW_AFTER_PX);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={`go-to-top ${visible ? 'go-to-top--visible' : ''}`}
      onClick={scrollToTop}
      aria-label={t('goToTop')}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
