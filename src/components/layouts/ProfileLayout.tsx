import type { PropsWithChildren } from "react";

import MenuItems from "@/components/ui/navigations/sidebar/MenuItems";
import TitleComponent from "@/components/ui/navigations/TitleComponent";

import "@/styles/04-components/client-area/profile-layout.scss";

/**
 * Shell de las páginas de `/private-area/profile/*`: menú lateral
 * (`MenuItems` con `path="/private-area/profile"`) y título automático
 * (`TitleComponent`) a la derecha.
 * @param {PropsWithChildren} props `children` es la subpágina de perfil activa
 * @returns {JSX.Element} El layout de perfil renderizado
 */
export default function ProfileLayout({ children }: PropsWithChildren) {
    return (
        <div className="profile-layout">
            <nav aria-label="Profile navigation" className="profile-layout__nav">
                <MenuItems path="/private-area/profile" />
            </nav>
            <div className="profile-layout__container">
                <TitleComponent />
                <div className="profile-layout__content">{children}</div>
            </div>
        </div>
    );
}
