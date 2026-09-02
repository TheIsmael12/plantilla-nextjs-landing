import { getLocale } from 'next-intl/server';

import { getPendingContracts } from '@/actions/client-portal/contracts-actions';

import ProfileContractsViewPage from '@/views/(client-area)/private-area/profile/contracts/ProfileContractsViewPage';

/**
 * Página de `/private-area/profile/contracts`: los contratos pendientes de firma.
 *
 * Lanza `getPendingContracts` sin `await` para que la vista la resuelva con `use()` dentro de un
 * `Suspense`, igual que el resto de subpáginas del perfil.
 * @returns {Promise<JSX.Element>} La vista de contratos renderizada
 */
export default async function ProfileContractsPage() {
  const contractsPromise = getPendingContracts();
  const locale = await getLocale();

  return <ProfileContractsViewPage contractsPromise={contractsPromise} locale={locale} />;
}
