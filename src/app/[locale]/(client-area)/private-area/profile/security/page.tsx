import { getClientTwoFactorStatus } from '@/actions/client-portal/profile-actions';

import ProfileSecurityViewPage from '@/views/(client-area)/private-area/profile/security/ProfileSecurityViewPage';

/**
 * Página de `/private-area/profile/security`: cambio de contraseña y
 * verificación en dos pasos. Lanza `getClientTwoFactorStatus` sin `await`
 * para que la vista la resuelva con `use()` dentro de un `Suspense`.
 * @returns {JSX.Element} La vista de seguridad renderizada
 */
export default function ProfileSecurityPage() {
    const twoFactorStatusPromise = getClientTwoFactorStatus();
    return <ProfileSecurityViewPage twoFactorStatusPromise={twoFactorStatusPromise} />;
}
