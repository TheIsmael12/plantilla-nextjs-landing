import { PropsWithChildren } from "react";

import ClientAreaHeader from "@/components/ui/navigations/ClientAreaHeader";

import "@/styles/04-components/client-area/clientAreaHeader.scss";

/**
 * Layout común de `/private-area/*` (home, perfil, servicios contratados,
 * presupuestos, facturas): cabecera del área de cliente (logo + menú de
 * usuario), compartida por todas las secciones. El menú lateral de perfil
 * (`ProfileLayout`) se añade encima, solo para `/private-area/profile/*`,
 * en su propio `layout.tsx` anidado. El guard de sesión lo aporta
 * `(client-area)/layout.tsx`.
 * @param {PropsWithChildren} props Contenedor con la página a renderizar
 * @returns {JSX.Element} El layout del área privada renderizado
 */
export default function PrivateAreaLayout({ children }: PropsWithChildren) {
    return (
        <div className="client-area">
            <ClientAreaHeader />
            <main className="client-area__content">{children}</main>
        </div>
    );
}
