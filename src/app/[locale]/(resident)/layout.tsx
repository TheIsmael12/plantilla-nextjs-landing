import { PropsWithChildren } from "react";

import { Link } from "@/i18n/navigation";
import ImageLogo from "@/components/ui/images/ImageLogo";

import "@/styles/04-components/auth/authLayout.scss";

/**
 * Layout minimalista de las páginas donde aterriza el enlace del correo de un vecino
 * (recuperar contraseña, aceptar invitación): logo + contenido centrado, sin `Navbar`/`Footer`.
 *
 * Grupo de rutas separado de `(auth)` a propósito: `(auth)` redirige a `/private-area` cuando hay sesión de
 * NextAuth activa, y esa sesión es la del portal de cliente. Un vecino nunca tiene una — su sesión vive en la
 * app móvil con un JWT propio —, pero acoplar este flujo a ese layout habría dejado la redirección del portal
 * de cliente gobernando, sin querer, una pantalla que no es suya.
 * @param {PropsWithChildren} props - Contenido a renderizar dentro del layout
 * @returns {JSX.Element} El layout renderizado
 */
export default function ResidentLayout({ children }: PropsWithChildren) {
  return (
    <div className="auth-layout">
      <Link href="/" className="auth-layout__logo">
        <ImageLogo />
      </Link>
      <main className="auth-layout__content">{children}</main>
    </div>
  );
}
