"use client";

import "@/styles/04-components/ui/navigations/tabs.scss";

import { useEffect, useRef, useState } from "react";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { useOutsideClick } from "@/hooks/useOutsideClick";

import { Link, resolveHref, usePathname } from "@/i18n/navigation";

import type { Tab, TabsProps } from "@/types/ui/navigations/tabs";

import { ChevronDownIcon, ChevronUpIcon, type LucideIcon } from "lucide-react";

/**
 * Icono de una pestaña, extraído para no repetir `aria-hidden` en cada punto
 * donde se renderiza (lista de escritorio, botón y desplegable móvil). El
 * tamaño lo fija `tabs.scss` (`.tabs svg`), no una prop, para que sea
 * consistente con el resto de iconos de `.tabs` (flechas del selector).
 */
function TabIcon({ icon: Icon }: { icon?: LucideIcon }) {
  if (!Icon) return null;
  return <Icon aria-hidden="true" />;
}

/**
 * Navegación por pestañas: en escritorio, una lista horizontal (`role="tablist"`);
 * por debajo de `lg` (ver el `resize` interno, no un breakpoint CSS, porque el
 * marcado de cada variante es distinto en vez de solo su estilo), un botón
 * desplegable con la pestaña activa y el resto de opciones como menú. Admite
 * dos modos: no controlado (cada pestaña es un `Link` a `href`, activa según
 * `pathname`, con sus segmentos dinámicos resueltos desde `useParams`) o
 * controlado (`activeKey`/`onTabChange`, pestañas como `button`).
 * @param {TabsProps} props - Propiedades del componente
 * @returns {JSX.Element} La navegación por pestañas renderizada
 */
export default function TabsComponent({
  tabs,
  className,
  style,
  disableScroll = false,
  activeKey,
  onTabChange,
  noTranslation = false,
  children,
}: TabsProps) {
  const params = useParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);

  const t = useTranslations("Tabs");

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 1024);
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useOutsideClick(selectRef, {
    onOutsideClick: () => setIsOpen(false),
    isActive: isOpen,
  });

  const getResolvedPath = (path: string): string => {
    let resolvedPath = path;
    Object.entries(params).forEach(([key, value]) => {
      resolvedPath = resolvedPath.replace(`[${key}]`, String(value));
    });
    return resolvedPath;
  };

  // A diferencia de `getResolvedPath` (usado solo para comparar contra
  // `pathname`, donde una cadena ya resuelta vale), el `Link` tipado de
  // next-intl necesita la forma `{ pathname, params }` para una ruta con
  // segmentos dinámicos: ver el JSDoc de `resolveHref` (`i18n/navigation.ts`).
  const getResolvedHref = (path: string) => resolveHref(path, params);

  const isControlled = Boolean(onTabChange && activeKey);

  const isTabActive = (href: string): boolean =>
    getResolvedPath(pathname) === getResolvedPath(href);

  const activeTab = tabs.find((tab) =>
    isControlled
      ? tab.key === activeKey
      : tab.href
        ? isTabActive(tab.href)
        : false,
  );

  const resolveLabel = (tab?: Tab): string => {
    if (!tab?.label) return t("selectTab");
    return noTranslation ? tab.label : t(tab.label);
  };

  const rootClassName = `tabs${className ? ` ${className}` : ""}`;

  if (isMobile) {
    return (
      <section className={rootClassName} style={style}>
        <div className="tabs__selector">
          <button
            type="button"
            className="tabs__selector__button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <p className="tabs__selector__button__content">
              <TabIcon icon={activeTab?.icon} />
              {resolveLabel(activeTab)}
            </p>
            {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>

          {isOpen && (
            <nav className="tabs__selector__dropdown" ref={selectRef}>
              {tabs
                .filter((tab) =>
                  isControlled
                    ? tab.key !== activeKey
                    : tab.href
                      ? !isTabActive(tab.href)
                      : false,
                )
                .map((tab) => {
                  if (isControlled) {
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        className="tabs__selector__dropdown__item"
                        onClick={() => {
                          // `tab.disabled` ya se refleja en el atributo `disabled` del
                          // botón (más abajo): un navegador real nunca despacha el
                          // evento `click` de un botón deshabilitado, así que la rama
                          // `tab.disabled === true` de esta guarda es inalcanzable
                          // desde una interacción real de usuario. Se mantiene como
                          // defensa en profundidad (por si se invocara `onClick`
                          // programáticamente pese al atributo).
                          /* v8 ignore next */
                          if (!tab.disabled && onTabChange) {
                            onTabChange(tab.key);
                          }
                          setIsOpen(false);
                        }}
                        disabled={tab.disabled}
                      >
                        <TabIcon icon={tab.icon} />
                        {resolveLabel(tab)}
                      </button>
                    );
                  }

                  return (
                    <Link
                      key={tab.key}
                      // El `.filter` anterior ya excluye, en modo no controlado, los
                      // tabs sin `href` (`tab.href ? ... : false`): al llegar aquí
                      // `tab.href` es siempre una cadena no vacía, así que el
                      // fallback `|| ""` es defensivo e inalcanzable en un test real.
                      /* v8 ignore next */
                      href={getResolvedHref(tab.href || "")}
                      className="tabs__selector__dropdown__item"
                      onClick={() => setIsOpen(false)}
                    >
                      <TabIcon icon={tab.icon} />
                      {resolveLabel(tab)}
                    </Link>
                  );
                })}
            </nav>
          )}
        </div>

        <div
          className={`tabs__content${disableScroll ? " tabs__content--no-scroll" : ""}`}
        >
          {children}
        </div>
      </section>
    );
  }

  return (
    <section className={rootClassName} style={style}>
      <nav className="tabs__list" role="tablist">
        {tabs.map((tab) => {
          const isActive = isControlled
            ? tab.key === activeKey
            : tab.href
              ? isTabActive(tab.href)
              : false;

          if (isControlled) {
            return (
              <button
                key={tab.key}
                type="button"
                className={`tabs__list__item${isActive ? " tabs__list__item--active" : ""}${
                  tab.disabled ? " tabs__list__item--disabled" : ""
                }`}
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  // Misma defensa en profundidad que en el desplegable mobile
                  // (más abajo): `disabled` ya impide que el navegador
                  // despache el evento `click`, así que `tab.disabled ===
                  // true` es inalcanzable desde una interacción real.
                  /* v8 ignore next */
                  if (!tab.disabled && onTabChange) {
                    onTabChange(tab.key);
                  }
                }}
                disabled={tab.disabled}
              >
                <TabIcon icon={tab.icon} />
                {resolveLabel(tab)}
              </button>
            );
          }

          return (
            <Link
              key={tab.key}
              href={getResolvedHref(tab.href || "")}
              className={`tabs__list__item${isActive ? " tabs__list__item--active" : ""}`}
              role="tab"
              aria-selected={isActive}
              aria-current={isActive ? "page" : undefined}
            >
              <TabIcon icon={tab.icon} />
              {resolveLabel(tab)}
            </Link>
          );
        })}
      </nav>

      <div
        className={`tabs__content${disableScroll ? " tabs__content--no-scroll" : ""}`}
      >
        {children}
      </div>
    </section>
  );
}
