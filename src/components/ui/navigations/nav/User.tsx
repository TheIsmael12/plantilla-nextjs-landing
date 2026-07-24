"use client";

import "@/styles/04-components/ui/navigations/nav/user.scss";

import { useMemo, useRef, useState, useTransition } from "react";

import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";

import { useOutsideClick } from "@/hooks/useOutsideClick";

import Avatar from "@/components/ui/avatars/Avatar";
import Button from "@/components/ui/buttons/Button";
import ModalComponent from "@/components/ui/modals/ModalComponent";
import MenuItems from "@/components/ui/navigations/sidebar/MenuItems";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";

/**
 * Menú de usuario de la barra de navegación: muestra el avatar y nombre de la
 * sesión activa, despliega los accesos al perfil y gestiona el cierre de
 * sesión mediante un modal de confirmación.
 * @returns {JSX.Element} El menú de usuario renderizado
 */
export default function User() {
  const t = useTranslations("Navigation.User");
  const modal = useTranslations("Modals");

  const session = useSession();
  const user = useMemo(() => session.data?.user, [session.data?.user]);
  const fullName = useMemo(
    () => [user?.firstName, user?.lastName].filter(Boolean).join(" "),
    [user?.firstName, user?.lastName],
  );

  const menuRef = useRef<HTMLDivElement>(null);

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [closingSession, startTransition] = useTransition();

  useOutsideClick(menuRef, {
    onOutsideClick: () => setIsOpenMenu(false),
    isActive: isOpenMenu,
  });

  const handleLogout = () => {
    startTransition(() => {
      signOut({ callbackUrl: "/login" });
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
          <Avatar
            src={user?.avatarUrl}
            alt={fullName ? `${fullName} avatar` : t("userAvatar")}
            size="sm"
            bordered
          />
          {fullName && <p className="navbar__user__name">{fullName}</p>}
          {isOpenMenu ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </button>

        {isOpenMenu && (
          <div className="navbar__user__menu">
            <MenuItems path="/profile" onNavigate={() => setIsOpenMenu(false)} />

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
