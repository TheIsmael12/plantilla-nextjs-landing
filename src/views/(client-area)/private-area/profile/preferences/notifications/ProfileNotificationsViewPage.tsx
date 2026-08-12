"use client";

import { Suspense, use } from "react";

import type { getMyPreferences } from "@/actions/client-portal/preferences-actions";

import ProfileSectionsSkeleton from "@/components/skeletons/profile/ProfileSectionsSkeleton";

import PortalNotificationsSection from "@/views/(client-area)/private-area/profile/preferences/notifications/components/PortalNotificationsSection";

interface ProfileNotificationsViewPageProps {
    preferencesPromise: ReturnType<typeof getMyPreferences>;
}

/**
 * Vista de `/private-area/profile/preferences/notifications`. Envuelve el
 * contenido en `Suspense` para que `use()` pueda streamear la preferencia sin
 * bloquear la navegación con un `await` en el Server Component.
 * @param {ProfileNotificationsViewPageProps} props Promesa de las preferencias, sin resolver todavía
 * @returns {JSX.Element} La vista de preferencias de notificación renderizada
 */
export default function ProfileNotificationsViewPage(props: ProfileNotificationsViewPageProps) {
    return (
        <Suspense fallback={<ProfileSectionsSkeleton sections={1} />}>
            <ProfileNotificationsViewContent {...props} />
        </Suspense>
    );
}

function ProfileNotificationsViewContent({ preferencesPromise }: ProfileNotificationsViewPageProps) {
    const response = use(preferencesPromise);

    return (
        <PortalNotificationsSection
            initialInAppNotifications={response.data?.inAppNotifications ?? true}
        />
    );
}
