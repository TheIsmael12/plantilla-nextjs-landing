"use client";

import { Suspense, use } from "react";

import type { getMySessions } from "@/actions/client-portal/sessions-actions";

import ProfileSectionsSkeleton from "@/components/skeletons/profile/ProfileSectionsSkeleton";

import PortalSessionsSection from "@/views/(client-area)/private-area/profile/sessions/components/PortalSessionsSection";

interface ProfileSessionsViewPageProps {
    sessionsPromise: ReturnType<typeof getMySessions>;
}

/**
 * Vista de `/private-area/profile/sessions`: dispositivos con la sesión
 * abierta. Envuelve el contenido en `Suspense` para que `use()` pueda
 * streamear el listado sin bloquear la navegación con un `await` en el Server
 * Component.
 * @param {ProfileSessionsViewPageProps} props Promesa de las sesiones, sin resolver todavía
 * @returns {JSX.Element} La vista de sesiones renderizada
 */
export default function ProfileSessionsViewPage(props: ProfileSessionsViewPageProps) {
    return (
        <Suspense fallback={<ProfileSectionsSkeleton sections={1} />}>
            <ProfileSessionsViewContent {...props} />
        </Suspense>
    );
}

function ProfileSessionsViewContent({ sessionsPromise }: ProfileSessionsViewPageProps) {
    const response = use(sessionsPromise);

    return <PortalSessionsSection initialSessions={response.data ?? []} />;
}
