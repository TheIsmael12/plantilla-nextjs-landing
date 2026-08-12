import type { AppLocale } from "@/config/locales";

import PortalLocaleSection from "@/views/(client-area)/private-area/profile/preferences/locale/components/PortalLocaleSection";

interface ProfileLocaleViewPageProps {
    locale: AppLocale;
}

/**
 * Vista de `/private-area/profile/preferences/locale`: idioma del portal. No
 * lanza ninguna promesa: el idioma activo sale del propio segmento de ruta,
 * no de la API (mismo patrón que `plantilla-nextjs`).
 * @param {ProfileLocaleViewPageProps} props Idioma activo, resuelto del segmento de ruta
 * @returns {JSX.Element} La vista de idioma renderizada
 */
export default function ProfileLocaleViewPage({ locale }: ProfileLocaleViewPageProps) {
    return <PortalLocaleSection initialLocale={locale} />;
}
