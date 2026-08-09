import { getTranslations } from 'next-intl/server';
import { KeyRoundIcon, ShieldAlertIcon, TableIcon } from 'lucide-react';

import {
  getCommunityKeyMatrix,
  getCommunityKeyrings,
  getCommunityKeyringsPaginated,
} from '@/actions/client-portal/community-keyrings-actions';
import {
  getCommunityBypassReport,
  getCommunityLockCredentials,
} from '@/actions/client-portal/community-lock-credentials-actions';
import { getCommunityLocks } from '@/actions/client-portal/community-locks-actions';
import { getCommunityResidents } from '@/actions/client-portal/community-residents-actions';
import { CREDENTIAL_STATUS_VARIANTS } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import CredentialsManager from '@/components/ui/client-area/community/CredentialsManager';
import KeyMatrixGrid from '@/components/ui/client-area/community/KeyMatrixGrid';
import KeyringsManager from '@/components/ui/client-area/community/KeyringsManager';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-key-matrix.scss';

const KEYRINGS_PER_PAGE = 10;
const CREDENTIALS_PER_PAGE = 10;

interface KeyringsViewPageProps {
  serviceId: string;
  locale: string;
  searchParams: Record<string, string | undefined>;
}

/**
 * Vista de llaveros y credenciales: los llaveros en sí, las credenciales
 * emitidas, la matriz vecino×puerta y el informe de quién puede saltarse el
 * horario. Van juntas porque responden a la misma pregunta desde ángulos
 * distintos: quién abre qué.
 *
 * Llaveros y credenciales son dos tablas paginables en la misma pantalla, así
 * que cada una lleva su propio namespace de query params (`page`/`limit`/
 * `sortBy`/`sortOrder`/`q` vs `credentialsPage`/`credentialsLimit`/
 * `credentialsSortBy`/`credentialsSortOrder`/`credentialsQ`, gestionados por
 * `useClientTableUrlState` dentro de `KeyringsTable`/`CredentialsTable`),
 * mismo criterio que `ResidentsViewPage` con vecinos e invitaciones.
 *
 * El informe de salto de horario (`Keyrings.BypassSection`) se queda con su
 * tabla nativa: `getCommunityBypassReport` no pagina (devuelve el array
 * completo), así que no hay estado real de servidor que darle a `Table` en
 * modo `manualPagination`.
 * @param {KeyringsViewPageProps} props - Comunidad activa, locale y query params
 * @returns {Promise<JSX.Element>} La pantalla de llaveros renderizada
 */
