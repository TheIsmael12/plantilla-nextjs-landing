"use client";

import "@/styles/04-components/ui/navigations/nav/notification-bell.scss";

import { BellIcon } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Botón de notificaciones de la barra de navegación.
 * @returns {JSX.Element} El botón de notificaciones renderizado
 */
export default function NotificationBell() {
  const t = useTranslations("Navigation.Navbar");

  return (
    <button
      type="button"
      className="navbar__notification-bell"
      aria-label={t("notifications")}
    >
      <BellIcon />
    </button>
  );
}
