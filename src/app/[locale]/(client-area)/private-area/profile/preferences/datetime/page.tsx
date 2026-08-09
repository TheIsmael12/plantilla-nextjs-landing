import { getMyPreferences } from '@/actions/client-portal/preferences-actions';

import ProfileDateTimeViewPage from '@/views/(client-area)/private-area/profile/preferences/datetime/ProfileDateTimeViewPage';

/**
 * Página de `/private-area/profile/preferences/datetime`. Lanza
 * `getMyPreferences` sin `await` para que la vista la resuelva con `use()`
 * dentro de un `Suspense`.
 * @returns {JSX.Element} La vista de fecha y hora renderizada
 */
export default function ProfileDateTimePage() {
    const preferencesPromise = getMyPreferences();
    return <ProfileDateTimeViewPage preferencesPromise={preferencesPromise} />;
}
