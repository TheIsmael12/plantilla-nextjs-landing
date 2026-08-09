import { redirect } from '@/i18n/navigation';

import ResetPasswordForm from '@/components/ui/auth/ResetPasswordForm';

interface ResetPasswordViewPageProps {
  locale: string;
  token?: string;
}

/**
 * Página de restablecimiento de contraseña, accesible solo con el `token`
 * recibido en el enlace de recuperación de acceso. Sin token, no hay nada
 * que hacer aquí: se redirige a login.
 * @param {ResetPasswordViewPageProps} props - Locale actual y token de la query string
 * @returns {JSX.Element} La vista de restablecimiento renderizada
 */
export default function ResetPasswordViewPage({ locale, token }: ResetPasswordViewPageProps) {
  if (!token) {
    redirect({ href: '/login', locale });
    return null;
  }

  return <ResetPasswordForm token={token} />;
}
