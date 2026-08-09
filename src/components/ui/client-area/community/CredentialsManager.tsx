'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { KeyRoundIcon, PlusIcon } from 'lucide-react';

import {
  createCommunityLockCredential,
  enrollCommunityCard,
  revokeCommunityLockCredential,
} from '@/actions/client-portal/community-lock-credentials-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import CredentialsTable from '@/components/ui/client-area/community/CredentialsTable';
import DatePicker from '@/components/ui/inputs/DatePicker';
import Input from '@/components/ui/inputs/Input';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import RadioGroup from '@/components/ui/inputs/RadioGroup';
import Select from '@/components/ui/inputs/Select';
import SelectSearch from '@/components/ui/inputs/SelectSearch';
import Toggle from '@/components/ui/inputs/Toggle';

import type {
  CommunityLock,
  LockCredential,
  LockCredentialType,
  LockGroup,
  PortalResident,
} from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';

const CREDENTIAL_TYPES: LockCredentialType[] = ['NFC_CARD', 'NFC_PHONE', 'PIN', 'APP'];

interface CredentialFormState {
  targetKind: 'keyring' | 'lock';
  lockGroupId: string;
  lockId: string;
  residentMembershipId: string;
  type: LockCredentialType;
  label: string;
  nfcUid: string;
  pin: string;
  issuedForName: string;
  validFrom: Date | null;
  validUntil: Date | null;
  canBypassSchedule: boolean;
  bypassReason: string;
}

const EMPTY_FORM: CredentialFormState = {
  targetKind: 'keyring',
  lockGroupId: '',
  lockId: '',
  residentMembershipId: '',
  type: 'APP',
  label: '',
  nfcUid: '',
  pin: '',
  issuedForName: '',
  validFrom: null,
  validUntil: null,
  canBypassSchedule: false,
  bypassReason: '',
};

interface CredentialsManagerProps {
  serviceId: string;
  locale: string;
  credentials: PaginatedResult<LockCredential>;
  keyrings: LockGroup[];
  locks: CommunityLock[];
  residents: PortalResident[];
}

/**
 * Emisión, revocación y enrolado de tarjetas de las credenciales de acceso.
 * Dos detalles del dominio marcan la UI: el PIN en claro solo llega en la
 * respuesta de creación y no es recuperable después (de ahí el modal de
 * "apúntalo ahora"), y revocar no es instantáneo en cerraduras sin conexión
 * permanente, así que el estado real se lee de `syncs`/`pendingLocks` en vez
 * de darlo por hecho.
 * @param {CredentialsManagerProps} props - Comunidad activa y catálogos para los selectores
 * @returns {JSX.Element} El listado de credenciales con sus acciones
 */
