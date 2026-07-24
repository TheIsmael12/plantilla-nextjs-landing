"use client";

import { useLocale, useTranslations } from "next-intl";

import { useRouter, usePathname, type AnyHref } from "@/i18n/navigation";

import ChangeLocale from "@/components/ui/inputs/ChangeLocale";
import { LANGUAGES } from "@/config/settings";
import type { AppLocale } from "@/config/locales";

// Etiquetas cortas (código en mayúsculas) en vez del nombre completo del
// idioma de `LANGUAGES`: el trigger del footer es compacto (a la altura del
// botón de tema), sin espacio para "Español"/"English".
const FOOTER_LANGUAGES = LANGUAGES.map((lang) => ({
  ...lang,
  label: lang.value.toUpperCase(),
}));

/**
 * Selector de idioma del footer: envuelve {@link ChangeLocale} conectado al
 * enrutado real de `next-intl` — `usePathname()` da la ruta canónica de la
 * página actual (independiente del idioma), así que cambiar de idioma navega
 * a esa misma página ya traducida en vez de mandar siempre a la home.
 * @returns {JSX.Element} El selector de idioma del footer
 */
export default function FooterLocaleSwitcher() {
  const t = useTranslations("Footer");
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (nextLocale: AppLocale) => {
    // `pathname` viene tipado por `usePathname()` como la unión completa de
    // claves de `config/pathnames.ts`, incluidas las que requieren params
    // (p. ej. `/blog/[id]`) — `router.replace` exige params para esas, pero
    // en la práctica `usePathname()` nunca devuelve una plantilla sin
    // resolver. Mismo escape hatch que `resolveHref`/`generateMetadata.ts`.
    router.replace(pathname as AnyHref, { locale: nextLocale });
  };

  return (
    <ChangeLocale
      id="footer-locale"
      label={t("changeLanguage")}
      value={locale}
      options={FOOTER_LANGUAGES}
      onChange={handleChange}
      hideSelectedFromList
      className="footer__controls__locale"
    />
  );
}
