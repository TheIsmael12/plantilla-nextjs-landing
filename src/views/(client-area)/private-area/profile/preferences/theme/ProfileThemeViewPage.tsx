"use client";

import { Suspense, use } from "react";

import type { getMyPreferences } from "@/actions/client-portal/preferences-actions";

import ProfileSectionsSkeleton from "@/components/skeletons/profile/ProfileSectionsSkeleton";

import PortalThemeSection from "@/views/(client-area)/private-area/profile/preferences/theme/components/PortalThemeSection";

interface ProfileThemeViewPageProps {
    preferencesPromise: ReturnType<typeof getMyPreferences>;
}

/**
 * Vista de `/private-area/profile/preferences/theme`. Envuelve el contenido
 * en `Suspense` para que `use()` pueda streamear la preferencia sin bloquear
 * la navegación con un `await` en el Server Component.
 * @param {ProfileThemeViewPageProps} props Promesa de las preferencias, sin resolver todavía
 * @returns {JSX.Element} La vista de tema renderizada
 */
export default function ProfileThemeViewPage(props: ProfileThemeViewPageProps) {
    return (
        <Suspense fallback={<ProfileSectionsSkeleton sections={1} />}>
            <ProfileThemeViewContent {...props} />
        </Suspense>
    );
}

function ProfileThemeViewContent({ preferencesPromise }: ProfileThemeViewPageProps) {
    const response = use(preferencesPromise);

    return <PortalThemeSection initialTheme={response.data?.theme ?? "light"} />;
}
