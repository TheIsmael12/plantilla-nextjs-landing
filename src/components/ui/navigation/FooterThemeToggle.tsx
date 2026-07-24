"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { useIsMounted } from "@/hooks/useIsMounted";

const THEME_OPTIONS = [
  { value: "light", Icon: SunIcon, labelKey: "lightTheme" },
  { value: "system", Icon: MonitorIcon, labelKey: "systemTheme" },
  { value: "dark", Icon: MoonIcon, labelKey: "darkTheme" },
] as const;

/**
 * Selector de tema del footer: control segmentado de 3 opciones (claro/sistema/oscuro)
 * sobre `next-themes`, que ya se configura con `enableSystem` en `[locale]/layout.tsx`
 * pero hasta ahora no tenía ningún control en la interfaz. Antes de montar en
 * cliente no se conoce el tema elegido (depende de `localStorage`/sistema), así
 * que ningún botón se marca activo y el grupo queda deshabilitado, igual que
 * hace `ImageLogo` con su propio placeholder, para evitar parpadeos de hidratación.
 * @returns {JSX.Element} El selector de tema del footer
 */
export default function FooterThemeToggle() {
  const isMounted = useIsMounted();
  const { theme, setTheme } = useTheme();
  const t = useTranslations("Footer");

  const activeTheme = isMounted ? theme : undefined;

  return (
    <div
      className="footer__controls__theme"
      role="group"
      aria-label={t("changeTheme")}
    >
      {THEME_OPTIONS.map(({ value, Icon, labelKey }) => (
        <button
          key={value}
          type="button"
          className={`footer__controls__theme-option${
            activeTheme === value ? " footer__controls__theme-option--active" : ""
          }`}
          aria-label={t(labelKey)}
          aria-pressed={activeTheme === value}
          title={t(labelKey)}
          disabled={!isMounted}
          onClick={() => setTheme(value)}
        >
          <Icon aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
