import '@/styles/04-components/navigation/footer.scss';

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import Image from "next/image";

import { ENV } from "@/config/env";
import { PUBLIC_ROUTES, SERVICE_SLUGS } from '@/config/routing';

import ImageLogo from "@/components/ui/images/ImageLogo";
import FooterThemeToggle from "@/components/ui/navigation/FooterThemeToggle";
import FooterLocaleSwitcher from "@/components/ui/navigation/FooterLocaleSwitcher";

import { MailIcon, MapIcon, PhoneIcon } from "lucide-react";

const ALL_SOCIALS = [
    { Icon: "linkedin", name: "LinkedIn", href: ENV.SOCIAL_LINKEDIN },
    { Icon: "instagram", name: "Instagram", href: ENV.SOCIAL_INSTAGRAM },
    { Icon: "tiktok", name: "TikTok", href: ENV.SOCIAL_TIKTOK },
    { Icon: "x", name: "X", href: ENV.SOCIAL_TWITTER },
    { Icon: "youtube", name: "YouTube", href: ENV.SOCIAL_YOUTUBE },
    { Icon: "facebook", name: "Facebook", href: ENV.SOCIAL_FACEBOOK },
];

const BRAND = {
    name: ENV.COMPANY_NAME,
    // Solo los perfiles con URL configurada en el .env aparecen en el footer.
    socials: ALL_SOCIALS.filter((s): s is typeof s & { href: string } => Boolean(s.href)),
    contact: {
        email: ENV.COMPANY_EMAIL,
        phone: ENV.COMPANY_PHONE,
        location: `${ENV.COMPANY_ADDRESS}, ${ENV.COMPANY_CITY}, ${ENV.COMPANY_COUNTRY}`,
    }
}

/**
 * Pie de página público: datos de contacto, marca, controles de idioma/tema,
 * navegación por secciones y la barra legal inferior.
 * @returns {JSX.Element} El pie de página renderizado
 */
export default function Footer() {

    const t = useTranslations("Footer");
    const routesT = useTranslations("Routes");
    const servicesT = useTranslations("Services.items");

    const year = new Date().getFullYear();

    const footerRoutes = PUBLIC_ROUTES.filter((r) => r.shownInFooter);

    const mainRoutes = footerRoutes.filter((r) => r.category !== "legal");
    const legalRoutes = footerRoutes.filter((r) => r.category === "legal");

    return (

        <footer className="footer">

            <div className="footer__container">

                {/* Contact column */}

                <div className="footer__contact">
                    <ul className="footer__contact__info">
                        {/*
                          Sin enlace a /careers ("/empleo"): auditoría #5 (app completa,
                          requisitos-seo.md §17) encontró que esa página nunca se construyó
                          (404 real) — sitemap.ts ya la excluía a propósito por el mismo
                          motivo, pero este enlace no se había actualizado a la vez. Volver a
                          añadirlo cuando exista la página de verdad.
                        */}
                        <li>
                            <Link href="/blog" aria-label={routesT("/blog")} className="footer__contact__info-link">
                                {routesT("/blog")}
                            </Link>
                        </li>
                        <li>
                            <Link href="/contact" aria-label={routesT("/contact")} className="footer__contact__info-link">
                                {routesT("/contact")}
                            </Link>
                        </li>
                    </ul>
                    <ul className="footer__contact__list">
                        <li>
                            <a
                                href={`mailto:${BRAND.contact.email}`}
                                className="footer__contact__list-link">
                                <MailIcon aria-hidden="true" /> {BRAND.contact.email}
                            </a>
                        </li>
                        <li>
                            <a
                                href={`tel:${BRAND.contact.phone}`}
                                className="footer__contact__list-link">
                                <PhoneIcon aria-hidden="true" /> {BRAND.contact.phone}
                            </a>
                        </li>
                        <li>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BRAND.contact.location)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="footer__contact__list-link">
                                <MapIcon aria-hidden="true" /> {BRAND.contact.location}
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Brand & Controls column */}

                <div className="footer__brand-controls">
                    <div className="footer__brand">
                        <ImageLogo
                            style="dark"
                            className="footer__brand__logo"
                        />
                        <p className="footer__brand__tagline">{t("tagline")}</p>
                        {BRAND.socials.length > 0 && (
                            <ul className="footer__brand__socials">
                                {BRAND.socials.map((s) => (
                                    <li key={s.Icon}>
                                        <a
                                            href={s.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={s.name}
                                            className="footer__brand__socials-link"
                                        >
                                            <Image
                                                src={`/images/assets/social/${s.Icon}.svg`}
                                                alt=""
                                                width={18}
                                                height={18}
                                            />
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="footer__controls">
                        <FooterLocaleSwitcher />
                        <FooterThemeToggle />
                    </div>
                </div>

                {/* Nav columns */}

                <nav className="footer__nav" aria-label="Footer navigation">
                    {mainRoutes.map((route) => (
                        <div key={route.pathname} className="footer__nav__group">
                            <Link href={route.pathname} className="footer__nav__heading">
                                {routesT(route.pathname)}
                            </Link>
                            {route.pathname === "/services" ? (
                                <ul className="footer__nav__list">
                                    {SERVICE_SLUGS.map((slug) => (
                                        <li key={slug}>
                                            <Link
                                                href={`/services/${slug}`}
                                                className="footer__nav__list-link"
                                            >
                                                {servicesT(`${slug}.title`)}
                                            </Link>
                                        </li>
                                    ))}
                                    {/*
                                      Sin columna propia (routing.ts): "/for/property-managers"
                                      no tiene subrutas, así que quedaba como un título huérfano
                                      sin nada debajo. Va aquí, junto a los servicios, por ser el
                                      sitio natural para un segmento de cliente relacionado.
                                    */}
                                    <li>
                                        <Link
                                            href="/for/property-managers"
                                            className="footer__nav__list-link"
                                        >
                                            {routesT("/for/property-managers")}
                                        </Link>
                                    </li>
                                </ul>
                            ) : (
                                route.subRoutes && route.subRoutes.filter((s) => s.shownInFooter).length > 0 && (
                                    <ul className="footer__nav__list">
                                        {route.subRoutes
                                            .filter((s) => s.shownInFooter)
                                            .map((sub) => (
                                                <li key={sub.pathname}>
                                                    <Link href={sub.pathname} className="footer__nav__list-link">
                                                        {routesT(sub.pathname)}
                                                    </Link>
                                                </li>
                                            ))}
                                    </ul>
                                )
                            )}
                        </div>
                    ))}
                </nav>

                {/* Bottom bar */}

                <div className="footer__bottom">
                    <p className="footer__bottom__copy">
                        © {year} <span><a href={ENV.APP_URL} target="_blank" rel="noopener noreferrer">{ENV.APP_NAME}</a></span> by <span><a href="https://nextaura.es" target="_blank" rel="noopener noreferrer">NextAura</a></span>  {t("rightsReserved")}
                    </p>
                    <ul className="footer__bottom__legal">
                        {legalRoutes.map((r) => (
                            <li key={r.pathname}>
                                <Link href={r.pathname} className="footer__bottom__legal-link">
                                    {routesT(r.pathname)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

        </footer>

    )

}