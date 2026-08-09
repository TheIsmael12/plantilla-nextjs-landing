import { redirect } from '@/i18n/navigation';

import ChangeRequiredPasswordForm from '@/components/ui/auth/ChangeRequiredPasswordForm';

interface ChangePasswordViewPageProps {
  locale: string;
  token?: string;
}

/**
 * Página de cambio de contraseña obligatorio, accesible solo con el
 * `changeToken` recibido tras un login que exige fijar una nueva
 * contraseña. Sin token, no hay nada que hacer aquí: se redirige a login.
 * @param {ChangePasswordViewPageProps} props - Locale actual y token de la query string
 * @returns {JSX.Element} La vista de cambio de contraseña renderizada
 */
export default function ChangePasswordViewPage({ locale, token }: ChangePasswordViewPageProps) {
  if (!token) {
    redirect({ href: '/login', locale });
    return null;
  }

  return <ChangeRequiredPasswordForm changeToken={token} />;
}
