"use client";

import { Suspense, use } from "react";

import type { getClientTwoFactorStatus } from "@/actions/client-portal/profile-actions";

import ProfileSectionsSkeleton from "@/components/skeletons/profile/ProfileSectionsSkeleton";

import ChangePasswordSection from "@/views/(client-area)/private-area/profile/security/components/ChangePasswordSection";
import TwoFactorSection from "@/views/(client-area)/private-area/profile/security/components/TwoFactorSection";

interface ProfileSecurityViewPageProps {
    twoFactorStatusPromise: ReturnType<typeof getClientTwoFactorStatus>;
}

/**
 * Vista de `/private-area/profile/security`: cambio de contraseña y verificación en dos
 * pasos. Envuelve el contenido en `Suspense` para que `use()` pueda streamear
 * el estado del 2FA sin bloquear la navegación con un `await` en el Server Component.
 * @param {ProfileSecurityViewPageProps} props Promesa del estado de 2FA, sin resolver todavía
 * @returns {JSX.Element} La vista de seguridad renderizada
 */
export default function ProfileSecurityViewPage(props: ProfileSecurityViewPageProps) {
    return (
        <Suspense fallback={<ProfileSectionsSkeleton sections={2} />}>
            <ProfileSecurityViewContent {...props} />
        </Suspense>
    );
}

function ProfileSecurityViewContent({ twoFactorStatusPromise }: ProfileSecurityViewPageProps) {
    const response = use(twoFactorStatusPromise);

    return (
        <>
            <ChangePasswordSection />
            <TwoFactorSection initialEnabled={response.data?.enabled ?? false} />
        </>
    );
}
