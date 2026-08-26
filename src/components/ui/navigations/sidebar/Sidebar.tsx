"use client";

import "@/styles/04-components/ui/navigations/sidebar/sidebar.scss";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import MenuItems from "@/components/ui/navigations/sidebar/MenuItems";

import { useOutsideClick } from "@/hooks/useOutsideClick";

import type { SidebarProps } from "@/types/ui/navigations/sidebar/sidebar";

/**
 * Menú lateral (drawer) para navegación en móvil: se cierra al hacer click
 * fuera, al pulsar Escape o al navegar, y bloquea el scroll del body
 * mientras está abierto.
 * @param {SidebarProps} props - Propiedades del componente
 * @returns {JSX.Element} El menú lateral renderizado
 */
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const t = useTranslations("Navigation.Routes");
  const menuRef = useRef<HTMLElement>(null);

  useOutsideClick(menuRef, {
    onOutsideClick: () => onClose?.(),
    isActive: isOpen,
    lockScroll: true,
  });

  // El drawer se comporta como un overlay modal en mobile (bloquea scroll,
  // se cierra al hacer click fuera): Escape debe cerrarlo igual, para que
  // no quede una vía de cierre exclusiva de ratón.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && <div className="sidebar__overlay" />}
      <aside
        className={`sidebar${isOpen ? " sidebar--open" : ""}`}
        ref={menuRef}
      >
        <nav className="sidebar__container">
          <p>{t("categories.menu")}</p>
          <MenuItems onNavigate={onClose} />
        </nav>
        <div className="sidebar__footer">
          <a href="https://imora.es">
            <span>Imora</span>
          </a>
        </div>
      </aside>
    </>
  );
}
