'use client';

import { Suspense, use } from 'react';

import type { getPendingContracts } from '@/actions/client-portal/contracts-actions';

import ProfileSectionsSkeleton from '@/components/skeletons/profile/ProfileSectionsSkeleton';

import PendingContractsSection from '@/views/(client-area)/private-area/profile/contracts/components/PendingContractsSection';

interface ProfileContractsViewPageProps {
  contractsPromise: ReturnType<typeof getPendingContracts>;
  locale: string;
}

/**
 * Vista de `/private-area/profile/contracts`: lo que le queda por firmar al cliente.
 *
 * Mismo `Suspense` que el resto de subpáginas del perfil, para que `use()` pueda streamear el listado sin
 * bloquear la navegación con un `await` en el Server Component.
 * @param {ProfileContractsViewPageProps} props - Promesa de los contratos, sin resolver todavía, y el locale
 * @returns {JSX.Element} La vista renderizada
 */
export default function ProfileContractsViewPage(props: ProfileContractsViewPageProps) {
  return (
    <Suspense fallback={<ProfileSectionsSkeleton sections={1} />}>
      <ProfileContractsViewContent {...props} />
    </Suspense>
  );
}

function ProfileContractsViewContent({ contractsPromise, locale }: ProfileContractsViewPageProps) {
  const response = use(contractsPromise);

  return <PendingContractsSection initialContracts={response.data ?? []} locale={locale} />;
}
