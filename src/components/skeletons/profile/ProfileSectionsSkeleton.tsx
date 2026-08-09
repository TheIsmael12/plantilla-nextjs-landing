import Skeleton from "@/components/ui/loaders/Skeleton";

interface ProfileSectionsSkeletonProps {
    sections?: number;
}

/**
 * Placeholder de carga común a las pantallas de perfil mientras `use()`
 * resuelve su promesa: un bloque por sección (`SettingsSection`).
 * @param {ProfileSectionsSkeletonProps} props Número de bloques de placeholder
 * @returns {JSX.Element} El esqueleto de una pantalla de perfil
 */
export default function ProfileSectionsSkeleton({ sections = 1 }: ProfileSectionsSkeletonProps) {
    return (
        <div className="profile__skeleton" aria-hidden="true">
            {Array.from({ length: sections }, (_, index) => (
                <Skeleton key={index} variant="rectangular" height="10rem" />
            ))}
        </div>
    );
}
