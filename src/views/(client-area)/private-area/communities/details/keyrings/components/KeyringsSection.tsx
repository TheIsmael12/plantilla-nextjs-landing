'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusIcon, Trash2Icon } from 'lucide-react';

import {
  createCommunityKeyring,
  deleteCommunityKeyring,
  updateCommunityKeyring,
} from '@/actions/client-portal/community-keyrings-actions';
import { getKeyringMembers } from '@/actions/client-portal/community-lock-credentials-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';
import KeyringsTable from '@/views/(client-area)/private-area/communities/details/keyrings/components/KeyringsTable';
import PeoplePeekModal from '@/views/(client-area)/private-area/components/modals/PeoplePeekModal';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import TagsInput from '@/components/ui/inputs/TagsInput';
import Textarea from '@/components/ui/inputs/Textarea';
import Toggle from '@/components/ui/inputs/Toggle';

import type {
  CommunityLock,
  DayOfWeek,
  LockGroup,
  LockGroupScheduleSlot,
} from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';

import '@/styles/04-components/client-area/community-common.scss';

/** Los días de la semana, en el orden en que se leen. */
const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/**
 * Los cinco métodos del fabricante, con la bandera del formulario que los enciende.
 *
 * Están en el llavero y no en la puerta porque es donde el fabricante los decide: allí una puerta solo dice
 * qué sabe hacer el aparato instalado, y lo que se concede vive en la regla del grupo.
 */
const METHODS = [
  ['ONLINE', 'allowsOnline'],
  ['BLUETOOTH', 'allowsBluetooth'],
  ['MOBILE_NFC', 'allowsMobileNfc'],
  ['PIN', 'allowsPin'],
  ['CARD', 'allowsCard'],
] as const;

interface KeyringFormState {
  name: string;
  description: string;
  isDefault: boolean;
  lockIds: string[];
  /** Cómo se abre con este llavero, desde dónde y a qué horas. */
  allowsOnline: boolean;
  allowsBluetooth: boolean;
  allowsMobileNfc: boolean;
  allowsPin: boolean;
  allowsCard: boolean;
  requiresPresence: boolean;
  tags: string[];
  scheduleSlots: LockGroupScheduleSlot[];
}

/*
 * Sin decir nada, Bluetooth y PIN.
 *
 * Es lo que abre un portal con el móvil delante y con el teclado, que es lo que hay instalado en la inmensa
 * mayoría. Online se deja apagado a propósito: sin pasarela no funciona, y encenderlo por defecto haría que
 * el llavero prometiera una apertura remota que la puerta no puede dar.
 */
