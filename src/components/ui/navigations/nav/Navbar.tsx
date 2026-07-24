"use client";

import "@/styles/04-components/ui/navigations/nav/navbar.scss";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import ImageLogo from "@/components/ui/images/ImageLogo";
import NotificationBell from "@/components/ui/navigations/nav/NotificationBell";
import Sidebar from "@/components/ui/navigations/sidebar/Sidebar";
import User from "@/components/ui/navigations/nav/User";

import { MenuIcon, XIcon } from "lucide-react";

/**
 * Barra de navegación superior: siempre fija (el hueco lo reserva
 * `padding-top` en `.main`, en CSS — sin JS de por medio), con sombra
 * añadida al hacer scroll y control de apertura del `Sidebar` en pantallas
 * pequeñas.
 * @returns {JSX.Element} La barra de navegación renderizada
 */
export default function Navbar() {
  const t = useTranslations("Navigation.Navbar");

  const [isScrolled, setIsScrolled] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) setOpenSidebar(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        className={`navbar${isScrolled ? " navbar--scrolled" : ""}`}
        aria-label={t("mainNavigation")}
      >
        <div className="navbar__header">
          <ImageLogo />
          <button
            type="button"
            className="navbar__header__button"
            aria-label={openSidebar ? t("closeMenu") : t("openMenu")}
            onClick={() => setOpenSidebar((prev) => !prev)}
          >
            {openSidebar ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        <div className="navbar__container">
          <NotificationBell />
          <User />
        </div>
      </nav>

      <Sidebar isOpen={openSidebar} onClose={() => setOpenSidebar(false)} />
    </>
  );
}
