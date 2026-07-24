import { PropsWithChildren } from "react";

/**
 * Layout de las páginas legales (términos, privacidad, cookies): las
 * renderiza sin envoltorio adicional, dejando la maquetación a cada vista.
 * @param {PropsWithChildren} props Contenedor con la página legal a renderizar
 * @returns {React.ReactNode} El contenido hijo renderizado
 */
export default function TermsLayout({
    children
}: PropsWithChildren) {
    return (
        children
    );
}