export default function CredentialsManager({
  serviceId,
  locale,
  credentials,
  keyrings,
  locks,
  residents,
}: CredentialsManagerProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<CredentialFormState>(EMPTY_FORM);
  const [revoking, setRevoking] = useState<LockCredential | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [enrolling, setEnrolling] = useState<LockCredential | null>(null);
  const [nfcUid, setNfcUid] = useState('');
  const [plainPin, setPlainPin] = useState<string | null>(null);

  const run = (action: () => Promise<FetchResponse<unknown>>, onDone?: () => void) => {
    startTransition(async () => {
      const response = await action();
      notifyResponse(response, t('loadError'));

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

  const closeForm = () => {
    setIsFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const handleCreate = () => {
    startTransition(async () => {
      const response = await createCommunityLockCredential(serviceId, {
        lockGroupId: form.targetKind === 'keyring' ? form.lockGroupId || undefined : undefined,
        lockId: form.targetKind === 'lock' ? form.lockId || undefined : undefined,
        residentMembershipId: form.residentMembershipId || undefined,
        type: form.type,
        label: form.label,
        nfcUid: form.nfcUid || undefined,
        pin: form.pin || undefined,
        issuedForName: form.issuedForName || undefined,
        validFrom: form.validFrom ? form.validFrom.toISOString() : undefined,
        validUntil: form.validUntil ? form.validUntil.toISOString() : undefined,
        canBypassSchedule: form.canBypassSchedule,
        bypassReason: form.bypassReason || undefined,
      });

      notifyResponse(response, t('loadError'));

      if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
        closeForm();
        // El PIN en claro solo viaja en esta respuesta: si no se muestra aquí,
        // se pierde para siempre.
        if (response.data?.plainPin) setPlainPin(response.data.plainPin);
        router.refresh();
      }
    });
  };

  const isFormValid =
    form.label.trim().length > 0 &&
    (form.targetKind === 'keyring' ? Boolean(form.lockGroupId) : Boolean(form.lockId));

  return (
    <>
      <div className="community-toolbar">
        <div />
        <div className="community-toolbar__actions">
          <Button title="create" variant="primary" onClick={() => setIsFormOpen(true)}>
            <PlusIcon />
          </Button>
        </div>
      </div>

      <CredentialsTable
        data={credentials}
        locale={locale}
        isActionPending={isPending}
        onEnroll={(credential) => {
          setEnrolling(credential);
          setNfcUid(credential.nfcUid ?? '');
        }}
        onRevoke={(credential) => {
          setRevoking(credential);
          setRevokeReason('');
        }}
      />

      {isFormOpen && (
        <ModalComponent
          title={t('Keyrings.CredentialsSection.createTitle')}
          isOpen
          isLarge
          isLoading={isPending}
          onClose={closeForm}
          onCancel={closeForm}
          onConfirm={handleCreate}
          confirmText="create"
          isLoadingText="creating"
          confirmDisabled={!isFormValid}
        >
          <div className="community-form">
            <RadioGroup
              name="credential-target"
              label={t('Keyrings.CredentialsSection.targetLabel')}
              description={t('Keyrings.CredentialsSection.targetHelp')}
              value={form.targetKind}
              onChange={(value) =>
                value === 'keyring'
                  ? setForm({ ...form, targetKind: 'keyring', lockId: '' })
                  : setForm({ ...form, targetKind: 'lock', lockGroupId: '' })
              }
              options={[
                {
                  value: 'keyring',
                  label: t('Keyrings.CredentialsSection.targetKeyring'),
                },
                { value: 'lock', label: t('Keyrings.CredentialsSection.targetLock') },
              ]}
            />

            <div className="form-row form-row--cols-2">
              {form.targetKind === 'keyring' ? (
                <SelectSearch
                  id="credential-keyring"
                  name="lockGroupId"
                  label={t('Keyrings.CredentialsSection.keyringLabel')}
                  noTranslate
                  placeholder={t('Keyrings.CredentialsSection.keyringPlaceholder')}
                  className="select__full"
                  value={form.lockGroupId}
                  onChange={(value) => setForm({ ...form, lockGroupId: value })}
                  options={[
                    { value: '', label: '—' },
                    ...keyrings.map((keyring) => ({
                      value: keyring.id,
                      label: keyring.name,
                    })),
                  ]}
                />
              ) : (
                <SelectSearch
                  id="credential-lock"
                  name="lockId"
                  label={t('Keyrings.CredentialsSection.lockLabel')}
                  noTranslate
                  placeholder={t('Keyrings.CredentialsSection.lockPlaceholder')}
                  className="select__full"
                  value={form.lockId}
                  onChange={(value) => setForm({ ...form, lockId: value })}
                  options={[
                    { value: '', label: '—' },
                    ...locks.map((lock) => ({ value: lock.id, label: lock.name })),
                  ]}
                />
              )}

              <SelectSearch
                id="credential-resident"
                name="residentMembershipId"
                label={t('Keyrings.CredentialsSection.residentLabel')}
                noTranslate
                placeholder={t('Keyrings.CredentialsSection.residentPlaceholder')}
                description={t('Keyrings.CredentialsSection.residentHelp')}
                className="select__full"
                value={form.residentMembershipId}
                onChange={(value) => setForm({ ...form, residentMembershipId: value })}
                options={[
                  {
                    value: '',
                    label: t('Keyrings.CredentialsSection.noResident'),
                  },
                  ...residents.map((resident) => ({
                    value: resident.membershipId,
                    label: `${resident.name}${
                      resident.communityUnitCode ? ` (${resident.communityUnitCode})` : ''
                    }`,
                  })),
                ]}
              />

              <Select
                id="credential-type"
                name="type"
                label={t('Keyrings.CredentialsSection.typeLabel')}
                noTranslate
                placeholder={t('Keyrings.CredentialsSection.typePlaceholder')}
                description={t('Keyrings.CredentialsSection.typeHelp')}
                className="select__full"
                value={form.type}
                onChange={(value) =>
                  setForm({ ...form, type: value as LockCredentialType })
                }
                options={CREDENTIAL_TYPES.map((type) => ({
                  value: type,
                  label: t(`CredentialType.${type}`),
                }))}
              />

              <Input
                id="credential-label"
                name="label"
                label={t('Keyrings.CredentialsSection.labelLabel')}
                noTranslate
                placeholder={t('Keyrings.CredentialsSection.labelPlaceholder')}
                className="input__full"
                value={form.label}
                maxLength={100}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
              />

              {form.type === 'NFC_CARD' && (
                <div className="community-form__field">
                  <Input
                    id="credential-nfc"
                    name="nfcUid"
                    label={t('Keyrings.CredentialsSection.nfcUidLabel')}
                    noTranslate
                    placeholder={t('Keyrings.CredentialsSection.nfcUidPlaceholder')}
                    className="input__full"
                    value={form.nfcUid}
                    maxLength={100}
                    onChange={(event) => setForm({ ...form, nfcUid: event.target.value })}
                  />
                  <span className="community-form__help">
                    {t('Keyrings.CredentialsSection.nfcUidHelp')}
                  </span>
                </div>
              )}

              {form.type === 'PIN' && (
                <div className="community-form__field">
                  <Input
                    id="credential-pin"
                    name="pin"
                    label={t('Keyrings.CredentialsSection.pinLabel')}
                    noTranslate
                    placeholder={t('Keyrings.CredentialsSection.pinPlaceholder')}
                    className="input__full"
                    value={form.pin}
                    maxLength={10}
                    onChange={(event) =>
                      setForm({ ...form, pin: event.target.value.replace(/\D/g, '') })
                    }
                  />
                  <span className="community-form__help">
                    {t('Keyrings.CredentialsSection.pinHelp')}
                  </span>
                </div>
              )}

              <div className="community-form__field">
                <Input
                  id="credential-issued-for"
                  name="issuedForName"
                  label={t('Keyrings.CredentialsSection.issuedForNameLabel')}
                  noTranslate
                  placeholder={t('Keyrings.CredentialsSection.issuedForNamePlaceholder')}
                  className="input__full"
                  value={form.issuedForName}
                  maxLength={150}
                  onChange={(event) => setForm({ ...form, issuedForName: event.target.value })}
                />
                <span className="community-form__help">
                  {t('Keyrings.CredentialsSection.issuedForNameHelp')}
                </span>
              </div>

              <div className="community-form__field">
                <DatePicker
                  id="credential-valid-from"
                  name="validFrom"
                  label={t('Keyrings.CredentialsSection.validFromLabel')}
                  value={form.validFrom}
                  onChange={(date) => setForm({ ...form, validFrom: date })}
                  maxDate={form.validUntil ?? undefined}
                  clearable
                  className="date-picker__full"
                />
                <span className="community-form__help">
                  {t('Keyrings.CredentialsSection.validFromHelp')}
                </span>
              </div>

              <div className="community-form__field">
                <DatePicker
                  id="credential-valid-until"
                  name="validUntil"
                  label={t('Keyrings.CredentialsSection.validUntilLabel')}
                  value={form.validUntil}
                  onChange={(date) => setForm({ ...form, validUntil: date })}
                  minDate={form.validFrom ?? undefined}
                  clearable
                  className="date-picker__full"
                />
                <span className="community-form__help">
                  {t('Keyrings.CredentialsSection.validUntilHelp')}
                </span>
              </div>
            </div>

            <Toggle
              name="canBypassSchedule"
              label={t('Keyrings.CredentialsSection.bypassLabel')}
              description={t('Keyrings.CredentialsSection.bypassHelp')}
              checked={form.canBypassSchedule}
              onChange={(checked) => setForm({ ...form, canBypassSchedule: checked })}
            />

            {form.canBypassSchedule && (
              <div className="community-form__field">
                <Input
                  id="credential-bypass-reason"
                  name="bypassReason"
                  label={t('Keyrings.CredentialsSection.bypassReasonLabel')}
                  noTranslate
                  placeholder={t('Keyrings.CredentialsSection.bypassReasonPlaceholder')}
                  className="input__full"
                  value={form.bypassReason}
                  maxLength={300}
                  onChange={(event) => setForm({ ...form, bypassReason: event.target.value })}
                />
                <span className="community-form__help">
                  {t('Keyrings.CredentialsSection.bypassReasonHelp')}
                </span>
              </div>
            )}
          </div>
        </ModalComponent>
      )}

      {plainPin && (
        <ModalComponent
          title={t('Keyrings.CredentialsSection.pinModalTitle')}
          isOpen
          closeOnOutsideClick={false}
          onClose={() => setPlainPin(null)}
          onConfirm={() => setPlainPin(null)}
          confirmText="done"
          confirmIcon={KeyRoundIcon}
        >
          <p>{t('Keyrings.CredentialsSection.pinModalDescription')}</p>
          <p className="community-card__stat-value">{plainPin}</p>
        </ModalComponent>
      )}

      {revoking && (
        <ModalComponent
          title={t('Keyrings.CredentialsSection.revokeTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setRevoking(null)}
          onCancel={() => setRevoking(null)}
          onConfirm={() =>
            run(
              () => revokeCommunityLockCredential(revoking.id, revokeReason || undefined),
              () => setRevoking(null),
            )
          }
          confirmVariant="danger"
          confirmText="revoke"
          isLoadingText="revoking"
        >
          <div className="community-form">
            <p>{t('Keyrings.CredentialsSection.revokeDescription')}</p>

            <div className="community-form__field">
              <Input
                id="revoke-reason"
                name="revokeReason"
                label={t('Keyrings.CredentialsSection.revokeReasonLabel')}
                noTranslate
                placeholder={t('Keyrings.CredentialsSection.revokeReasonPlaceholder')}
                className="input__full"
                value={revokeReason}
                maxLength={300}
                onChange={(event) => setRevokeReason(event.target.value)}
              />
              <span className="community-form__help">
                {t('Keyrings.CredentialsSection.revokeReasonHelp')}
              </span>
            </div>

            {revoking.syncs.length > 0 && (
              <div className="community-form__field">
                <span className="community-form__label">
                  {t('Keyrings.CredentialsSection.syncTitle')}
                </span>
                <ul>
                  {revoking.syncs.map((sync) => (
                    <li key={sync.lockId}>
                      {sync.lockName} — {t(`SyncStatus.${sync.status}`)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ModalComponent>
      )}

      {enrolling && (
        <ModalComponent
          title={t('Keyrings.CredentialsSection.enrollCardTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setEnrolling(null)}
          onCancel={() => setEnrolling(null)}
          onConfirm={() =>
            run(() => enrollCommunityCard(enrolling.id, nfcUid), () => setEnrolling(null))
          }
          confirmText="enroll"
          isLoadingText="enrolling"
          confirmDisabled={nfcUid.trim().length < 4}
        >
          <div className="community-form">
            <p>{t('Keyrings.CredentialsSection.enrollCardDescription')}</p>

            <Input
              id="enroll-uid"
              name="nfcUid"
              label={t('Keyrings.CredentialsSection.nfcUidLabel')}
              noTranslate
              placeholder={t('Keyrings.CredentialsSection.nfcUidPlaceholder')}
              className="input__full"
              value={nfcUid}
              maxLength={100}
              onChange={(event) => setNfcUid(event.target.value)}
            />
          </div>
        </ModalComponent>
      )}
    </>
  );
}
