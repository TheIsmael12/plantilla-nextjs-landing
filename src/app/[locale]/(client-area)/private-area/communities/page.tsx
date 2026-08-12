import CommunitiesViewPage from '@/views/(client-area)/private-area/communities/CommunitiesViewPage';

/**
 * Página de `/private-area/communities`: selector de comunidades. Con una sola
 * comunidad el enlace de la cabecera entra directo en ella, pero la ruta
 * existe igualmente para quien navegue aquí a mano.
 * @returns {Promise<JSX.Element>} El selector de comunidades renderizado
 */
export default async function CommunitiesPage() {
  return <CommunitiesViewPage />;
}
