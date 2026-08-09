"use client";

import { Suspense, use } from "react";

import type { getMyPreferences } from "@/actions/client-portal/preferences-actions";
import type { PortalPreferences } from "@/types/client-portal/preferences";

import ProfileSectionsSkeleton from "@/components/skeletons/profile/ProfileSectionsSkeleton";

import PortalDateTimeSection from "@/components/ui/client-area/PortalDateTimeSection";

/** Valores por defecto si la API no respondió: los mismos que aplica el backend al crear la fila. */
const FALLBACK_DATETIME_PREFERENCES: Pick<
    PortalPreferences,
    "timezone" | "dateFormat" | "timeFormat" | "firstDayOfWeek"
> = {
    timezone: "Europe/Madrid",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    firstDayOfWeek: "MONDAY",
};

interface ProfileDateTimeViewPageProps {
    preferencesPromise: ReturnType<typeof getMyPreferences>;
}

/**
 * Vista de `/private-area/profile/preferences/datetime`: zona horaria y
 * formatos de fecha/hora. Envuelve el contenido en `Suspense` para que
 * `use()` pueda streamear las preferencias sin bloquear la navegación.
 * @param {ProfileDateTimeViewPageProps} props Promesa de las preferencias, sin resolver todavía
 * @returns {JSX.Element} La vista de fecha y hora renderizada
 */
export default function ProfileDateTimeViewPage(props: ProfileDateTimeViewPageProps) {
    return (
        <Suspense fallback={<ProfileSectionsSkeleton sections={1} />}>
            <ProfileDateTimeViewContent {...props} />
        </Suspense>
    );
}

function ProfileDateTimeViewContent({ preferencesPromise }: ProfileDateTimeViewPageProps) {
    const response = use(preferencesPromise);

    return (
        <PortalDateTimeSection
            initialPreferences={response.data ?? FALLBACK_DATETIME_PREFERENCES}
        />
    );
}
