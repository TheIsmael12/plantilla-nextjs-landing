import "@/styles/04-components/ui/cards/session-card.scss";

import { useTranslations } from "next-intl";

import type { SessionCardProps } from "@/types/ui/cards/session-card";

import useFormatDate from "@/hooks/useFormatDate";

import Button from "@/components/ui/buttons/Button";

import {
  LogOutIcon,
  MonitorIcon,
  SmartphoneIcon,
  TabletIcon,
  type LucideIcon,
} from "lucide-react";

const DEVICE_ICONS: Record<"mobile" | "tablet" | "desktop", LucideIcon> = {
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
  desktop: MonitorIcon,
};

/**
 * Clasifica `session.device` (ya resuelto por el backend, p. ej.
 * "Desktop"/"Mobile"/"Tablet") en una de las categorías de {@link DEVICE_ICONS}:
 * busca una coincidencia insensible a mayúsculas y usa "desktop" si no
 * reconoce ninguna.
 * @param {string} device - Categoría de dispositivo devuelta por la API
 * @returns {("mobile"|"tablet"|"desktop")} La categoría de icono a usar
 */
function resolveDeviceCategory(
  device?: string,
): "mobile" | "tablet" | "desktop" {
  if (!device) return "desktop";
  const normalized = device.toLowerCase();
  if (normalized.includes("mobile") || normalized.includes("phone")) {
    return "mobile";
  }
  if (normalized.includes("tablet")) {
    return "tablet";
  }
  return "desktop";
}

/**
 * Tarjeta que muestra una sesión activa del usuario (dispositivo, navegador y
 * sistema ya resueltos por el backend) con acción para revocarla salvo que
 * sea la sesión actual.
 * @param {SessionCardProps} props - Propiedades del componente
 * @returns {JSX.Element} La tarjeta de sesión renderizada
 */
export default function SessionCard({
  session,
  onRevoke,
  isRevoking,
}: SessionCardProps) {
  const t = useTranslations("Views.Profile.Sessions");
  const { formatDateTime } = useFormatDate();

  const DeviceIcon = DEVICE_ICONS[resolveDeviceCategory(session.device)];

  return (
    <div className="session-card">
      <div className="session-card__icon">
        <DeviceIcon />
      </div>

      <div className="session-card__info">
        <p className="session-card__device">
          {session.browser || t("unknownBrowser")} ·{" "}
          {session.os || t("unknownOs")}
          {session.isCurrent && (
            <span className="session-card__badge">{t("current")}</span>
          )}
        </p>

        <p className="session-card__meta">
          {session.ip} · {t("lastUsed")}{" "}
          {formatDateTime(session.lastActivityAt)}
        </p>

        <p className="session-card__meta">
          {t("expires")} {formatDateTime(session.expiresAt)}
        </p>
      </div>

      {!session.isCurrent && onRevoke && (
        <Button
          className="session-card__close"
          ariaLabel={isRevoking ? "revoking" : "revoke"}
          onClick={onRevoke}
          disabled={isRevoking}
        >
          <LogOutIcon />
        </Button>
      )}
    </div>
  );
}
