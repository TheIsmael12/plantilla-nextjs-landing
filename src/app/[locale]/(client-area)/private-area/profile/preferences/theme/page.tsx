import { getMyPreferences } from '@/actions/client-portal/preferences-actions';

import ProfileThemeViewPage from '@/views/(client-area)/private-area/profile/preferences/theme/ProfileThemeViewPage';

/**
 * Página de `/private-area/profile/preferences/theme`. Lanza `getMyPreferences`
 * sin `await` para que la vista la resuelva con `use()` dentro de un `Suspense`.
 * @returns {JSX.Element} La vista de tema renderizada
 */
export default function ProfileThemePage() {
    const preferencesPromise = getMyPreferences();
    return <ProfileThemeViewPage preferencesPromise={preferencesPromise} />;
}
