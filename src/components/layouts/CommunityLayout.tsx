import type { PropsWithChildren } from "react";
import { getTranslations } from "next-intl/server";

import { getClientCommunities } from "@/actions/client-portal/communities-actions";
import CommunitySidebar from "@/components/ui/navigations/sidebar/CommunitySidebar";
import ClientListEmptyState from "@/components/ui/client-area/ClientListEmptyState";

import "@/styles/04-components/client-area/community-layout.scss";

interface CommunityLayoutProps extends PropsWithChildren {
  serviceId: string;
}

/**
 * Shell de `/private-area/communities/[serviceId]/*`: menú lateral de las
 * secciones de la comunidad más el contenido de la sección activa. Valida de
 * paso que el `serviceId` de la URL corresponde a una comunidad realmente
 * activa del cliente, para que una URL manipulada a mano no pinte un esqueleto
 * de pantallas que después fallarían una a una contra la API.
 * @param {CommunityLayoutProps} props - Comunidad activa y sección a renderizar
 * @returns {Promise<JSX.Element>} El layout de comunidad renderizado
 */
export default async function CommunityLayout({ serviceId, children }: CommunityLayoutProps) {
  const t = await getTranslations("Views.ClientArea.Communities");

  const response = await getClientCommunities();
  const communities = response.data ?? [];
  const community = communities.find((item) => item.serviceId === serviceId);

  if (!community) {
    return (
      <main className="client-area-page">
        <ClientListEmptyState
          resource="communities"
          title={t("notFoundTitle")}
          description={t("notFoundDescription")}
        />
      </main>
    );
  }

  return (
    <div className="community-layout">
      <CommunitySidebar
        serviceId={serviceId}
        communityName={community.serviceName}
        showCommunitiesLink={communities.length > 1}
        keyringEnabled={community.keyringEnabled}
      />

      <div className="community-layout__content">{children}</div>
    </div>
  );
}
