'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MailIcon, UserPlusIcon } from 'lucide-react';

import {
  createCommunityInvitations,
  resendCommunityInvitation,
  revokeCommunityInvitation,
  revokeCommunityMembership,
  updateCommunityMembership,
  updateCommunityResidentAccount,
} from '@/actions/client-portal/community-residents-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import InvitationsTable from '@/views/(client-area)/private-area/communities/details/residents/components/InvitationsTable';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import ResidentsTable from '@/views/(client-area)/private-area/communities/details/residents/components/ResidentsTable';
import Select from '@/components/ui/inputs/Select';
import SelectSearch from '@/components/ui/inputs/SelectSearch';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import TagsInput from '@/components/ui/inputs/TagsInput';
import Toggle from '@/components/ui/inputs/Toggle';

import type {
  CommunityUnit,
  LockCredentialType,
  LockGroup,
  PortalResident,
  ResidentInvitation,
  ResidentRole,
} from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';

const ROLES: ResidentRole[] = ['PROPIETARIO', 'INQUILINO', 'PRESIDENTE', 'ADMINISTRADOR'];
const CREDENTIAL_TYPES: LockCredentialType[] = ['NFC_CARD', 'NFC_PHONE', 'PIN', 'APP'];
const MAX_EMAILS = 50;

interface ResidentsManagerProps {
  serviceId: string;
  locale: string;
  residents: PaginatedResult<PortalResident>;
  invitations: PaginatedResult<ResidentInvitation>;
  units: CommunityUnit[];
  keyrings: LockGroup[];
  includeClosed: boolean;
  /** Si las altas de vecinos las gestiona el cliente; con `false` la API rechaza invitar y aquí no se ofrece. */
  residentsManagedByClient: boolean;
}

/**
 * Toda la interacción de la pantalla de vecinos: invitar (uno o varios
 * correos), cambiar unidad/rol, revocar pertenencias y gestionar las
 * invitaciones pendientes. Un único Client Component en vez de uno por acción
 * porque todos comparten el mismo `useTransition` y el mismo refresco de la
 * ruta tras cada escritura.
 * @param {ResidentsManagerProps} props - Datos ya cargados en servidor y comunidad activa
 * @returns {JSX.Element} El listado de vecinos e invitaciones con sus acciones
 */
