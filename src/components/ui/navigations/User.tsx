"use client";

import "@/styles/04-components/ui/navigations/nav/user.scss";

import { useRef, useState, useTransition } from "react";

import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { useOutsideClick } from "@/hooks/useOutsideClick";

import Button from "@/components/ui/buttons/Button";
import ModalComponent from "@/components/ui/modals/ModalComponent";
import MenuItems from "@/components/ui/navigations/sidebar/MenuItems";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

interface UserProps {
  /**
   * Cierre de sesión personalizado (p. ej. revocar el `refreshToken` en el
   * backend antes de destruir la sesión de NextAuth). Por defecto solo
   * llama a `signOut()`.
   */
  onLogout?: () => Promise<void> | void;
}

/**
 * Menú de usuario del portal de cliente: nombre de la sesión activa (sin
 * avatar, el portal no tiene foto ni iniciales que mostrar), despliega el
 * árbol de `/private-area/profile` (seguridad, sesiones, preferencias —esta
 * última como grupo anidado, mismo patrón que `plantilla-nextjs`) y gestiona
 * el cierre de sesión mediante un modal de confirmación. Servicios,
 * presupuestos, facturas y comunidades no van aquí: ya están en el navbar
 * horizontal del área de cliente.
 * @param {UserProps} props - Propiedades del componente
 * @returns {JSX.Element} El menú de usuario renderizado
 */
export default function User({ onLogout }: UserProps) {
  const modal = useTranslations("Modals");

  const { data: session } = useSession();
  const name = session?.user.name;

  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [closingSession, startTransition] = useTransition();

  useOutsideClick(menuRef, {
    onOutsideClick: () => setIsOpenMenu(false),
    isActive: isOpenMenu,
  });

  const handleLogout = () => {
    startTransition(async () => {
      if (onLogout) {
        await onLogout();
      } else {
        await signOut({ callbackUrl: "/" });
      }
    });
  };

  return (
    <>
      <div ref={menuRef} className="navbar__user__wrapper">
        <button
          type="button"
          className="navbar__user"
          aria-expanded={isOpenMenu}
          aria-haspopup="menu"
          onClick={() => setIsOpenMenu((prev) => !prev)}
        >
          {name && <p className="navbar__user__name">{name}</p>}
          {isOpenMenu ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>

        {isOpenMenu && (
          <div className="navbar__user__menu">
            <MenuItems path="/private-area/profile" onNavigate={() => setIsOpenMenu(false)} />

            <hr className="navbar__user__menu__divider" />

            <div className="menu-items__list">
              <Button
                title="closeSession"
                type="button"
                className="navbar__user__menu__logout"
                onClick={() => {
                  setIsOpenMenu(false);
                  setIsOpenModal(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {isOpenModal && (
        <ModalComponent
          title={modal("logoutConfirmation")}
          confirmVariant="error"
          confirmText="closeSession"
          isLoadingText="closingSession"
          isOpen={isOpenModal}
          isLoading={closingSession}
          onClose={() => setIsOpenModal(false)}
          onCancel={() => setIsOpenModal(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
}
