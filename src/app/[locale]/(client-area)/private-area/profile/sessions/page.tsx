import { getMySessions } from '@/actions/client-portal/sessions-actions';

import ProfileSessionsViewPage from '@/views/(client-area)/private-area/profile/sessions/ProfileSessionsViewPage';

/**
 * Página de `/private-area/profile/sessions`: dispositivos con la sesión
 * abierta. Lanza `getMySessions` sin `await` para que la vista la resuelva
 * con `use()` dentro de un `Suspense`.
 * @returns {JSX.Element} La vista de sesiones renderizada
 */
export default function ProfileSessionsPage() {
    const sessionsPromise = getMySessions();
    return <ProfileSessionsViewPage sessionsPromise={sessionsPromise} />;
}
