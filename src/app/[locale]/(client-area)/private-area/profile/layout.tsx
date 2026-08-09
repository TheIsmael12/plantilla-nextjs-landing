import type { PropsWithChildren } from "react";

import ProfileLayout from "@/components/layouts/ProfileLayout";

/**
 * Layout de `/private-area/profile/*`: menú lateral y título automático
 * compartidos por todas las subpáginas de perfil. La cabecera del área de
 * cliente ya la aporta el layout padre (`private-area/layout.tsx`).
 * @param {PropsWithChildren} props Contenedor con la subpágina de perfil a renderizar
 * @returns {JSX.Element} El layout de perfil renderizado
 */
export default function ProfileRouteLayout({ children }: PropsWithChildren) {
    return <ProfileLayout>{children}</ProfileLayout>;
}
