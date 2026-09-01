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

import Alert from '@/components/ui/alerts/Alert';
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
  CommunitySite,
  LockGroup,
  LockPermissionPresence,
  LockPermissionTarget,
  LockSchedule,
} from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';

import '@/styles/04-components/client-area/community-common.scss';

/**
 * Los cinco métodos del fabricante, con la bandera de la regla que los enciende.
 *
 * Se guardan juntos porque siempre se pintan juntos: son las cinco casillas de «cómo se abre», y tenerlos en
 * una lista evita escribir cinco veces el mismo interruptor.
 */
const METHODS = [
  ['ONLINE', 'allowsOnline'],
  ['BLUETOOTH', 'allowsBluetooth'],
  ['MOBILE_NFC', 'allowsMobileNfc'],
  ['PIN', 'allowsPin'],
  ['CARD', 'allowsCard'],
] as const;

/** A qué puede apuntar una regla, de lo más amplio a lo más concreto. */
const TARGETS: LockPermissionTarget[] = ['EVERYTHING', 'SITE', 'LOCK'];

/** Desde dónde se puede abrir en remoto. */
const PRESENCES: LockPermissionPresence[] = ['NONE', 'GPS'];

/**
 * Una regla dentro del formulario.
 *
 * Es lo mismo que manda la API pero con todos los campos presentes, para que los controles no salten entre
 * controlado y no controlado según lo que se haya tocado.
 * @interface RuleFormValue
 */
interface RuleFormValue {
  target: LockPermissionTarget;
  siteId: string;
  lockId: string;
  actionId: string;
  scheduleId: string;
  presence: LockPermissionPresence;
  allowsOnline: boolean;
  allowsBluetooth: boolean;
  allowsMobileNfc: boolean;
  allowsPin: boolean;
  allowsCard: boolean;
}

/** Una regla nueva: una puerta, con el móvil y el PIN, que es lo que casi siempre se quiere. */
const EMPTY_RULE: RuleFormValue = {
  target: 'LOCK',
  siteId: '',
  lockId: '',
  actionId: '',
  scheduleId: '',
  presence: 'NONE',
  allowsOnline: false,
  allowsBluetooth: true,
  allowsMobileNfc: false,
  allowsPin: true,
  allowsCard: false,
};

interface KeyringFormState {
  name: string;
  description: string;
  isDefault: boolean;
  tags: string[];
  /** Qué abre, cuándo y cómo. El acceso se concede si al menos una regla encaja. */
  permissionRules: RuleFormValue[];
}

const EMPTY_FORM: KeyringFormState = {
  name: '',
  description: '',
  isDefault: false,
  tags: [],
  permissionRules: [EMPTY_RULE],
};

interface KeyringsManagerProps {
  serviceId: string;
  keyrings: PaginatedResult<LockGroup>;
  locks: CommunityLock[];
  sites: CommunitySite[];
  schedules: LockSchedule[];
}

/**
 * Alta, edición y baja de llaveros.
 *
 * **Un llavero es un conjunto de reglas de permiso**, que es lo que concede acceso en el fabricante. Cada
 * regla dice qué abre —toda la organización, toda una sede, una puerta, o una sola acción de esa puerta—,
 * cuándo y con qué métodos.
 *
 * Antes esto era «una lista de puertas y unos métodos comunes», y eso no sabía decir las dos cosas que en un
 * edificio hacen falta: *toda la sede*, para que el llavero del administrador incluya la puerta que se monte
 * mañana, y *una acción concreta*, para dejar subir el garaje a quien no puede bajarlo.
 *
 * Al editar, las reglas **sustituyen la lista entera**: es lo único que hace que quitar una llegue de verdad
 * a la cerradura, porque allí los permisos de un grupo se reescriben de una pieza.
 * @param {KeyringsManagerProps} props - Comunidad, llaveros, puertas, sedes y horarios
 * @returns {JSX.Element} El listado de llaveros con sus acciones
 */
