'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeftIcon } from 'lucide-react';

import { Link, usePathname } from '@/i18n/navigation';
import { COMMUNITY_SECTION_ROUTES } from '@/config/routing';

import type { AnyHref } from '@/i18n/navigation';

import '@/styles/04-components/client-area/community-layout.scss';

interface CommunitySidebarProps {
  serviceId: string;
  communityName: string;
  showCommunitiesLink: boolean;
  keyringEnabled: boolean;
}

/**
 * Navegación de las secciones internas de una comunidad. No reutiliza
 * `MenuItems` a propósito: aquel resuelve sus enlaces contra el catálogo
 * estático de `routing.ts`, que fue diseñado para rutas sin parámetros, y
 * estas rutas llevan un `[serviceId]` que solo se conoce en tiempo de
 * ejecución. Aquí los `href` se construyen sustituyendo ese segmento sobre las
 * claves canónicas de {@link COMMUNITY_SECTION_ROUTES}, que siguen siendo la
 * única fuente de verdad del orden y los iconos.
 *
 * Las secciones con `requiredFlag` se ocultan si el módulo correspondiente no
 * está activo: el backend las rechaza con 403 (`assertKeyringEnabled`), así
 * que ofrecerlas de todos modos solo llevaría a un enlace roto.
 * @param {CommunitySidebarProps} props - Comunidad activa, si procede ofrecer la vuelta al selector, y qué módulos opcionales tiene activos
 * @returns {JSX.Element} El menú lateral de la comunidad renderizado
 */
export default function CommunitySidebar({
  serviceId,
  communityName,
  showCommunitiesLink,
  keyringEnabled,
}: CommunitySidebarProps) {
  const t = useTranslations('Navigation.Routes');
  const tCommunities = useTranslations('Views.ClientArea.Communities');
  const pathname = usePathname();

  const buildHref = (canonical: string) => canonical.replace('[serviceId]', serviceId);

  const visibleRoutes = COMMUNITY_SECTION_ROUTES.filter(
    (route) => route.requiredFlag !== 'keyringEnabled' || keyringEnabled,
  );

  return (
    <nav className="community-layout__nav" aria-label={tCommunities('Nav.ariaLabel')}>
      {showCommunitiesLink && (
        <Link href="/private-area/communities" className="community-layout__nav-back">
          <ChevronLeftIcon aria-hidden="true" />
          {tCommunities('Nav.backToCommunities')}
        </Link>
      )}

      <p className="community-layout__nav-title">{communityName}</p>

      {visibleRoutes.map(({ pathname: canonical, icon: Icon }) => {
        const href = buildHref(canonical);

        return (
          <Link
            key={canonical}
            href={href as AnyHref}
            className={`community-layout__nav-link${pathname === href ? ' community-layout__nav-link--active' : ''}`}
          >
            <Icon aria-hidden="true" />
            {t(canonical)}
          </Link>
        );
      })}
    </nav>
  );
}
