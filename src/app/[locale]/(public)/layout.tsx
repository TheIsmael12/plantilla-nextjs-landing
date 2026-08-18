import { PropsWithChildren } from "react";

import { getTranslations } from "next-intl/server";

import GoogleTagManager from "@/components/analytics/GoogleTagManager";
import Navbar from "@/components/ui/navigation/Navbar";
import Footer from "@/components/ui/navigation/Footer";
import GoToTop from "@/components/ui/navigation/GoToTop";

/**
 * Layout de las páginas públicas: envuelve el contenido entre la barra de
 * navegación y el pie de página. `Navbar` es siempre fija (`position:
 * fixed`), así que el contenido va en `.public-layout`, que le reserva el
 * hueco correspondiente con `padding-top`. `GoToTop` flota sobre el
 * contenido en todas las páginas públicas. El enlace "saltar al contenido
 * principal" (§2.4.1 WCAG) es el primer elemento enfocable de la página,
 * antes incluso de `Navbar`, para no obligar a los usuarios de teclado a
 * recorrer toda la navegación en cada página.
 *
 * La medición (`GoogleTagManager`) cuelga de aquí y no del layout por
 * locale: así queda acotada a las páginas públicas y el área privada del
 * cliente no se mide.
 * @param {PropsWithChildren} props Contenedor con la página pública a renderizar
 * @returns {Promise<JSX.Element>} El layout público renderizado
 */
export default async function PublicLayout({
    children
}: PropsWithChildren) {
    const t = await getTranslations("Common");

    return (
        <>
            <a href="#main-content" className="skip-link">
                {t("skipToContent")}
            </a>
            <Navbar />
            <div className="public-layout" id="main-content" tabIndex={-1}>
                {children}
            </div>
            <Footer />
            <GoToTop />
            <GoogleTagManager />
        </>
    )
}