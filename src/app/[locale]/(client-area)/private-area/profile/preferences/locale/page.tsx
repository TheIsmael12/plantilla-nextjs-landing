import type { AppLocale } from '@/config/locales';

import ProfileLocaleViewPage from '@/views/(client-area)/private-area/profile/preferences/locale/ProfileLocaleViewPage';

interface ProfileLocalePageProps {
    params: Promise<{ locale: AppLocale }>;
}

/**
 * Página de `/private-area/profile/preferences/locale`. No lanza ninguna
 * promesa: el idioma activo sale del propio segmento de ruta.
 * @param {ProfileLocalePageProps} props Parámetros de ruta, incluido el locale activo
 * @returns {Promise<JSX.Element>} La vista de idioma renderizada
 */
export default async function ProfileLocalePage({ params }: ProfileLocalePageProps) {
    const { locale } = await params;
    return <ProfileLocaleViewPage locale={locale} />;
}
