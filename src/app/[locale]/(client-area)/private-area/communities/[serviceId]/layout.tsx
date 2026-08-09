import type { PropsWithChildren } from "react";

import CommunityLayout from "@/components/layouts/CommunityLayout";

interface CommunityRouteLayoutProps extends PropsWithChildren {
  params: Promise<{ serviceId: string }>;
}

/**
 * Layout de `/private-area/communities/[serviceId]/*`: menú lateral de las
 * secciones de la comunidad, compartido por todas sus subpáginas. La cabecera
 * del área de cliente ya la aporta el layout padre.
 * @param {CommunityRouteLayoutProps} props - Comunidad activa y subpágina a renderizar
 * @returns {Promise<JSX.Element>} El layout de comunidad renderizado
 */
export default async function CommunityRouteLayout({
  params,
  children,
}: CommunityRouteLayoutProps) {
  const { serviceId } = await params;

  return <CommunityLayout serviceId={serviceId}>{children}</CommunityLayout>;
}
