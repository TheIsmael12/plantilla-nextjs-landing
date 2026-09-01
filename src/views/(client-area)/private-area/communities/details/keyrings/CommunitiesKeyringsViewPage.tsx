import { getTranslations } from 'next-intl/server';
import { KeyRoundIcon, ShieldAlertIcon, TableIcon } from 'lucide-react';

import {
  getCommunitySchedules,
  getCommunitySites,
  getCommunityKeyMatrix,
  getCommunityKeyrings,
  getCommunityKeyringsPaginated,
} from '@/actions/client-portal/community-keyrings-actions';
import {
  getCommunityBypassReport,
  getCommunityLockCredentials,
} from '@/actions/client-portal/community-lock-credentials-actions';
import { getCommunityLocks } from '@/actions/client-portal/community-locks-actions';
import {
  getCommunityInvitations,
  getCommunityResidents,
} from '@/actions/client-portal/community-residents-actions';
import { CREDENTIAL_STATUS_VARIANTS } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import KeyMatrixGrid from '@/views/(client-area)/private-area/communities/details/keyrings/components/KeyMatrixGrid';
import MembersSection from '@/views/(client-area)/private-area/communities/details/keyrings/components/MembersSection';
import KeyringsSection from '@/views/(client-area)/private-area/communities/details/keyrings/components/KeyringsSection';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-key-matrix.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

const KEYRINGS_PER_PAGE = 10;
const CREDENTIALS_PER_PAGE = 10;

/**
 * Cuántas invitaciones se traen para poder repartirles llaves.
 *
 * Cien es el tope de la paginación de la API. No van paginadas porque no se listan: alimentan el selector de
 * «a quién», donde se busca escribiendo, y una comunidad no tiene cien invitaciones abiertas a la vez salvo
 * el día del alta — que es justo cuando se reparte todo de golpe y con esto llega.
 */
const INVITATIONS_LIMIT = 100;

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
 * mismo criterio que `CommunitiesResidentsViewPage` con vecinos e invitaciones.
 *
 * El informe de salto de horario (`Keyrings.BypassSection`) se queda con su
 * tabla nativa: `getCommunityBypassReport` no pagina (devuelve el array
 * completo), así que no hay estado real de servidor que darle a `Table` en
 * modo `manualPagination`.
 * @param {KeyringsViewPageProps} props - Comunidad activa, locale y query params
 * @returns {Promise<JSX.Element>} La pantalla de llaveros renderizada
 */
export default async function CommunitiesKeyringsViewPage({
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
    invitationsResponse,
    bypassResponse,
    sitesResponse,
    schedulesResponse,
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
    getCommunityInvitations(serviceId, { limit: INVITATIONS_LIMIT }),
    getCommunityBypassReport(serviceId),
    getCommunitySites(serviceId),
    getCommunitySchedules(serviceId),
  ]);

  const bypassCredentials = bypassResponse.data ?? [];

  /*
   * Solo las que siguen abiertas.
   *
   * `includeClosed` deja fuera las aceptadas y las revocadas, pero **no las caducadas**: siguen ahí hasta que
   * se reenvían. Planificarle un llavero a una invitación caducada es trabajo que no llega a nadie, porque el
   * enlace ya no se puede aceptar.
   */
  const pendingInvitations = (invitationsResponse.data?.items ?? []).filter(
    (invitation) => invitation.status === 'PENDING',
  );

  return (
    <>
      <ViewHeader title={t('Keyrings.title')} description={t('Keyrings.description')} />

      <KeyringsSection
        serviceId={serviceId}
        keyrings={
          keyringsResponse.data ?? {
            items: [],
            pagination: { page: 1, limit: keyringsLimit, totalItems: 0, totalPages: 1 },
          }
        }
        locks={locksResponse.data ?? []}
        sites={sitesResponse.data ?? []}
        schedules={schedulesResponse.data ?? []}
      />

      <SettingsSection
        title={t('Keyrings.Members.title')}
        description={t('Keyrings.Members.description')}
        icon={KeyRoundIcon}
      >
        <MembersSection
          serviceId={serviceId}
          keyrings={allKeyringsResponse.data ?? []}
          residents={residentsResponse.data ?? []}
          invitations={pendingInvitations}
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
                  <th>{t('Keyrings.Members.labelColumn')}</th>
                  <th>{t('Keyrings.Members.holderColumn')}</th>
                  <th>{t('Keyrings.BypassSection.reasonColumn')}</th>
                  <th>{t('Keyrings.Members.statusColumn')}</th>
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
                            {t('Keyrings.Members.noResident')}
                          </span>
                        )}
                    </td>
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