const EMPTY_FORM: KeyringFormState = {
  name: '',
  description: '',
  isDefault: false,
  lockIds: [],
  allowsOnline: false,
  allowsBluetooth: true,
  allowsMobileNfc: false,
  allowsPin: true,
  allowsCard: false,
  requiresPresence: false,
  tags: [],
  scheduleSlots: [],
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
      allowsOnline: keyring.allowsOnline ?? false,
      allowsBluetooth: keyring.allowsBluetooth ?? true,
      allowsMobileNfc: keyring.allowsMobileNfc ?? false,
      allowsPin: keyring.allowsPin ?? true,
      allowsCard: keyring.allowsCard ?? false,
      requiresPresence: keyring.requiresPresence ?? false,
      tags: keyring.tags ?? [],
      scheduleSlots: keyring.scheduleSlots ?? [],
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

  /** Añade un tramo nuevo, en lunes de mañana, que es lo que casi siempre se quiere. */
  const addSlot = () => {
    setForm((previous) => ({
      ...previous,
      scheduleSlots: [
        ...previous.scheduleSlots,
        { dayOfWeek: 'MON' as DayOfWeek, startTime: '08:00', endTime: '22:00' },
      ],
    }));
  };

  const updateSlot = (index: number, patch: Partial<LockGroupScheduleSlot>) => {
    setForm((previous) => ({
      ...previous,
      scheduleSlots: previous.scheduleSlots.map((slot, i) =>
        i === index ? { ...slot, ...patch } : slot,
      ),
    }));
  };

  /*
   * Un llavero tiene que abrirse de alguna manera.
   *
   * Con los cinco apagados, la regla que baja a la cerradura dice «este grupo no abre nada», y guardarlo
   * sería un botón que no hace nada sin decir por qué.
   */
  const hasAnyMethod =
    form.allowsOnline ||
    form.allowsBluetooth ||
    form.allowsMobileNfc ||
    form.allowsPin ||
    form.allowsCard;

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      isDefault: form.isDefault,
      lockIds: form.lockIds,
      allowsOnline: form.allowsOnline,
      allowsBluetooth: form.allowsBluetooth,
      allowsMobileNfc: form.allowsMobileNfc,
      allowsPin: form.allowsPin,
      allowsCard: form.allowsCard,
      requiresPresence: form.requiresPresence,
      tags: form.tags,
      scheduleSlots: form.scheduleSlots,
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
             * Quién está dentro del llavero, que es quien puede entrar hoy.
             *
             * Se preguntan los miembros y no las llaves: una llave ya no dice a qué llavero pertenece —es el
             * medio con el que alguien se identifica y le vale para todos los suyos—, así que listarlas daba
             * al mismo vecino dos veces, una por su app y otra por su PIN.
             */
            const response = await getKeyringMembers(serviceId, peekedKeyring.id);

            return {
              status: response.status,
              message: response.message,
              data: response.data?.map((member) => ({
                id: member.id,
                name: member.residentName || member.email,
                detail: member.communityUnitCode ?? '',
                badgeText: member.validUntil
                  ? t('Keyrings.holderUntil', { date: member.validUntil })
                  : t('Keyrings.holderNoLimit'),
                badgeVariant: member.validUntil ? ('warning' as const) : ('success' as const),
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
          confirmDisabled={!form.name.trim() || form.lockIds.length === 0 || !hasAnyMethod}
          footerError={
            form.lockIds.length === 0
              ? t('Keyrings.locksRequired')
              : !hasAnyMethod
                ? t('Keyrings.methodsRequired')
                : undefined
          }
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

            {/* Las etiquetas son de quien administra el edificio: se escriben, no se eligen de una lista. */}
            <TagsInput
              id="keyring-tags"
              label={t('Keyrings.tagsLabel')}
              noTranslate
              placeholder={t('Keyrings.tagsPlaceholder')}
              value={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
              max={10}
              className="input__full"
            />

            {/*
              Cómo se abre con este llavero, decidido aquí y una sola vez.

              Son los cinco métodos del fabricante y viven aquí y no en la puerta: allí la puerta solo dice
              qué sabe hacer el aparato instalado. Antes esto preguntaba «qué llaves entrega», que es otra
              cosa —eso son credenciales, y son de la persona— y por eso cambiarlo no llegaba a la cerradura.
            */}
            <div className="community-form__field">
              <span className="community-form__label">{t('Keyrings.accessMethodsLabel')}</span>
              <span className="community-form__help">{t('Keyrings.accessMethodsHelp')}</span>

              <div className="community-form__check-list">
                {METHODS.map(([method, field]) => (
                  <Toggle
                    key={field}
                    name={field}
                    label={t(`AccessMethod.${method}`)}
                    checked={form[field]}
                    onChange={(checked) => setForm({ ...form, [field]: checked })}
                  />
                ))}
              </div>
            </div>

            <Select
              name="requiresPresence"
              label={t('Keyrings.presenceLabel')}
              noTranslate
              placeholder={t('Keyrings.presenceLabel')}
              description={t('Keyrings.presenceHelp')}
              options={[
                { value: 'ANYWHERE', label: t('Keyrings.presenceAnywhere') },
                { value: 'GEO', label: t('Keyrings.presenceGeo') },
              ]}
              value={form.requiresPresence ? 'GEO' : 'ANYWHERE'}
              onChange={(value) => setForm({ ...form, requiresPresence: value === 'GEO' })}
              className="select__full"
            />

            {/*
              El horario del llavero. **Vacío significa que abre siempre**, no que no abra nunca: el defecto
              no puede ser «cerrado», porque una tabla vacía dejaría a los vecinos en la calle.
            */}
            <div className="community-form__field">
              <span className="community-form__label">{t('Keyrings.scheduleLabel')}</span>
              <span className="community-form__help">
                {form.scheduleSlots.length === 0
                  ? t('Keyrings.scheduleEmptyMeansAlways')
                  : t('Keyrings.scheduleHelp')}
              </span>

              {form.scheduleSlots.map((slot, index) => (
                <div key={`slot-${index}`} className="community-form__slot">
                  <Select
                    name={`slot-day-${index}`}
                    label={t('Keyrings.slotDay')}
                    noTranslate
                    placeholder={t('Keyrings.slotDay')}
                    options={DAYS.map((day) => ({ value: day, label: t(`DayOfWeek.${day}`) }))}
                    value={slot.dayOfWeek}
                    onChange={(value) => updateSlot(index, { dayOfWeek: value as DayOfWeek })}
                    className="select__full"
                  />

                  {/* Dos campos y no un componente de rango: aquí no hay uno, y la hora nativa ya valida. */}
                  <Input
                    id={`slot-start-${index}`}
                    name={`slot-start-${index}`}
                    type="time"
                    label={t('Keyrings.slotStart')}
                    noTranslate
                    value={slot.startTime}
                    onChange={(event) => updateSlot(index, { startTime: event.target.value })}
                  />

                  <Input
                    id={`slot-end-${index}`}
                    name={`slot-end-${index}`}
                    type="time"
                    label={t('Keyrings.slotEnd')}
                    noTranslate
                    value={slot.endTime}
                    onChange={(event) => updateSlot(index, { endTime: event.target.value })}
                  />

                  <Button
                    variant="outline"
                    ariaLabel="delete"
                    onClick={() =>
                      setForm({
                        ...form,
                        scheduleSlots: form.scheduleSlots.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2Icon />
                  </Button>
                </div>
              ))}

              <Button variant="outline" title="add" onClick={addSlot}>
                <PlusIcon />
              </Button>
            </div>

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
