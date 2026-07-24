'use client';

import '@/styles/04-components/navigation/navbar.scss';

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Link, usePathname } from "@/i18n/navigation";

import { PUBLIC_ROUTES, SERVICE_SLUGS, SERVICE_ICONS, SERVICE_VISUALS } from "@/config/routing";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useFocusTrap } from "@/hooks/useFocusTrap";

import ImageLogo from '../images/ImageLogo';

import { Route } from "@/types/route";

import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";

type NavTranslator = ReturnType<typeof useTranslations>;

interface NavDropdownItemProps {
    route: Route;
    active: boolean;
    isOpen: boolean;
    pathname: string;
    onToggle: () => void;
    onClose: () => void;
    t: NavTranslator;
    routeT: NavTranslator;
    servicesT: NavTranslator;
}

/**
 * Ítem de navegación con desplegable (mega-menú de "Servicios" o lista simple
 * de sub-rutas): atrapa el foco de teclado dentro del panel mientras está
 * abierto (`Tab`/`Shift+Tab` no se escapan, `Escape` lo cierra y devuelve el
 * foco al disparador), vía {@link useFocusTrap} — mismo patrón que
 * `ModalComponent`/`Filters`. Extraído a su propio componente porque los
 * Hooks no pueden llamarse condicionalmente dentro del `.map()` de `Navbar`.
 * @param {NavDropdownItemProps} props Ruta, estado de apertura y traducciones necesarias
 * @returns {JSX.Element} El ítem de navegación con su desplegable renderizado
 */
