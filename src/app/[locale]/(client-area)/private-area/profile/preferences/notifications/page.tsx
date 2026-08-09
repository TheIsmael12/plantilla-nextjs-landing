import { getMyPreferences } from '@/actions/client-portal/preferences-actions';

import ProfileNotificationsViewPage from '@/views/(client-area)/private-area/profile/preferences/notifications/ProfileNotificationsViewPage';

/**
 * Página de `/private-area/profile/preferences/notifications`. Lanza
 * `getMyPreferences` sin `await` para que la vista la resuelva con `use()`
 * dentro de un `Suspense`.
 * @returns {JSX.Element} La vista de preferencias de notificación renderizada
 */
export default function ProfileNotificationsPage() {
    const preferencesPromise = getMyPreferences();
    return <ProfileNotificationsViewPage preferencesPromise={preferencesPromise} />;
}
