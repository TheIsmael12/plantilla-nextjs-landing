import ResidentResetPasswordViewPage from '@/views/(resident)/reset-password/ResidentResetPasswordViewPage';

interface ResidentResetPasswordPageProps {
    params: Promise<{ locale: string; token: string }>;
}

/**
 * Página de restablecimiento de contraseña de un vecino, a la que llega el enlace del correo de recuperación
 * enviado desde la app móvil (`plantilla-nestjs`, `ResidentAuthService.forgotPassword`).
 * @param {ResidentResetPasswordPageProps} props - Parámetros de ruta de Next.js
 * @returns {Promise<JSX.Element>} La vista de restablecimiento renderizada
 */
export default async function ResidentResetPasswordPage({ params }: ResidentResetPasswordPageProps) {
    const { token } = await params;

    return <ResidentResetPasswordViewPage token={token} />;
}
