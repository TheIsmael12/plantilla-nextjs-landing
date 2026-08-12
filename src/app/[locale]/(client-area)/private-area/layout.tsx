import { PropsWithChildren } from "react";

import BreadcrumbProvider from "@/context/BreadcrumbProvider";

import BreadCrumbs from "@/components/ui/navigations/BreadCrumbs";
import ClientAreaHeader from "@/components/ui/navigations/ClientAreaHeader";

import "@/styles/04-components/client-area/clientAreaHeader.scss";
import "@/styles/04-components/ui/navigations/bread-crumbs.scss";

/**
 * Layout común de `/private-area/*` (home, perfil, servicios contratados,
 * presupuestos, facturas): cabecera del área de cliente (logo + menú de
 * usuario), compartida por todas las secciones. El menú lateral de perfil
 * (`ProfileLayout`) se añade encima, solo para `/private-area/profile/*`,
 * en su propio `layout.tsx` anidado. El guard de sesión lo aporta
 * `(client-area)/layout.tsx`.
 *
 * Aquí y no en `(client-area)/layout.tsx` van las migas de pan: este es el layout que envuelve **solo** las
 * pantallas del área privada, que son las que forman una jerarquía por la que se puede subir. El
 * `BreadcrumbProvider` va por fuera porque las páginas de detalle inyectan en él la etiqueta del último
 * segmento (el código de la factura en vez de su UUID) desde dentro de `children`.
 * @param {PropsWithChildren} props Contenedor con la página a renderizar
 * @returns {JSX.Element} El layout del área privada renderizado
 */
export default function PrivateAreaLayout({ children }: PropsWithChildren) {
    return (
        <BreadcrumbProvider>
            <div className="client-area">
                <ClientAreaHeader />
                <main className="client-area__content">
                    <BreadCrumbs />
                    {children}
                </main>
            </div>
        </BreadcrumbProvider>
    );
}
