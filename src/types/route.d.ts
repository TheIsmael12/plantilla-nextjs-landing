import { LucideIcon } from "lucide-react";

/** Catálogo de pathnames tipados por locale, tal y como lo define `config/pathnames.ts`. */
export type Pathnames = typeof pathnames;
/** Locale soportado por la app, tal y como los define `config/locales.ts`. */
export type Locales = (typeof locales)[number];

/**
 * Route represents a single navigable entry in the application's routing tree.
 * Routes can be nested via `subRoutes` to model multi-level navigation.
 *
 * @interface Route
 * @property {Pathname}    pathname         - The URL pathname for this route (typed from the routing config).
 * @property {Route[]}     [subRoutes]      - Optional child routes nested under this route.
 * @property {string[]}    [roles]          - Optional list of role identifiers allowed to access this route.
 * @property {string}      [category]       - Optional grouping label used to cluster routes in navigation UIs.
 * @property {boolean}     [shownInNavbar]  - Whether this route should appear in the top navigation bar.
 * @property {boolean}     [shownInFooter]  - Whether this route should appear in the footer navigation.
 * @property {boolean}     [shownInSidebar] - Whether this route should appear in a sidebar navigation.
 * @property {LucideIcon}  [icon]           - Optional Lucide icon component displayed next to the route label.
 */

/** Pathname canónico y sin localizar (clave de `config/pathnames.ts`), previo a su traducción por locale. */
export type StaticPathname = string;

interface Route {
  pathname: Pathname;
  subRoutes?: Route[];
  roles?: string[];
  category?: string;
  shownInNavbar?: boolean;
  shownInFooter?: boolean;
  shownInSidebar?: boolean;
  icon?: LucideIcon;
  requiredPermission?: string;
  isShownInSidebar?: boolean;
  hasPage?: boolean;
}
