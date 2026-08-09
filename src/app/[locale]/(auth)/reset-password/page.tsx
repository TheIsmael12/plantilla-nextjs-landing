import ResetPasswordViewPage from '@/views/(auth)/reset-password/ResetPasswordViewPage';

interface ResetPasswordPageProps {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ token?: string }>;
}

/**
 * Página de restablecimiento de contraseña del portal de cliente.
 * @param {ResetPasswordPageProps} props - Parámetros de ruta y query string de Next.js
 * @returns {Promise<JSX.Element>} La vista de restablecimiento renderizada
 */
export default async function ResetPasswordPage({ params, searchParams }: ResetPasswordPageProps) {
    const { locale } = await params;
    const { token } = await searchParams;

    return <ResetPasswordViewPage locale={locale} token={token} />;
}
