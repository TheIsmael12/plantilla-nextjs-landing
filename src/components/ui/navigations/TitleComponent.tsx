"use client";

import "@/styles/04-components/ui/navigations/title-component.scss";

import { useTranslations } from "next-intl";

import { Link, usePathname, type AnyHref } from "@/i18n/navigation";
import { findRouteByPathname } from "@/utils/routingUtils";
import { ArrowLeftIcon } from "lucide-react";

import type { TitleComponentProps } from "@/types/ui/navigations/title-component";

/**
 * Título de página que se resuelve automáticamente a partir de la ruta activa.
 *
 * Busca la ruta actual en `PRIVATE_ROUTES` / `AUTH_ROUTES` (vía
 * `findRouteByPathname`) para obtener su icono, y traduce el título con la
 * misma clave (`pathname`) usada por el sidebar y la navegación de perfil
 * (`Navigation.Routes`). Si la ruta no está registrada, recurre al último
 * segmento del pathname como título y no muestra icono.
 */
export default function TitleComponent({
  extra,
  description,
  returnPath,
}: TitleComponentProps) {
  const t = useTranslations("Navigation.TitleComponent");
  const tRoutes = useTranslations("Navigation.Routes");

  const pathname = usePathname();
  const route = findRouteByPathname(pathname);

  const fallback = pathname.split("/").filter(Boolean).pop() ?? "";
  const title = tRoutes(route?.pathname ?? pathname, {
    default: fallback.charAt(0).toUpperCase() + fallback.slice(1),
  });

  const Icon = route?.icon;

  return (
    <div>
      <div className="page-title">
        {Icon && (
          <div className="page-title__icon">
            <Icon />
          </div>
        )}
        <div className="page-title__content">
          <h1 className="page-title__text">
            {title} {extra && <span className="page-title__extra">{extra}</span>}
          </h1>
          {description && <p className="page-title__description">{description}</p>}
        </div>
      </div>
      {
        returnPath && (
          <Link
            href={returnPath as AnyHref}
            className="page-title__return"
          >
            <ArrowLeftIcon />
            {t("back")} {tRoutes(returnPath).toLowerCase()}
          </Link>
        )
      }
    </div >
  );
}
