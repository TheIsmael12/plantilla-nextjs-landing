import ChangePasswordViewPage from '@/views/(auth)/change-password/ChangePasswordViewPage';

interface ChangePasswordPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ token?: string }>;
}

/**
 * Página de cambio de contraseña obligatorio tras login.
 * @param {ChangePasswordPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de cambio de contraseña renderizada
 */
export default async function ChangePasswordPage({ params, searchParams }: ChangePasswordPageProps) {
    const { locale } = await params;
    const { token } = await searchParams;

    return <ChangePasswordViewPage locale={locale} token={token} />;
}
