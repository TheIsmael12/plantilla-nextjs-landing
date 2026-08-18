import ResidentResetPasswordForm from '@/components/ui/auth/ResidentResetPasswordForm';

interface ResidentResetPasswordViewPageProps {
  token: string;
}

/**
 * Página de restablecimiento de contraseña de un vecino, accesible con el `token` que llega en la ruta del
 * enlace de recuperación. El token va en la propia ruta y no en la query string —a diferencia del portal de
 * cliente— porque así lo construye `ResidentAuthService.forgotPassword` en el backend.
 * @param {ResidentResetPasswordViewPageProps} props - El token del enlace
 * @returns {JSX.Element} La vista de restablecimiento renderizada
 */
export default function ResidentResetPasswordViewPage({ token }: ResidentResetPasswordViewPageProps) {
  return <ResidentResetPasswordForm token={token} />;
}
