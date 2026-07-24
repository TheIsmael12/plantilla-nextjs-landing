"use client";

import "@/styles/04-components/ui/errors/not-found.scss";
import "@/styles/04-components/ui/buttons/button.scss";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";

import type { NotFoundProps } from "@/types/ui/errors/not-found";

/**
 * Página de error 404: muestra una ilustración, el mensaje traducido y un
 * enlace de vuelta al inicio.
 * @param {NotFoundProps} props - Propiedades del componente
 * @returns {JSX.Element} El contenido de la página 404
 */
export default function NotFound({ className }: NotFoundProps) {
  const t = useTranslations("NotFound");
  const buttons = useTranslations("Buttons");

  return (
    <div className={`not-found${className ? ` ${className}` : ""}`}>
      <div className="not-found__illustration">
        <Image
          src="/images/assets/Error404.svg"
          alt=""
          width={750}
          height={500}
          priority
          unoptimized
        />
      </div>

      <div className="not-found__content">
        <span className="not-found__content__badge">{t("code")}</span>
        <h1 className="not-found__content__title">{t("title")}</h1>
        <p className="not-found__content__description">{t("description")}</p>
        <div className="not-found__content__actions">
          <Link href="/" className="btn btn--primary btn--md">
            {buttons("goHome")}
          </Link>
          <Link href="/help" className="btn btn--outline-primary btn--md">
            {t("helpLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