function NavDropdownItem({
    route,
    active,
    isOpen,
    pathname,
    onToggle,
    onClose,
    t,
    routeT,
    servicesT,
}: NavDropdownItemProps) {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownId = useId();

    const visibleSubRoutes = route.subRoutes?.filter((s) => s.shownInNavbar) ?? [];

    const closeAndReturnFocus = () => {
        onClose();
        triggerRef.current?.focus();
    };

    useFocusTrap<HTMLDivElement>({
        isActive: isOpen,
        onEscape: closeAndReturnFocus,
        ref: dropdownRef,
    });

    return (
        <div className="nav__item">
            <button
                ref={triggerRef}
                className={`nav__link nav__link--trigger ${active ? 'nav__link--active' : ''}`}
                onClick={onToggle}
                aria-haspopup="true"
                aria-expanded={isOpen}
                aria-controls={isOpen ? dropdownId : undefined}
            >
                {routeT(route.pathname)}
                <ChevronDown className={`nav__chevron ${isOpen ? 'nav__chevron--open' : ''}`} aria-hidden="true" />
            </button>

            {isOpen && route.pathname === "/services" && (
                <div className="nav__dropdown nav__dropdown--mega" id={dropdownId} ref={dropdownRef}>
                    <div className="nav__mega">
                        <div className="nav__mega-body">
                            <ul className="nav__mega-list">
                                {SERVICE_SLUGS.map((slug) => {
                                    const Icon = SERVICE_ICONS[slug];
                                    return (
                                        <li key={slug}>
                                            <Link
                                                href={`/services/${slug}`}
                                                className="nav__mega-item"
                                            >
                                                <span className="nav__mega-icon">
                                                    <Icon size={18} />
                                                </span>
                                                <span className="nav__mega-text">
                                                    <span className="nav__mega-title">
                                                        {servicesT(`${slug}.title`)}
                                                    </span>
                                                    <span className="nav__mega-summary">
                                                        {servicesT(`${slug}.summary`)}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="nav__mega-visual">
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
                            </div>
                        </div>

                        <div className="nav__mega-footer">
                            <Link href="/services" className="nav__mega-all">
                                {t("services.allServices")}
                                <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {isOpen && route.pathname !== "/services" && (
                <div className="nav__dropdown" id={dropdownId} ref={dropdownRef}>
                    {visibleSubRoutes.map((sub) => (
                        <Link
                            key={sub.pathname}
                            href={sub.pathname}
                            className={`nav__dropdown-link ${pathname === sub.pathname ? 'nav__dropdown-link--active' : ''}`}
                        >
                            {routeT(sub.pathname)}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

/**
 * Barra de navegación principal del sitio público: logo, enlaces de
 * `PUBLIC_ROUTES` (con desplegables para rutas con `subRoutes`) resaltando la
 * ruta activa, y el acceso de clientes. Siempre fija (el hueco lo reserva
 * `padding-top` en `.public-layout`, en CSS — sin JS de por medio), sin
 * borde inferior hasta que se hace scroll, donde aparece junto a una
 * sombra — mismo patrón que la barra de navegación del área privada. En
 * mobile, los enlaces viven detrás de un botón hamburguesa que abre un
 * panel desplegable; cada desplegable de sub-rutas se despliega en línea
 * bajo su propio disparador (funciona igual dentro del panel mobile que en
 * la barra horizontal de escritorio). El desplegable de "Servicios" es un
 * mega-menú propio: lista los servicios reales de `Services.items` (mismos
 * slugs e iconos que `config/routing.ts`) con icono y resumen, un carrusel
 * de fotos de apoyo y un enlace a "Todos los servicios". Cierra cualquier
 * desplegable/panel abierto al navegar o al hacer clic fuera.
 * @returns {JSX.Element} La barra de navegación renderizada
 */
export default function Navbar() {

    const t = useTranslations("Navbar");
    const routeT = useTranslations("Routes");
    const servicesT = useTranslations("Services.items");

    const pathname = usePathname();
    const navRef = useRef<HTMLDivElement>(null);

    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const NAV_LINKS = PUBLIC_ROUTES.filter((r) => r.shownInNavbar);

    const isRouteActive = (route: Route) => {
        if (pathname === route.pathname) return true;
        return route.subRoutes?.some((sub) => pathname.startsWith(sub.pathname)) ?? false;
    };

    const toggleDropdown = (pathname: string) => {
        setOpenDropdown((prev) => (prev === pathname ? null : pathname));
    };

    const closeAll = () => {
        setOpenDropdown(null);
        setIsMobileMenuOpen(false);
    };

    useOutsideClick(navRef, { onOutsideClick: closeAll });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        closeAll();
    }, [pathname]);

    useEffect(() => {
        function handleScroll() {
            setIsScrolled(window.scrollY > 0);
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (

        <section className={`nav${isScrolled ? " nav--scrolled" : ""}`}>

            <div className="nav__container" ref={navRef}>

                <Link href="/" className="nav__logo" onClick={closeAll}>
                    <ImageLogo width={80} height={80} alt={t("logoAlt")} />
                </Link>

                <button
                    type="button"
                    className="nav__toggle"
                    aria-label={isMobileMenuOpen ? t("closeMenu") : t("openMenu")}
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                    {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
                </button>

                <div className={`nav__panel ${isMobileMenuOpen ? 'nav__panel--open' : ''}`}>

                    <nav className="nav__links" aria-label={t("ariaLabel")}>
                        {NAV_LINKS.map((route) => {

                            const visibleSubRoutes = route.subRoutes?.filter(s => s.shownInNavbar) ?? [];
                            const hasSubRoutes = visibleSubRoutes.length > 0;
                            const active = isRouteActive(route);
                            const isOpen = openDropdown === route.pathname;

                            if (hasSubRoutes) {
                                return (
                                    <NavDropdownItem
                                        key={route.pathname}
                                        route={route}
                                        active={active}
                                        isOpen={isOpen}
                                        pathname={pathname}
                                        onToggle={() => toggleDropdown(route.pathname)}
                                        onClose={() => setOpenDropdown(null)}
                                        t={t}
                                        routeT={routeT}
                                        servicesT={servicesT}
                                    />
                                );
                            }

                            return (
                                <Link
                                    key={route.pathname}
                                    href={route.pathname}
                                    className={`nav__link ${active ? 'nav__link--active' : ''}`}
                                >
                                    {routeT(route.pathname)}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="nav__actions">
                        <Link href="/login" className="nav__login">
                            {t("login")}
                        </Link>
                    </div>

                </div>

            </div>

        </section>

    )

}