export default async function KeyringsViewPage({
  serviceId,
  locale,
  searchParams,
}: KeyringsViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Communities');

  const keyringsPage = Number(searchParams.page) > 0 ? Number(searchParams.page) : 1;
  const keyringsLimit =
    Number(searchParams.limit) > 0 ? Number(searchParams.limit) : KEYRINGS_PER_PAGE;
  const keyringsSearch = searchParams.q?.trim() || undefined;
  const keyringsSortBy = searchParams.sortBy || undefined;
  const keyringsSortOrder =
    searchParams.sortOrder === 'ASC' ? 'ASC' : searchParams.sortOrder === 'DESC' ? 'DESC' : undefined;

  const credentialsPage =
    Number(searchParams.credentialsPage) > 0 ? Number(searchParams.credentialsPage) : 1;
  const credentialsLimit =
    Number(searchParams.credentialsLimit) > 0
      ? Number(searchParams.credentialsLimit)
      : CREDENTIALS_PER_PAGE;
  const credentialsSearch = searchParams.credentialsQ?.trim() || undefined;
  const credentialsSortBy = searchParams.credentialsSortBy || undefined;
  const credentialsSortOrder =
    searchParams.credentialsSortOrder === 'ASC'
      ? 'ASC'
      : searchParams.credentialsSortOrder === 'DESC'
        ? 'DESC'
        : undefined;

  const [
    keyringsResponse,
    allKeyringsResponse,
    locksResponse,
    credentialsResponse,
    matrixResponse,
    residentsResponse,
    bypassResponse,
  ] = await Promise.all([
    getCommunityKeyringsPaginated(serviceId, {
      page: keyringsPage,
      limit: keyringsLimit,
      search: keyringsSearch,
      sortBy: keyringsSortBy,
      sortOrder: keyringsSortOrder,
    }),
    getCommunityKeyrings(serviceId),
    getCommunityLocks(serviceId),
    getCommunityLockCredentials(serviceId, {
      page: credentialsPage,
      limit: credentialsLimit,
      search: credentialsSearch,
      sortBy: credentialsSortBy,
      sortOrder: credentialsSortOrder,
    }),
    getCommunityKeyMatrix(serviceId),
    getCommunityResidents(serviceId),
    getCommunityBypassReport(serviceId),
  ]);

  const bypassCredentials = bypassResponse.data ?? [];

  return (
    <>
      <header className="community-layout__header">
        <h1 className="community-layout__title">{t('Keyrings.title')}</h1>
        <p className="community-layout__description">{t('Keyrings.description')}</p>
      </header>

      <KeyringsManager
        serviceId={serviceId}
        keyrings={
          keyringsResponse.data ?? {
            items: [],
            pagination: { page: 1, limit: keyringsLimit, totalItems: 0, totalPages: 1 },
          }
        }
        locks={locksResponse.data ?? []}
      />

      <SettingsSection
        title={t('Keyrings.CredentialsSection.title')}
        description={t('Keyrings.CredentialsSection.description')}
        icon={KeyRoundIcon}
      >
        <CredentialsManager
          serviceId={serviceId}
          locale={locale}
          credentials={
            credentialsResponse.data ?? {
              items: [],
              pagination: { page: 1, limit: credentialsLimit, totalItems: 0, totalPages: 1 },
            }
          }
          keyrings={allKeyringsResponse.data ?? []}
          locks={locksResponse.data ?? []}
          residents={residentsResponse.data ?? []}
        />
      </SettingsSection>

      <SettingsSection
        title={t('Keyrings.MatrixSection.title')}
        description={t('Keyrings.MatrixSection.description')}
        icon={TableIcon}
      >
        <KeyMatrixGrid matrix={matrixResponse.data ?? { locks: [], rows: [] }} />
      </SettingsSection>

      <SettingsSection
        title={t('Keyrings.BypassSection.title')}
        description={t('Keyrings.BypassSection.description')}
        icon={ShieldAlertIcon}
      >
        {bypassCredentials.length > 0 ? (
          <div className="community-table__scroll">
            <table className="community-table">
              <thead>
                <tr>
                  <th>{t('Keyrings.CredentialsSection.labelLabel')}</th>
                  <th>{t('Keyrings.CredentialsSection.holderColumn')}</th>
                  <th>{t('Keyrings.CredentialsSection.targetColumn')}</th>
                  <th>{t('Keyrings.BypassSection.reasonColumn')}</th>
                  <th>{t('Keyrings.CredentialsSection.statusColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {bypassCredentials.map((credential) => (
                  <tr key={credential.id}>
                    <td>
                      <strong>{credential.label}</strong>
                    </td>
                    <td>
                      {credential.residentName ??
                        credential.issuedForName ?? (
                          <span className="community-table__muted">
                            {t('Keyrings.CredentialsSection.noResident')}
                          </span>
                        )}
                    </td>
                    <td>{credential.targetName ?? '—'}</td>
                    <td>
                      {credential.bypassReason ?? (
                        <span className="community-table__muted">—</span>
                      )}
                    </td>
                    <td>
                      <Badge
                        variant={CREDENTIAL_STATUS_VARIANTS[credential.status]}
                        text={t(`CredentialStatus.${credential.status}`)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="community-empty">{t('Keyrings.BypassSection.empty')}</p>
        )}
      </SettingsSection>
    </>
  );
}
