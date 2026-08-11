'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

import { Link, resolveHref, usePathname } from '@/i18n/navigation';
import ImageLogo from '@/components/ui/images/ImageLogo';
import ClientNotificationBell from '@/components/ui/client-area/ClientNotificationBell';
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

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutCurrentClientPortalSession();
    await signOut({ callbackUrl: '/' });
  };

  const isPathActive = (target: string) =>
    pathname === target || pathname.startsWith(`${target}/`);

  const isRouteActive = (route: Route) => isPathActive(route.pathname);

  return (
    <section className={`client-area-header${isScrolled ? ' client-area-header--scrolled' : ''}`}>
      <div className="client-area-header__container">
        <Link href="/private-area" className="client-area-header__logo">
          <ImageLogo alt={tNavbar('logoAlt')} />
        </Link>

        <nav className="client-area-header__links" aria-label={tNavbar('ariaLabel')}>
          {AREA_PRIVADA_ROUTES.filter((route) => route.shownInNavbar).map((route) => (
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
        </div>
      </div>
    </section>
  );
}
