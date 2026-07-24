"use client";

import "@/styles/04-components/ui/navigations/sidebar/menu-items.scss";

import { Fragment, useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";

import { Link, resolveHref, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

import { PRIVATE_ROUTES } from "@/config/routing";
import { findRouteByPathname } from "@/utils/routingUtils";

import type { MenuItemsProps } from "@/types/ui/navigations/menu-items";
import type { Route } from "@/types/route";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

/** Agrupa `routes` por `category`, preservando el orden de primera aparición de cada categoría. */
function groupByCategory(routes: Route[]): Record<string, Route[]> {
  return routes.reduce((acc, route) => {
    // Defensivo: toda ruta que llega aquí (rutas de primer nivel del sidebar,
    // o `subRoutes` de un `path` concreto) tiene `category` en el catálogo
    // actual (`config/routing.ts`) — la rama `false` no es alcanzable con los
    // datos de hoy, pero evita descartar en silencio una ruta futura a la que
    // se le olvide asignar `category`.
    /* v8 ignore next */
    if (route.category) {
      (acc[route.category] ??= []).push(route);
    }
    return acc;
  }, {} as Record<string, Route[]>);
}

/** `true` si `route` no exige ningún permiso (`requiredPermission`), o si `permissions` incluye el que exige. */
function isPermitted(route: Route, permissions: string[]): boolean {
  return !route.requiredPermission || permissions.includes(route.requiredPermission);
}

/** `subRoutes` de `route` que deben mostrarse en un menú: `isShownInSidebar: true` explícito (sin esto, una `subRoute` registrada solo para el catálogo de rutas, p. ej. `/users/[id]`, aparecería igualmente como ítem de navegación) y, si exige un permiso, que `permissions` lo incluya. */
function visibleSubRoutes(route: Route, permissions: string[]): Route[] {
  return (
    route.subRoutes?.filter(
      (subRoute) => subRoute.isShownInSidebar === true && isPermitted(subRoute, permissions),
    ) ?? []
  );
}

/** `true` si `route` tiene alguna `subRoute` visible en el menú (ver {@link visibleSubRoutes}); si no, se muestra como enlace directo en vez de grupo desplegable. */
function hasChildren(route: Route, permissions: string[]): boolean {
  return visibleSubRoutes(route, permissions).length > 0;
}

/** `true` si `pathname` es exactamente `route.pathname` o cuelga de él (`route.pathname` + `/...`). */
function matchesPathOrDescendant(pathname: string, route: Route): boolean {
  return pathname === route.pathname || pathname.startsWith(`${route.pathname}/`);
}

/**
 * Menú de navegación genérico sobre el catálogo de `PRIVATE_ROUTES`, agrupado
 * por `category` y con despliegue automático del grupo que contiene la ruta
 * activa. Sin `path`, monta el árbol completo del sidebar (rutas de primer
 * nivel con `isShownInSidebar: true`); con `path`, monta un enlace a esa
 * ruta más sus `subRoutes` — así un mismo componente sirve tanto para el
 * sidebar principal (`Sidebar`) como para submenús concretos (p. ej. el
 * desplegable de usuario o el layout de perfil, ambos con `path="/profile"`).
 * @param {MenuItemsProps} props - Propiedades del componente
 * @returns {JSX.Element} El menú renderizado
 */
export default function MenuItems({ path, onNavigate }: MenuItemsProps) {
  const t = useTranslations("Navigation.Routes");

  const { data: session } = useSession();
  const permissions = session?.user?.permissions ?? [];

  const pathname = usePathname();
  const params = useParams<Record<string, string | string[] | undefined>>();
  const previousPathname = useRef(pathname);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  // Cierra el drawer/desplegable contenedor automáticamente al navegar (móvil).
  // No cubierto por Storybook: el pathname mockeado por `@storybook/nextjs-vite`
  // (`parameters.nextjs.navigation.pathname`) es estático durante toda la
  // historia (lo fija un `PathnameContext.Provider` en el decorador), así que
  // no hay forma de observar, desde una interacción real, un cambio de
  // pathname en un componente ya montado sin mockear `usePathname` a mano —
  // y hacerlo (sustituyendo su implementación entre renders) le cambia la
  // forma de los hooks internos que ejecuta la implementación real, violando
  // las reglas de los Hooks de React.
  /* v8 ignore next 4 -- ver comentario anterior: pathname estático en Storybook */
  useEffect(() => {
    if (previousPathname.current !== pathname) {
      onNavigate?.();
      previousPathname.current = pathname;
    }
  }, [pathname, onNavigate]);

  const rootRoute = path ? findRouteByPathname(path) : undefined;
  const topLevelRoutes = path
    ? (rootRoute ? visibleSubRoutes(rootRoute, permissions) : [])
    : PRIVATE_ROUTES.filter(
        (route) => route.isShownInSidebar === true && isPermitted(route, permissions),
      );

  const groupedRoutes = groupByCategory(topLevelRoutes);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <>
      {rootRoute && (
        <div className="menu-items__list">
          <Link
            href={resolveHref(rootRoute.pathname, params)}
            className={`menu-items__item${pathname === rootRoute.pathname ? " menu-items__item--active" : ""}`}
            onClick={onNavigate}
          >
            {rootRoute.icon && <rootRoute.icon />}
            {t(rootRoute.pathname)}
          </Link>
        </div>
      )}

      {Object.entries(groupedRoutes).map(([category, routes]) => (
        <div key={category} className="menu-items__category">
          {category !== "general" && (
            <p className="menu-items__category__title">
              {t(`categories.${category}`)}
            </p>
          )}

          <div className="menu-items__list">
            {routes.map((route) => {
              if (!hasChildren(route, permissions)) {
                return (
                  <Link
                    key={route.pathname}
                    href={resolveHref(route.pathname, params)}
                    className={`menu-items__item${pathname === route.pathname ? " menu-items__item--active" : ""}`}
                    onClick={onNavigate}
                  >
                    {route.icon && <route.icon />}
                    {t(route.pathname)}
                  </Link>
                );
              }

              const isDescendantActive = matchesPathOrDescendant(pathname, route);
              const isOpen = isDescendantActive || openGroups.has(route.pathname);
              const activeModifier = isDescendantActive
                ? " menu-items__item--active"
                : isOpen
                  ? " menu-items__item--parent-active"
                  : "";

              return (
                <Fragment key={route.pathname}>
                  <button
                    type="button"
                    className={`menu-items__item${activeModifier}`}
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(route.pathname)}
                  >
                    {route.icon && <route.icon />}
                    {t(route.pathname)}
                    {isOpen ? (
                      <ChevronUpIcon className="menu-items__item__chevron" />
                    ) : (
                      <ChevronDownIcon className="menu-items__item__chevron" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="menu-items__submenu">
                      {visibleSubRoutes(route, permissions).map((sub) => (
                        <Link
                          key={sub.pathname}
                          href={resolveHref(sub.pathname, params)}
                          className={`menu-items__submenu__link${pathname === sub.pathname ? " menu-items__submenu__link--active" : ""}`}
                          onClick={onNavigate}
                        >
                          {sub.icon && <sub.icon />}
                          {t(sub.pathname)}
                        </Link>
                      ))}
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
