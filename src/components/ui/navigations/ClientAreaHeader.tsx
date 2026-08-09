import { getClientCommunities } from '@/actions/client-portal/communities-actions';
import { getClientUnreadCount } from '@/actions/client-portal/notifications-actions';

import ClientAreaHeaderNav from '@/components/ui/navigations/ClientAreaHeaderNav';

import '@/styles/04-components/client-area/clientAreaHeader.scss';

/**
 * Cabecera del área de cliente: mismo patrón visual que `Navbar` (barra fija,
 * logo a la izquierda, sombra al hacer scroll), pero exclusiva de
 * `/private-area/*` — el logo lleva al dashboard del área privada (no a la
 * home pública) y el centro enlaza a servicios/presupuestos/facturas, algo
 * que no debe aparecer en el `Navbar` público.
 *
 * Es un Server Component solo para poder resolver aquí el enlace de
 * comunidades: a diferencia del resto, no puede salir del catálogo estático
 * de `routing.ts` (`shownInNavbar`) porque depende de si este cliente tiene
 * alguna comunidad activa, y eso solo lo sabe la API. Con una única comunidad
 * el enlace salta directo a ella y se ahorra el selector; con varias lleva al
 * selector; sin ninguna, no se pinta.
 *
 * Aquí se resuelve también el contador de notificaciones sin leer, por el
 * mismo motivo: así la campana se pinta ya con su número en el primer render
 * en vez de aparecer en cero y saltar al hidratar.
 * @returns {Promise<JSX.Element>} La cabecera del área de cliente renderizada
 */
export default async function ClientAreaHeader() {
  const [response, unreadResponse] = await Promise.all([
    getClientCommunities(),
    getClientUnreadCount(),
  ]);
  const communities = response.data ?? [];

  const communityHref =
    communities.length === 0
      ? null
      : communities.length === 1
        ? `/private-area/communities/${communities[0].serviceId}`
        : '/private-area/communities';

  return (
    <ClientAreaHeaderNav
      communityHref={communityHref}
      initialUnreadCount={unreadResponse.data?.count ?? 0}
    />
  );
}