export default function CommunitiesResidentsPanel({
  serviceId,
  locale,
  residents,
  invitations,
  units,
  keyrings,
  includeClosed,
  residentsManagedByClient,
}: ResidentsManagerProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');
  const tErrors = useTranslations('Common.Errors');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editing, setEditing] = useState<PortalResident | null>(null);
  const [revoking, setRevoking] = useState<PortalResident | null>(null);
  const [revokingInvitation, setRevokingInvitation] = useState<ResidentInvitation | null>(null);

  const [emails, setEmails] = useState<string[]>([]);
  const [inviteName, setInviteName] = useState('');
  const [inviteUnitId, setInviteUnitId] = useState('');
  const [inviteRole, setInviteRole] = useState<ResidentRole>('PROPIETARIO');
  const [inviteKeyrings, setInviteKeyrings] = useState<Record<string, LockCredentialType>>({});

  const [editUnitId, setEditUnitId] = useState('');
  const [editRole, setEditRole] = useState<ResidentRole>('PROPIETARIO');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const validateEmail = (candidate: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate) ? undefined : 'tagsInputInvalidEmail';

  const run = (action: () => Promise<FetchResponse<unknown>>, onDone?: () => void) => {
    startTransition(async () => {
      const response = await action();
      notifyResponse(response, tErrors('unexpectedError'));

      if (
        response.status === HTTPStatus.OK ||
        response.status === HTTPStatus.CREATED ||
        response.status === HTTPStatus.NO_CONTENT
      ) {
        onDone?.();
        router.refresh();
      }
    });
  };

  const resetInvite = () => {
    setIsInviteOpen(false);
    setEmails([]);
    setInviteName('');
    setInviteUnitId('');
    setInviteRole('PROPIETARIO');
    setInviteKeyrings({});
  };

  const handleInvite = () => {
    run(
      () =>
        createCommunityInvitations(serviceId, {
          emails,
          // El backend solo acepta `name` cuando se invita a una única
          // persona: con varios correos no habría a quién asignárselo.
          name: emails.length === 1 && inviteName ? inviteName : undefined,
          communityUnitId: inviteUnitId || undefined,
          role: inviteRole,
          keyrings: Object.entries(inviteKeyrings).map(([lockGroupId, credentialType]) => ({
            lockGroupId,
            credentialType,
          })),
        }),
      resetInvite,
    );
  };

  const openEdit = (resident: PortalResident) => {
    setEditing(resident);
    setEditUnitId(resident.communityUnitId ?? '');
    setEditRole(resident.role);
    setEditName(resident.name);
    setEditEmail(resident.email);
  };

  /*
   * Dos llamadas y no una: unidad/rol vive en la pertenencia y nombre/correo en la cuenta, que es
   * otro recurso con su propia validación (email único). Si la primera falla, no se intenta la
   * segunda — mejor un cambio a medias visible en el toast de error que aplicar el correo con la
   * unidad todavía sin guardar.
   */
  const handleEdit = () => {
    if (!editing) return;
    const target = editing;

    startTransition(async () => {
      const membershipResponse = await updateCommunityMembership(target.membershipId, {
        communityUnitId: editUnitId || null,
        role: editRole,
      });

      if (membershipResponse.status !== HTTPStatus.OK) {
        notifyResponse(membershipResponse, tErrors('unexpectedError'));
        return;
      }

      const nameChanged = editName.trim() !== target.name;
      const emailChanged = editEmail.trim().toLowerCase() !== target.email;

      if (nameChanged || emailChanged) {
        const accountResponse = await updateCommunityResidentAccount(target.membershipId, {
          ...(nameChanged && { name: editName }),
          ...(emailChanged && { email: editEmail }),
        });

        notifyResponse(accountResponse, tErrors('unexpectedError'));
        if (accountResponse.status === HTTPStatus.OK) {
          setEditing(null);
          router.refresh();
        }
        return;
      }

      notifyResponse(membershipResponse, tErrors('unexpectedError'));
      setEditing(null);
      router.refresh();
    });
  };

  const toggleKeyring = (keyringId: string) => {
    setInviteKeyrings((previous) => {
      const next = { ...previous };
      if (next[keyringId]) {
        delete next[keyringId];
      } else {
        next[keyringId] = 'APP';
      }
      return next;
    });
  };

  return (
    <>
      {/*
        Cuando las altas no las gestiona el cliente, no hay botón de invitar: se explica de quién es la
        gestión y ya está.

        Antes el botón estaba siempre, y en estas comunidades el único camino era rellenar el formulario
        entero —correos, unidad, rol, llaveros— para que la API contestara 403 al final. Ofrecer una acción
        que va a ser rechazada no es informar, es hacer perder el tiempo; y el aviso dice además a quién hay
        que pedírselo, que es lo que de verdad se necesita saber.
      */}
      {residentsManagedByClient ? (
        <div className="community-toolbar">
          <div />
          <div className="community-toolbar__actions">
            <Button title="invite" variant="primary" onClick={() => setIsInviteOpen(true)}>
              <UserPlusIcon />
            </Button>
          </div>
        </div>
      ) : (
        <Alert type="info" message={t('Residents.managedByStaffNotice')} />
      )}

      <ResidentsTable
        data={residents}
        isActionPending={isPending}
        onEdit={openEdit}
        onRevoke={setRevoking}
      />

      <SettingsSection
        title={t('Residents.invitationsTitle')}
        description={t('Residents.invitationsDescription')}
        icon={MailIcon}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const params = new URLSearchParams(window.location.search);
              if (includeClosed) {
                params.delete('closed');
              } else {
                params.set('closed', '1');
              }
              const query = params.toString();
              router.replace(`${window.location.pathname}${query ? `?${query}` : ''}`);
            }}
          >
            {includeClosed ? t('Residents.hideClosed') : t('Residents.showClosed')}
          </Button>
        }
      >
        <InvitationsTable
          data={invitations}
          locale={locale}
          isActionPending={isPending}
          onResend={(invitation) => run(() => resendCommunityInvitation(invitation.id))}
          onRevoke={setRevokingInvitation}
        />
      </SettingsSection>

      {isInviteOpen && (
        <ModalComponent
          title={t('Residents.inviteTitle')}
          isOpen
          isLarge
          isLoading={isPending}
          onClose={resetInvite}
          onCancel={resetInvite}
          onConfirm={handleInvite}
          confirmText="invite"
          isLoadingText="inviting"
          confirmDisabled={emails.length === 0}
        >
          <div className="community-form">
            <p>{t('Residents.inviteDescription')}</p>

            <TagsInput
              id="invite-emails"
              label={t('Residents.emailsLabel')}
              noTranslate
              type="email"
              value={emails}
              onChange={setEmails}
              max={MAX_EMAILS}
              validate={validateEmail}
              required
              className="input__full"
            />

            <p className="community-form__help">{t('Residents.emailsHelp')}</p>

            {emails.length === 1 && (
              <div className="community-form__field">
                <Input
                  id="invite-name"
                  name="name"
                  label={t('Residents.nameLabel')}
                  noTranslate
                  placeholder={t('Residents.namePlaceholder')}
                  className="input__full"
                  value={inviteName}
                  maxLength={150}
                  onChange={(event) => setInviteName(event.target.value)}
                />
                <span className="community-form__help">{t('Residents.nameHelp')}</span>
              </div>
            )}

            <div className="form-row form-row--cols-2">
              <SelectSearch
                id="invite-unit"
                name="communityUnitId"
                label={t('Residents.unitLabel')}
                noTranslate
                placeholder={t('Residents.unitPlaceholder')}
                description={t('Residents.unitHelp')}
                className="select__full"
                value={inviteUnitId}
                onChange={(value) => setInviteUnitId(value)}
                options={[
                  { value: '', label: t('Residents.noUnit') },
                  ...units.map((unit) => ({ value: unit.id, label: unit.code })),
                ]}
              />

              <Select
                name="role"
                label={t('Residents.roleLabel')}
                noTranslate
                placeholder={t('Residents.rolePlaceholder')}
                description={t('Residents.roleHelp')}
                className="select__full"
                value={inviteRole}
                onChange={(value) => setInviteRole(value as ResidentRole)}
                options={ROLES.map((role) => ({
                  value: role,
                  label: t(`ResidentRole.${role}`),
                }))}
              />
            </div>

            <div className="community-form__field">
              <span className="community-form__label">{t('Residents.keyringsLabel')}</span>
              <span className="community-form__help">{t('Residents.keyringsHelp')}</span>

              {keyrings.length > 0 ? (
                <div className="community-form__check-list">
                  {keyrings.map((keyring) => (
                    <div key={keyring.id} className="form-row form-row--cols-2">
                      <Toggle
                        name={`keyring-${keyring.id}`}
                        label={keyring.name}
                        checked={Boolean(inviteKeyrings[keyring.id])}
                        onChange={() => toggleKeyring(keyring.id)}
                      />

                      {inviteKeyrings[keyring.id] && (
                        <Select
                          name={`keyring-type-${keyring.id}`}
                          ariaLabel={t('Residents.credentialTypeLabel')}
                          noTranslate
                          placeholder={t('Residents.credentialTypePlaceholder')}
                          description={t('Residents.credentialTypeHelp')}
                          className="select__full"
                          value={inviteKeyrings[keyring.id]}
                          onChange={(value) =>
                            setInviteKeyrings((previous) => ({
                              ...previous,
                              [keyring.id]: value as LockCredentialType,
                            }))
                          }
                          options={CREDENTIAL_TYPES.map((type) => ({
                            value: type,
                            label: t(`CredentialType.${type}`),
                          }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="community-form__help">{t('Residents.keyringsEmpty')}</span>
              )}
            </div>
          </div>
        </ModalComponent>
      )}

      {editing && (
        <ModalComponent
          title={t('Residents.editTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setEditing(null)}
          onCancel={() => setEditing(null)}
          onConfirm={handleEdit}
          confirmText="save"
          isLoadingText="saving"
        >
          <div className="community-form">
            <p>{t('Residents.editDescription')}</p>

            <div className="form-row form-row--cols-2">
              <Input
                id="edit-name"
                name="name"
                label={t('Residents.nameLabel')}
                noTranslate
                className="input__full"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
              />

              <Input
                id="edit-email"
                name="email"
                type="email"
                label={t('Residents.emailLabel')}
                noTranslate
                className="input__full"
                value={editEmail}
                onChange={(event) => setEditEmail(event.target.value)}
              />
            </div>

            {editEmail.trim().toLowerCase() !== editing.email && (
              <Alert
                type="warning"
                message={t('Residents.emailChangeWarning', { email: editing.email })}
              />
            )}

            <div className="form-row form-row--cols-2">
              <SelectSearch
                id="edit-unit"
                name="communityUnitId"
                label={t('Residents.unitLabel')}
                noTranslate
                placeholder={t('Residents.unitPlaceholder')}
                className="select__full"
                value={editUnitId}
                onChange={(value) => setEditUnitId(value)}
                options={[
                  { value: '', label: t('Residents.noUnit') },
                  ...units.map((unit) => ({ value: unit.id, label: unit.code })),
                ]}
              />

              <Select
                name="role"
                label={t('Residents.roleLabel')}
                noTranslate
                placeholder={t('Residents.rolePlaceholder')}
                description={t('Residents.roleHelp')}
                className="select__full"
                value={editRole}
                onChange={(value) => setEditRole(value as ResidentRole)}
                options={ROLES.map((role) => ({
                  value: role,
                  label: t(`ResidentRole.${role}`),
                }))}
              />
            </div>
          </div>
        </ModalComponent>
      )}

      {revoking && (
        <ModalComponent
          title={t('Residents.revokeTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setRevoking(null)}
          onCancel={() => setRevoking(null)}
          onConfirm={() =>
            run(() => revokeCommunityMembership(revoking.membershipId), () => setRevoking(null))
          }
          confirmVariant="danger"
          confirmText="revoke"
          isLoadingText="revoking"
        >
          <p>{t('Residents.revokeDescription')}</p>
        </ModalComponent>
      )}

      {revokingInvitation && (
        <ModalComponent
          title={t('Residents.revokeInvitationTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setRevokingInvitation(null)}
          onCancel={() => setRevokingInvitation(null)}
          onConfirm={() =>
            run(
              () => revokeCommunityInvitation(revokingInvitation.id),
              () => setRevokingInvitation(null),
            )
          }
          confirmVariant="danger"
          confirmText="revoke"
          isLoadingText="revoking"
        >
          <p>{t('Residents.revokeInvitationDescription')}</p>
        </ModalComponent>
      )}
    </>
  );
}