export default function KeyringsSection({
  serviceId,
  keyrings,
  locks,
  sites,
  schedules,
}: KeyringsManagerProps) {
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
      tags: keyring.tags ?? [],
      permissionRules: keyring.permissionRules?.length
        ? keyring.permissionRules.map((rule) => ({
            target: rule.target,
            siteId: rule.siteId ?? '',
            lockId: rule.lockId ?? '',
            actionId: rule.actionId ?? '',
            scheduleId: rule.scheduleId ?? '',
            presence: rule.presence,
            allowsOnline: rule.allowsOnline,
            allowsBluetooth: rule.allowsBluetooth,
            allowsMobileNfc: rule.allowsMobileNfc,
            allowsPin: rule.allowsPin,
            allowsCard: rule.allowsCard,
          }))
        : [EMPTY_RULE],
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const updateRule = (index: number, patch: Partial<RuleFormValue>) => {
    setForm((previous) => ({
      ...previous,
      permissionRules: previous.permissionRules.map((rule, i) =>
        i === index ? { ...rule, ...patch } : rule,
      ),
    }));
  };

  /*
   * Cada regla tiene que apuntar a algo y abrirse de alguna manera.
   *
   * Sin destino la API la rechaza; sin ningún método, la regla baja a la cerradura diciendo «este grupo no
   * abre esto de ninguna manera», que es una forma cara de no escribirla.
   */
  const rulesAreValid = form.permissionRules.every((rule) => {
    const hasTarget =
      rule.target === 'EVERYTHING' ||
      (rule.target === 'SITE' && Boolean(rule.siteId)) ||
      (rule.target === 'LOCK' && Boolean(rule.lockId));

    const hasMethod =
      rule.allowsOnline ||
      rule.allowsBluetooth ||
      rule.allowsMobileNfc ||
      rule.allowsPin ||
      rule.allowsCard;

    return hasTarget && hasMethod;
  });

  const handleSubmit = () => {
    const payload = {
      name: form.name,
      description: form.description || undefined,
      isDefault: form.isDefault,
      tags: form.tags,
      permissionRules: form.permissionRules.map((rule) => ({
        target: rule.target,
        siteId: rule.target === 'SITE' ? rule.siteId : undefined,
        lockId: rule.target === 'LOCK' ? rule.lockId : undefined,
        // Una acción concreta solo tiene sentido sobre una puerta concreta.
        actionId: rule.target === 'LOCK' && rule.actionId ? rule.actionId : undefined,
        scheduleId: rule.scheduleId || undefined,
        presence: rule.presence,
        allowsOnline: rule.allowsOnline,
        allowsBluetooth: rule.allowsBluetooth,
        allowsMobileNfc: rule.allowsMobileNfc,
        allowsPin: rule.allowsPin,
        allowsCard: rule.allowsCard,
      })),
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
          confirmDisabled={!form.name.trim() || !rulesAreValid}
          footerError={rulesAreValid ? undefined : t('Keyrings.rulesInvalid')}
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

            <Toggle
              name="isDefault"
              label={t('Keyrings.isDefaultLabel')}
              description={t('Keyrings.isDefaultHelp')}
              checked={form.isDefault}
              onChange={(checked) => setForm({ ...form, isDefault: checked })}
            />

            <div className="community-form__field">
              <span className="community-form__label">{t('Keyrings.rulesLabel')}</span>
              <span className="community-form__help">{t('Keyrings.rulesHelp')}</span>

              {form.permissionRules.map((rule, index) => {
                const lock = locks.find((item) => item.id === rule.lockId);

                return (
                  <div key={`rule-${index}`} className="permission-rule">
                    <div className="permission-rule__head">
                      <span className="permission-rule__index">
                        {t('Keyrings.ruleNumber', { number: index + 1 })}
                      </span>

                      {/* La última no se puede quitar: un llavero sin reglas no abre nada. */}
                      {form.permissionRules.length > 1 && (
                        <Button
                          variant="outline"
                          ariaLabel="delete"
                          onClick={() =>
                            setForm({
                              ...form,
                              permissionRules: form.permissionRules.filter((_, i) => i !== index),
                            })
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      )}
                    </div>

                    <Select
                      name={`rule-target-${index}`}
                      label={t('Keyrings.targetLabel')}
                      noTranslate
                      placeholder={t('Keyrings.targetLabel')}
                      className="select__full"
                      options={TARGETS.map((value) => ({
                        value,
                        label: t(`Keyrings.Target.${value}`),
                      }))}
                      value={rule.target}
                      onChange={(value) =>
                        updateRule(index, {
                          target: value as LockPermissionTarget,
                          // Al cambiar de destino, lo elegido antes deja de tener sentido.
                          siteId: '',
                          lockId: '',
                          actionId: '',
                        })
                      }
                    />

                    {rule.target === 'SITE' && (
                      <Select
                        name={`rule-site-${index}`}
                        label={t('Keyrings.siteLabel')}
                        noTranslate
                        placeholder={t('Keyrings.siteLabel')}
                        className="select__full"
                        options={[
                          { value: '', label: '—' },
                          ...sites.map((site) => ({ value: site.id, label: site.name })),
                        ]}
                        value={rule.siteId}
                        onChange={(value) => updateRule(index, { siteId: value })}
                      />
                    )}

                    {rule.target === 'LOCK' && (
                      <Select
                        name={`rule-lock-${index}`}
                        label={t('Keyrings.lockLabel')}
                        noTranslate
                        placeholder={t('Keyrings.lockLabel')}
                        className="select__full"
                        options={[
                          { value: '', label: '—' },
                          ...locks.map((item) => ({ value: item.id, label: item.name })),
                        ]}
                        value={rule.lockId}
                        onChange={(value) => updateRule(index, { lockId: value, actionId: '' })}
                      />
                    )}

                    {/*
                      La acción, solo cuando la puerta sabe hacer más de una.
                      Con una sola no hay nada que elegir, y un desplegable de un elemento invita a pensar
                      que hay una decisión que tomar donde no la hay.
                    */}
                    {rule.target === 'LOCK' && (lock?.actions?.length ?? 0) > 1 && (
                      <Select
                        name={`rule-action-${index}`}
                        label={t('Keyrings.actionLabel')}
                        noTranslate
                        placeholder={t('Keyrings.actionLabel')}
                        className="select__full"
                        options={[
                          { value: '', label: t('Keyrings.allActions') },
                          ...(lock?.actions ?? []).map((action) => ({
                            value: action.id,
                            label: action.name,
                          })),
                        ]}
                        value={rule.actionId}
                        onChange={(value) => updateRule(index, { actionId: value })}
                      />
                    )}

                    <div className="community-form__field">
                      <span className="community-form__label">{t('Keyrings.methodsLabel')}</span>

                      {/*
                        Lo que la puerta no sabe hacer sale **bloqueado**, no marcable.
                        Antes se dejaba marcar y aparecía debajo un aviso —«esta puerta no sabe abrir con:
                        Online»— que había que leer para enterarse de que lo que acababas de activar no iba a
                        funcionar. Un interruptor que no se puede subir dice lo mismo sin que nadie tenga que
                        leer nada, y el motivo va en su propia línea.
                      */}
                      <div className="community-form__check-list">
                        {METHODS.map(([method, field]) => {
                          const supported = supports(lock, method);

                          return (
                            <Toggle
                              key={field}
                              name={`rule-${field}-${index}`}
                              label={t(`AccessMethod.${method}`)}
                              description={
                                supported ? undefined : t('Keyrings.methodNotSupported')
                              }
                              checked={rule[field] && supported}
                              disabled={!supported}
                              onChange={(checked) => updateRule(index, { [field]: checked })}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <Select
                      name={`rule-schedule-${index}`}
                      label={t('Keyrings.scheduleLabel')}
                      noTranslate
                      placeholder={t('Keyrings.scheduleLabel')}
                      description={t('Keyrings.scheduleHelp')}
                      className="select__full"
                      options={[
                        { value: '', label: t('Keyrings.alwaysOpen') },
                        ...schedules.map((schedule) => ({
                          value: schedule.id,
                          label: schedule.name,
                        })),
                      ]}
                      value={rule.scheduleId}
                      onChange={(value) => updateRule(index, { scheduleId: value })}
                    />

                    <Select
                      name={`rule-presence-${index}`}
                      label={t('Keyrings.presenceLabel')}
                      noTranslate
                      placeholder={t('Keyrings.presenceLabel')}
                      description={t('Keyrings.presenceHelp')}
                      className="select__full"
                      options={PRESENCES.map((value) => ({
                        value,
                        label: t(`Keyrings.Presence.${value}`),
                      }))}
                      value={rule.presence}
                      onChange={(value) =>
                        updateRule(index, { presence: value as LockPermissionPresence })
                      }
                      /*
                       * Sin apertura en remoto esto no gobierna nada: el PIN, la tarjeta y el Bluetooth
                       * exigen estar delante por su propia naturaleza y la presencia no los toca.
                       */
                      disabled={!rule.allowsOnline}
                    />
                  </div>
                );
              })}

              <Button
                variant="outline"
                title="add"
                onClick={() =>
                  setForm({ ...form, permissionRules: [...form.permissionRules, EMPTY_RULE] })
                }
              >
                <PlusIcon />
              </Button>
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
            run(
              () => deleteCommunityKeyring(serviceId, deleting.id),
              () => setDeleting(null),
            )
          }
          confirmVariant="danger"
          confirmText="delete"
          isLoadingText="deleting"
        >
          <p>{t('Keyrings.deleteDescription')}</p>

          {deleting.memberCount > 0 && (
            <Alert
              type="warning"
              message={t('Keyrings.deleteBlocked', { count: deleting.memberCount })}
            />
          )}
        </ModalComponent>
      )}
    </>
  );
}

/**
 * Si una puerta sabe abrirse de una forma concreta.
 *
 * Lo que decide no es la puerta sino **el aparato del que cuelga**: el lector y el teclado son suyos, y seis
 * puertas pueden colgar del mismo controlador. Una regla que apunta a una ubicación —o a toda la
 * organización— no puede saberlo, porque ahí caben puertas distintas: en ese caso se deja marcar todo.
 * @param {CommunityLock | undefined} lock - La puerta, si la regla apunta a una concreta
 * @param {(typeof METHODS)[number][0]} method - El método
 * @returns {boolean} Si esa puerta lo admite
 */
function supports(lock: CommunityLock | undefined, method: (typeof METHODS)[number][0]): boolean {
  if (!lock) return true;

  const capabilities = lock.capabilities;

  // Bluetooth lo tiene todo lo que se instala hoy, y el fabricante no lo reporta como capacidad aparte.
  if (method === 'BLUETOOTH') return true;
  if (method === 'PIN') return Boolean(capabilities?.pin);
  if (method === 'CARD' || method === 'MOBILE_NFC') return Boolean(capabilities?.nfc);

  return Boolean(
    capabilities?.internet ||
      capabilities?.wifi ||
      capabilities?.ethernet ||
      capabilities?.cellular,
  );
}
