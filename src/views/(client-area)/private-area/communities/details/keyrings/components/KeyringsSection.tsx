'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusIcon } from 'lucide-react';

import {
  createCommunityKeyring,
  deleteCommunityKeyring,
  updateCommunityKeyring,
} from '@/actions/client-portal/community-keyrings-actions';
import { getCommunityLockCredentials } from '@/actions/client-portal/community-lock-credentials-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import KeyringsTable from '@/views/(client-area)/private-area/communities/details/keyrings/components/KeyringsTable';
import PeoplePeekModal from '@/views/(client-area)/private-area/components/modals/PeoplePeekModal';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Textarea from '@/components/ui/inputs/Textarea';
import Toggle from '@/components/ui/inputs/Toggle';

import type { CommunityLock, LockGroup } from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';

import '@/styles/04-components/client-area/community-common.scss';

interface KeyringFormState {
  name: string;
  description: string;
  isDefault: boolean;
  lockIds: string[];
}

const EMPTY_FORM: KeyringFormState = {
  name: '',
  description: '',
  isDefault: false,
  lockIds: [],
};

interface KeyringsManagerProps {
  serviceId: string;
  keyrings: PaginatedResult<LockGroup>;
  locks: CommunityLock[];
}

/**
 * Alta, edición y baja de llaveros. Al editar, `lockIds` sustituye la lista
 * completa de puertas del llavero (no la amplía), así que el formulario parte
 * siempre de la selección actual.
 * @param {KeyringsManagerProps} props - Comunidad activa, página actual de llaveros y puertas disponibles
 * @returns {JSX.Element} El listado de llaveros con sus acciones
 */
export default function KeyringsSection({ serviceId, keyrings, locks }: KeyringsManagerProps) {
  const t = useTranslations('Views.ClientArea.Communities');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<LockGroup | null>(null);
  const [deleting, setDeleting] = useState<LockGroup | null>(null);
  const [form, setForm] = useState<KeyringFormState>(EMPTY_FORM);

  /** Llavero cuya lista de titulares se está mirando (el ojo de la tabla). */
  const [peekedKeyring, setPeekedKeyring] = useState<LockGroup | null>(null);

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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEdit = (keyring: LockGroup) => {
    setEditing(keyring);
    setForm({
      name: keyring.name,
      description: keyring.description ?? '',
      isDefault: keyring.isDefault,
      lockIds: keyring.locks.map((lock) => lock.id),
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const toggleLock = (lockId: string) => {
    setForm((previous) => ({
      ...previous,
      lockIds: previous.lockIds.includes(lockId)
        ? previous.lockIds.filter((id) => id !== lockId)
        : [...previous.lockIds, lockId],
    }));
  };

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      isDefault: form.isDefault,
      lockIds: form.lockIds,
    };

    run(
      () =>
        editing
          ? updateCommunityKeyring(serviceId, editing.id, payload)
          : createCommunityKeyring(serviceId, payload),
      closeForm,
    );
  };

  return (
    <>
      <div className="community-toolbar">
        <div />
        <div className="community-toolbar__actions">
          <Button title="create" variant="primary" onClick={openCreate}>
            <PlusIcon />
          </Button>
        </div>
      </div>

      <KeyringsTable
        data={keyrings}
        isActionPending={isPending}
        onEdit={openEdit}
        onDelete={setDeleting}
        onViewHolders={setPeekedKeyring}
      />

      {/* `key` con el id: el modal carga al montarse, así que mirar otro llavero necesita otra identidad. */}
      {peekedKeyring && (
        <PeoplePeekModal
          key={peekedKeyring.id}
          title={t('Keyrings.holdersTitle')}
          subtitle={peekedKeyring.name}
          emptyMessage={t('Keyrings.holdersEmpty')}
          onClose={() => setPeekedKeyring(null)}
          load={async () => {
            /*
             * Solo las llaves vivas (`onlyLive`).
             *
             * La pregunta es «quién puede entrar hoy», no «quién ha tenido llave alguna vez»: incluir las
             * revocadas y caducadas convertiría la respuesta en un historial, y para decidir si alguien
             * sobra en el garaje eso es ruido.
             */
            const response = await getCommunityLockCredentials(serviceId, {
              lockGroupId: peekedKeyring.id,
              onlyLive: true,
              limit: 100,
            });

            return {
              status: response.status,
              message: response.message,
              data: response.data?.items.map((credential) => ({
                id: credential.id,
                // Una credencial puede ser de un vecino o de un tercero (la empresa de limpieza).
                name: credential.residentName ?? credential.issuedForName ?? t('Keyrings.thirdParty'),
                detail: [credential.residentUnitCode, t(`CredentialType.${credential.type}`)]
                  .filter(Boolean)
                  .join(' · '),
                badgeText: t(`CredentialStatus.${credential.status}`),
                badgeVariant: credential.status === 'ACTIVE' ? ('success' as const) : ('warning' as const),
              })),
            };
          }}
        />
      )}

      {isFormOpen && (
        <ModalComponent
          title={editing ? t('Keyrings.editTitle') : t('Keyrings.createTitle')}
          isOpen
          isLoading={isPending}
          onClose={closeForm}
          onCancel={closeForm}
          onConfirm={handleSubmit}
          confirmText="save"
          isLoadingText="saving"
          confirmDisabled={!form.name.trim() || form.lockIds.length === 0}
          footerError={form.lockIds.length === 0 ? t('Keyrings.locksRequired') : undefined}
        >
          <div className="community-form">
            <Input
              id="keyring-name"
              name="name"
              label={t('Keyrings.nameLabel')}
              noTranslate
              placeholder={t('Keyrings.namePlaceholder')}
              className="input__full"
              value={form.name}
              maxLength={100}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />

            <Textarea
              id="keyring-description"
              name="description"
              label={t('Keyrings.descriptionLabel')}
              noTranslate
              placeholder={t('Keyrings.descriptionPlaceholder')}
              value={form.description}
              maxLength={300}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />

            <Toggle
              name="isDefault"
              label={t('Keyrings.isDefaultLabel')}
              description={t('Keyrings.isDefaultHelp')}
              checked={form.isDefault}
              onChange={(checked) => setForm({ ...form, isDefault: checked })}
            />

            <div className="community-form__field">
              <span className="community-form__label">{t('Keyrings.locksLabel')}</span>
              {editing && (
                <span className="community-form__help">{t('Keyrings.locksHelp')}</span>
              )}

              {locks.length > 0 ? (
                <div className="community-form__check-list">
                  {locks.map((lock) => (
                    <Toggle
                      key={lock.id}
                      name={`lock-${lock.id}`}
                      label={lock.name}
                      checked={form.lockIds.includes(lock.id)}
                      onChange={() => toggleLock(lock.id)}
                    />
                  ))}
                </div>
              ) : (
                <span className="community-form__help">{t('Keyrings.locksEmpty')}</span>
              )}
            </div>
          </div>
        </ModalComponent>
      )}

      {deleting && (
        <ModalComponent
          title={t('Keyrings.deleteTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setDeleting(null)}
          onCancel={() => setDeleting(null)}
          onConfirm={() =>
            run(() => deleteCommunityKeyring(serviceId, deleting.id), () => setDeleting(null))
          }
          confirmVariant="danger"
          confirmText="delete"
          isLoadingText="deleting"
        >
          <p>{t('Keyrings.deleteDescription')}</p>
        </ModalComponent>
      )}
    </>
  );
}
