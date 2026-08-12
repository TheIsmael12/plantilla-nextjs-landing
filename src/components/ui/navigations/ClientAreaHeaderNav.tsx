'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { MenuIcon, XIcon } from 'lucide-react';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import { Link, resolveHref, usePathname } from '@/i18n/navigation';
import ImageLogo from '@/components/ui/images/ImageLogo';
import ClientNotificationBell from '@/components/ui/navigations/ClientNotificationBell';
import User from '@/components/ui/navigations/User';

import { AREA_PRIVADA_ROUTES } from '@/config/routing';
import { logoutCurrentClientPortalSession } from '@/actions/auth/client-portal-auth-actions';

import type { Route } from '@/types/route';

import '@/styles/04-components/client-area/clientAreaHeader.scss';

interface ClientAreaHeaderNavProps {
  communityHref: string | null;
  initialUnreadCount: number;
}

/**
 * Parte interactiva de la cabecera del área de cliente: sombra al hacer
 * scroll, menú de usuario y cierre de sesión. La separación en dos componentes
 * existe porque el enlace de comunidades depende de una llamada a la API
 * (`getClientCommunities`) que solo puede hacerse en servidor: el wrapper
 * (`ClientAreaHeader`) la resuelve y aquí solo llega el `href` ya calculado,
 * o `null` si el cliente no tiene ninguna comunidad activa.
 * @param {ClientAreaHeaderNavProps} props - Destino del enlace de comunidades (o `null` para no pintarlo) y contador inicial de notificaciones sin leer
 * @returns {JSX.Element} La cabecera del área de cliente renderizada
 */
export default function ClientAreaHeaderNav({
  communityHref,
  initialUnreadCount,
}: ClientAreaHeaderNavProps) {
  const tNavbar = useTranslations('Navbar');
  const routeT = useTranslations('Routes');
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  /*
   * El desplegable se comporta como un overlay: se cierra al pulsar fuera y bloquea el scroll de detrás.
   *
   * Lo segundo importa en un móvil: sin ello, el dedo que quiere desplazar el menú arrastra la página que
   * hay debajo y el menú se queda quieto sobre un contenido que se mueve.
   */
  useOutsideClick(menuRef, {
    onOutsideClick: () => setIsMenuOpen(false),
    isActive: isMenuOpen,
    lockScroll: true,
  });

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /*
   * Al ensanchar la ventana el menú se cierra.
   *
   * A partir de `md` los enlaces vuelven a estar en la barra, así que un desplegable abierto quedaría
   * flotando encima de los mismos enlaces que ya se ven. Mismo criterio que el drawer de la intranet.
   */
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setIsMenuOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Escape cierra, para que no haya una única vía de cierre y sea de ratón.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logoutCurrentClientPortalSession();
    await signOut({ callbackUrl: '/' });
  };

  const isPathActive = (target: string) =>
    pathname === target || pathname.startsWith(`${target}/`);

  const isRouteActive = (route: Route) => isPathActive(route.pathname);

  /** Las entradas del menú, una sola vez: las pinta la barra en escritorio y el desplegable en móvil. */
  const navRoutes = AREA_PRIVADA_ROUTES.filter((route) => route.shownInNavbar);

  return (
    <section className={`client-area-header${isScrolled ? ' client-area-header--scrolled' : ''}`}>
      <div className="client-area-header__container">
        <Link href="/private-area" className="client-area-header__logo">
          <ImageLogo alt={tNavbar('logoAlt')} />
        </Link>

        <nav className="client-area-header__links" aria-label={tNavbar('ariaLabel')}>
          {navRoutes.map((route) => (
            <Link
              key={route.pathname}
              href={route.pathname}
              className={`client-area-header__link${isRouteActive(route) ? ' client-area-header__link--active' : ''}`}
            >
              {routeT(route.pathname)}
            </Link>
          ))}

          {communityHref && (
            <Link
              href={resolveHref(communityHref)}
              className={`client-area-header__link${isPathActive('/private-area/communities') ? ' client-area-header__link--active' : ''}`}
            >
              {routeT('/private-area/communities')}
            </Link>
          )}
        </nav>

        <div className="client-area-header__actions">
          <ClientNotificationBell initialUnreadCount={initialUnreadCount} />
          <User onLogout={handleLogout} />

          {/*
            La hamburguesa, solo en móvil.
            Va **después** de la campana y del usuario a propósito: en un móvil el pulgar llega mejor al
            borde derecho, y abrir el menú es lo que más se hace de las tres.
          */}
          <button
            type="button"
            className="client-area-header__burger"
            aria-label={isMenuOpen ? tNavbar('closeMenu') : tNavbar('openMenu')}
            aria-expanded={isMenuOpen}
            aria-controls="client-area-menu"
            onClick={() => setIsMenuOpen((previous) => !previous)}
          >
            {isMenuOpen ? <XIcon aria-hidden="true" /> : <MenuIcon aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/*
        El desplegable de móvil.
        Cuelga de la cabecera y no de un portal porque tiene que quedarse justo debajo de ella y moverse
        con ella; el overlay va aparte para que el fondo se oscurezca sin oscurecer también la barra.
      */}
      {isMenuOpen && <div className="client-area-header__overlay" />}

      <div
        id="client-area-menu"
        ref={menuRef}
        className={`client-area-header__menu${isMenuOpen ? ' client-area-header__menu--open' : ''}`}
        // Escondido de verdad cuando está cerrado: si no, el tabulador sigue pasando por sus enlaces.
        hidden={!isMenuOpen}
      >
        <nav className="client-area-header__menu-links" aria-label={tNavbar('ariaLabel')}>
          {navRoutes.map((route) => (
            <Link
              key={route.pathname}
              href={route.pathname}
              className={`client-area-header__menu-link${isRouteActive(route) ? ' client-area-header__menu-link--active' : ''}`}
              // Al navegar se cierra: si no, el menú tapa la página a la que se acaba de llegar.
              onClick={() => setIsMenuOpen(false)}
            >
              {routeT(route.pathname)}
            </Link>
          ))}

          {communityHref && (
            <Link
              href={resolveHref(communityHref)}
              className={`client-area-header__menu-link${isPathActive('/private-area/communities') ? ' client-area-header__menu-link--active' : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {routeT('/private-area/communities')}
            </Link>
          )}
        </nav>
      </div>
    </section>
  );
}
