'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { DoorClosedIcon, KeyRoundIcon, PlusIcon } from 'lucide-react';

import {
  createCommunityLockCredential,
  createCommunityLockCredentialsBatch,
  enrollCommunityCard,
  getCommunityLockCredentials,
  revokeCommunityLockCredential,
} from '@/actions/client-portal/community-lock-credentials-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import CredentialsTable from '@/views/(client-area)/private-area/communities/details/keyrings/components/CredentialsTable';
import DatePicker from '@/components/ui/inputs/DatePicker';
import Input from '@/components/ui/inputs/Input';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import RadioGroup from '@/components/ui/inputs/RadioGroup';
import ResidentKeyPicker from '@/views/(client-area)/private-area/communities/details/keyrings/components/ResidentKeyPicker';
import Select from '@/components/ui/inputs/Select';
import SelectSearch from '@/components/ui/inputs/SelectSearch';
import Toggle from '@/components/ui/inputs/Toggle';

import type {
  CommunityLock,
  LockCredential,
  LockCredentialBatchResult,
  LockCredentialSyncStatus,
  LockCredentialType,
  LockGroup,
  PortalResident,
} from '@/types/client-portal/community';
import type { FetchResponse, PaginatedResult } from '@/types/responses';
import type { BadgeVariant } from '@/types/ui/buttons/badge';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-key-picker.scss';

/*
 * Color de cada estado de sincronización.
 *
 * `PENDING` y `PENDING_REVOKE` son avisos y no errores: la orden está dada y la cerradura la aplicará cuando
 * conecte. `FAILED` sí es rojo, porque significa que esa puerta sigue abriéndose con la credencial.
 */
const SYNC_VARIANTS: Record<LockCredentialSyncStatus, BadgeVariant> = {
  PENDING: 'warning',
  PENDING_REVOKE: 'warning',
  SYNCED: 'success',
  REVOKED: 'neutral',
  FAILED: 'danger',
};

/**
 * Los tipos que se pueden repartir a varios vecinos de una vez.
 *
 * La tarjeta NFC no está: cada tarjeta física tiene su UID y la API lo exige al emitir la credencial, así que
 * un reparto en lote solo podría inventárselos. Las tarjetas se dan de una en una, y para eso está el enrolado.
 */
const BATCH_TYPES: LockCredentialType[] = ['APP', 'NFC_PHONE', 'PIN'];

/** Todos los tipos, para una credencial de un tercero, que siempre es una sola. */
const ALL_TYPES: LockCredentialType[] = ['NFC_CARD', 'NFC_PHONE', 'PIN', 'APP'];

/** Tope de la etiqueta en la API. Se recorta aquí para que la vista previa no prometa lo que no cabe. */
const LABEL_MAX = 100;

/**
 * Cuántas credenciales se piden para saber quién tiene ya llave del destino elegido.
 *
 * Cien y no más porque **es el tope que admite la API** (`@Max(100)` en la paginación). Pedir 200 no traía 200:
 * la validación respondía 400, la respuesta llegaba sin datos y el selector daba por hecho que **nadie** tenía
 * llave — es decir, el fallo se veía como «no marca a los que ya la tienen», no como un error.
 *
 * Es suficiente para una comunidad: son las llaves vivas de un solo llavero o de una sola puerta. Si alguna
 * llegara a superarlo, se verían los cien primeros y los demás saldrían como sin llave; el día que eso sea
 * real, la solución es recorrer las páginas, no subir el número.
 */
const EXISTING_LIMIT = 100;

/** Conjunto vacío estable: uno nuevo en cada render volvería a pintar el selector sin que cambie nada. */
const EMPTY_HOLDERS: Set<string> = new Set();

interface CredentialFormState {
  targetKind: 'keyring' | 'lock';
  lockGroupId: string;
  lockId: string;
  /** A quién va: a vecinos de la comunidad, o a un tercero que no tiene cuenta en la app. */
  holderKind: 'residents' | 'thirdParty';
  residentIds: string[];
  /** Lo que va delante del nombre de cada vecino en la etiqueta de su credencial. */
  labelPrefix: string;
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
  holderKind: 'residents',
  residentIds: [],
  labelPrefix: '',
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
 *
 * El reparto de llaves está pensado para **varios vecinos a la vez**, que es como se hace de verdad: se elige
 * el llavero del portal una vez, se marcan los vecinos que lo necesitan y se emite. Antes había que abrir este
 * formulario una vez por persona e inventarse una etiqueta cada vez, y no había forma de saber a quién le
 * faltaba la llave sin repasar el listado a mano.
 *
 * Tres detalles del dominio marcan lo que se ve:
 *
 * - **El PIN en claro solo llega en la respuesta de creación** y no es recuperable, de ahí el modal de
 *   «apúntalo ahora» — que en un reparto enseña la lista entera de PIN, uno por vecino.
 * - **Revocar no es instantáneo** en cerraduras sin conexión permanente, así que el estado real se lee de
 *   `syncs`/`pendingLocks` en vez de darlo por hecho.
 * - **Una tarjeta física tiene su UID**, así que las tarjetas se emiten de una en una: en lote no habría UID
 *   que poner.
 * @param {CredentialsManagerProps} props - Comunidad activa y catálogos para los selectores
 * @returns {JSX.Element} El listado de credenciales con sus acciones
 */
export default function CredentialsSection({
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
  const [batchResult, setBatchResult] = useState<LockCredentialBatchResult | null>(null);

  /**
   * Quién tiene ya una llave viva del destino elegido, para no dársela dos veces.
   *
   * Se guarda **junto al destino al que pertenece** en vez de en un conjunto suelto: así, al cambiar de
   * llavero, lo que había deja de valer por sí solo y no hace falta limpiarlo. Con un conjunto suelto había
   * que vaciarlo al cambiar, y entre el cambio y la respuesta de la API se veían un instante los titulares
   * del llavero anterior marcados como «ya tiene» — justo el dato que se viene a consultar aquí.
   */
  const [existing, setExisting] = useState<{ targetId: string; ids: Set<string> } | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const targetId = form.targetKind === 'keyring' ? form.lockGroupId : form.lockId;

  const alreadyHave = existing?.targetId === targetId ? existing.ids : EMPTY_HOLDERS;

  /*
   * Al elegir el destino se pregunta a la API quién tiene ya llave de él.
   *
   * Se pregunta al servidor y no se filtra la página de credenciales que ya está en pantalla: esa está
   * paginada, así que los vecinos de las páginas siguientes saldrían como si no tuvieran llave y se les
   * emitiría una segunda. Es el caso de uso legítimo de un efecto: un dato externo que depende de lo que se ha
   * elegido en el formulario.
   */
  useEffect(() => {
    if (!isFormOpen || !targetId) return;

    let cancelled = false;

    void (async () => {
      setIsLoadingExisting(true);

      const response = await getCommunityLockCredentials(serviceId, {
        ...(form.targetKind === 'keyring' ? { lockGroupId: targetId } : { lockId: targetId }),
        onlyLive: true,
        limit: EXISTING_LIMIT,
      });

      if (cancelled) return;

      setExisting({
        targetId,
        ids: new Set(
          (response.data?.items ?? [])
            .map((credential) => credential.residentMembershipId)
            .filter((id): id is string => Boolean(id)),
        ),
      });
      setIsLoadingExisting(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [isFormOpen, serviceId, targetId, form.targetKind]);

  /**
   * Las puertas que abre el destino elegido, con sus capacidades.
   *
   * Un llavero solo trae `id` y `name` de cada puerta, así que se cruzan con la lista completa de cerraduras
   * de la comunidad, que es la que dice qué admite cada una.
   */
  const targetLocks = useMemo(() => {
    if (form.targetKind === 'lock') return locks.filter((lock) => lock.id === form.lockId);

    const keyring = keyrings.find((candidate) => candidate.id === form.lockGroupId);

    return (keyring?.locks ?? [])
      .map((entry) => locks.find((lock) => lock.id === entry.id))
      .filter((lock): lock is CommunityLock => Boolean(lock));
  }, [form.targetKind, form.lockId, form.lockGroupId, keyrings, locks]);

  /**
   * Qué tipos de llave puede emitir este destino: los que admiten **todas** sus puertas.
   *
   * Sin esto se podía elegir PIN para un llavero con una cerradura sin teclado, marcar a doce vecinos y
   * recibir doce fallos idénticos — el aprendizaje llegaba después de pedir el trabajo, y por triplicado.
   * La regla la impone la API («capability-not-supported»); aquí solo se deja de ofrecer lo que ya se sabe
   * que va a rechazar.
   *
   * Con el destino sin elegir, o si sus puertas no están en la lista, no se prohíbe nada: es mejor que lo
   * rechace la API a que la pantalla esconda una opción por no tener un dato.
   */
  const availableTypes = useMemo(() => {
    const catalog = form.holderKind === 'residents' ? BATCH_TYPES : ALL_TYPES;

    if (targetLocks.length === 0) return catalog;

    return catalog.filter((type) => {
      if (type === 'PIN') return targetLocks.every((lock) => lock.supportsPin);
      if (type === 'NFC_CARD' || type === 'NFC_PHONE') {
        return targetLocks.every((lock) => lock.supportsNfc);
      }

      return targetLocks.every((lock) => lock.supportsApp);
    });
  }, [form.holderKind, targetLocks]);

  const isTypeAvailable = availableTypes.includes(form.type);

  /** El nombre del destino elegido, que hace de prefijo por defecto de las etiquetas. */
  const targetName = useMemo(() => {
    if (form.targetKind === 'keyring') {
      return keyrings.find((keyring) => keyring.id === form.lockGroupId)?.name ?? '';
    }

    return locks.find((lock) => lock.id === form.lockId)?.name ?? '';
  }, [form.targetKind, form.lockGroupId, form.lockId, keyrings, locks]);

  const prefix = form.labelPrefix.trim() || targetName;

  /**
   * Las credenciales que se van a emitir, con su etiqueta ya compuesta.
   *
   * Se calcula aquí y se enseña antes de crear nada: la etiqueta es lo que quedará escrito en el listado de
   * llaves durante años, y es mejor verla que descubrirla después. El nombre del vecino va dentro porque una
   * lista de veinte «Zonas comunes» idénticas no se puede leer.
   */
  const plan = useMemo(
    () =>
      form.residentIds
        .map((membershipId) => residents.find((resident) => resident.membershipId === membershipId))
        .filter((resident): resident is PortalResident => Boolean(resident))
        .map((resident) => ({
          residentMembershipId: resident.membershipId,
          name: resident.name,
          unitCode: resident.communityUnitCode ?? null,
          label: `${prefix ? `${prefix} · ` : ''}${resident.name}`.slice(0, LABEL_MAX),
        })),
    [form.residentIds, residents, prefix],
  );

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

  const target =
    form.targetKind === 'keyring' ? { lockGroupId: form.lockGroupId } : { lockId: form.lockId };

  const validity = {
    validFrom: form.validFrom ? form.validFrom.toISOString() : undefined,
    validUntil: form.validUntil ? form.validUntil.toISOString() : undefined,
    canBypassSchedule: form.canBypassSchedule,
    bypassReason: form.bypassReason || undefined,
  };

  /** Reparte la llave a los vecinos marcados, en una sola llamada. */
  const createForResidents = () => {
    startTransition(async () => {
      const response = await createCommunityLockCredentialsBatch(serviceId, {
        ...target,
        ...validity,
        type: form.type,
        residents: plan.map((entry) => ({
          residentMembershipId: entry.residentMembershipId,
          label: entry.label,
          // El PIN se deja a la API: uno común para veinte vecinos no es un PIN, es una contraseña compartida.
          pin: undefined,
        })),
      });

      notifyResponse(response, t('loadError'));

      if (response.status === HTTPStatus.OK && response.data) {
        closeForm();
        setBatchResult(response.data);
        router.refresh();
      }
    });
  };

  /** Emite una credencial para alguien que no es vecino: el fontanero, la empresa de limpieza. */
  const createForThirdParty = () => {
    startTransition(async () => {
      const response = await createCommunityLockCredential(serviceId, {
        ...target,
        ...validity,
        type: form.type,
        label: form.label,
        nfcUid: form.nfcUid || undefined,
        pin: form.pin || undefined,
        issuedForName: form.issuedForName || undefined,
      });

      notifyResponse(response, t('loadError'));

      if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
        closeForm();
        // El PIN en claro solo viaja en esta respuesta: si no se muestra aquí, se pierde para siempre.
        if (response.data?.plainPin) setPlainPin(response.data.plainPin);
        router.refresh();
      }
    });
  };

  const isResidentsMode = form.holderKind === 'residents';

  const isFormValid =
    Boolean(targetId) &&
    isTypeAvailable &&
    (isResidentsMode ? plan.length > 0 : form.label.trim().length > 0);

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
          onConfirm={isResidentsMode ? createForResidents : createForThirdParty}
          confirmText={isResidentsMode ? 'grantKeys' : 'create'}
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
                { value: 'keyring', label: t('Keyrings.CredentialsSection.targetKeyring') },
                { value: 'lock', label: t('Keyrings.CredentialsSection.targetLock') },
              ]}
            />

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
                  ...keyrings.map((keyring) => ({ value: keyring.id, label: keyring.name })),
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

            {/*
              A quién va, como decisión explícita.

              Antes esto era una convención que había que conocer: dejar el vecino vacío y rellenar «Emitida a
              nombre de» significaba «esto es para un tercero». Preguntarlo evita que una credencial de obra
              acabe sin dueño ni nombre, y de paso decide qué medio formulario se enseña.
            */}
            <RadioGroup
              name="credential-holder"
              label={t('Keyrings.CredentialsSection.holderLabel')}
              description={t('Keyrings.CredentialsSection.holderHelp')}
              value={form.holderKind}
              onChange={(value) =>
                setForm({
                  ...form,
                  holderKind: value === 'residents' ? 'residents' : 'thirdParty',
                  // Cambiar de destinatario limpia lo del otro: no se emite con datos de una decisión anterior.
                  residentIds: [],
                  label: '',
                  issuedForName: '',
                  nfcUid: '',
                  pin: '',
                  type: value === 'residents' && form.type === 'NFC_CARD' ? 'APP' : form.type,
                })
              }
              options={[
                { value: 'residents', label: t('Keyrings.CredentialsSection.holderResidents') },
                { value: 'thirdParty', label: t('Keyrings.CredentialsSection.holderThirdParty') },
              ]}
            />

            {!targetId && (
              <Alert type="info" message={t('Keyrings.CredentialsSection.chooseTargetFirst')} />
            )}

            {/*
              El tipo elegido no lo admiten todas las puertas del destino.

              Se avisa y se bloquea el envío en vez de dejar intentarlo: con doce vecinos marcados, «probar»
              cuesta doce fallos idénticos. El caso típico es un llavero con una cerradura sin teclado, donde
              el PIN no vale para ninguna de sus puertas aunque valga para las otras tres.
            */}
            {targetId && !isTypeAvailable && (
              <Alert
                type="warning"
                message={t('Keyrings.CredentialsSection.typeNotSupported', {
                  type: t(`CredentialType.${form.type}`),
                })}
              />
            )}

            {isResidentsMode && targetId && (
              <>
                <ResidentKeyPicker
                  residents={residents}
                  alreadyHave={alreadyHave}
                  value={form.residentIds}
                  isLoading={isLoadingExisting}
                  disabled={isPending}
                  onChange={(residentIds) => setForm({ ...form, residentIds })}
                />

                <div className="form-row form-row--cols-2">
                  <Select
                    id="credential-type"
                    name="type"
                    label={t('Keyrings.CredentialsSection.typeLabel')}
                    noTranslate
                    placeholder={t('Keyrings.CredentialsSection.typePlaceholder')}
                    description={t('Keyrings.CredentialsSection.typeBatchHelp')}
                    className="select__full"
                    value={form.type}
                    onChange={(value) => setForm({ ...form, type: value as LockCredentialType })}
                    options={availableTypes.map((type) => ({
                      value: type,
                      label: t(`CredentialType.${type}`),
                    }))}
                  />

                  <div className="community-form__field">
                    <Input
                      id="credential-label-prefix"
                      name="labelPrefix"
                      label={t('Keyrings.CredentialsSection.labelPrefixLabel')}
                      noTranslate
                      placeholder={targetName || t('Keyrings.CredentialsSection.labelPlaceholder')}
                      className="input__full"
                      value={form.labelPrefix}
                      maxLength={60}
                      onChange={(event) => setForm({ ...form, labelPrefix: event.target.value })}
                    />
                    <span className="community-form__help">
                      {t('Keyrings.CredentialsSection.labelPrefixHelp')}
                    </span>
                  </div>
                </div>

                {/* La lista exacta que se va a crear, con la etiqueta de cada una ya compuesta. */}
                {plan.length > 0 && (
                  <div className="community-form__field">
                    <span className="community-form__label">
                      {t('Keyrings.CredentialsSection.planTitle', { count: plan.length })}
                    </span>
                    <ul className="key-plan">
                      {plan.map((entry) => (
                        <li key={entry.residentMembershipId} className="key-plan__item">
                          <span className="key-plan__label">{entry.label}</span>
                          {entry.unitCode && (
                            <span className="key-plan__unit">{entry.unitCode}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {form.type === 'PIN' && (
                  <Alert type="info" message={t('Keyrings.CredentialsSection.batchPinNotice')} />
                )}
              </>
            )}

            {!isResidentsMode && (
              <div className="form-row form-row--cols-2">
                <Select
                  id="credential-type"
                  name="type"
                  label={t('Keyrings.CredentialsSection.typeLabel')}
                  noTranslate
                  placeholder={t('Keyrings.CredentialsSection.typePlaceholder')}
                  description={t('Keyrings.CredentialsSection.typeHelp')}
                  className="select__full"
                  value={form.type}
                  onChange={(value) => setForm({ ...form, type: value as LockCredentialType })}
                  options={availableTypes.map((type) => ({
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
                  maxLength={LABEL_MAX}
                  onChange={(event) => setForm({ ...form, label: event.target.value })}
                />

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
              </div>
            )}

            <div className="form-row form-row--cols-2">
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
                  disablePast
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

      {/*
        El parte del reparto.

        No se cierra pulsando fuera: si el tipo era PIN, esta ventana es la **única** vez que esos PIN se
        pueden leer, y perderlos por un clic despistado obliga a revocar y volver a emitir.
      */}
      {batchResult && (
        <ModalComponent
          title={t('Keyrings.CredentialsSection.batchResultTitle')}
          isOpen
          isLarge
          closeOnOutsideClick={false}
          onClose={() => setBatchResult(null)}
          onConfirm={() => setBatchResult(null)}
          confirmText="done"
          confirmIcon={KeyRoundIcon}
        >
          <div className="community-form">
            <p>
              {t('Keyrings.CredentialsSection.batchResultSummary', {
                created: batchResult.created.length,
                failed: batchResult.failed.length,
              })}
            </p>

            {batchResult.created.some((credential) => credential.plainPin) && (
              <Alert
                type="warning"
                message={t('Keyrings.CredentialsSection.batchResultPinNotice')}
              />
            )}

            <div className="community-table__scroll">
              <table className="community-table">
                <thead>
                  <tr>
                    <th>{t('Keyrings.CredentialsSection.batchResultHolder')}</th>
                    <th>{t('Keyrings.CredentialsSection.labelLabel')}</th>
                    <th>{t('Keyrings.CredentialsSection.batchResultOutcome')}</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResult.created.map((credential) => (
                    <tr key={credential.id}>
                      <td>{credential.residentName ?? '—'}</td>
                      <td>{credential.label}</td>
                      <td>
                        {credential.plainPin ? (
                          <span className="key-plan__pin">{credential.plainPin}</span>
                        ) : (
                          t(`CredentialStatus.${credential.status}`)
                        )}
                      </td>
                    </tr>
                  ))}

                  {batchResult.failed.map((failure) => (
                    <tr key={failure.residentMembershipId}>
                      <td>
                        {residents.find(
                          (resident) => resident.membershipId === failure.residentMembershipId,
                        )?.name ?? failure.residentMembershipId}
                      </td>
                      <td>—</td>
                      {/* El código del error tal cual: es más útil para contarlo que una frase genérica. */}
                      <td className="community-table__muted">
                        {t('Keyrings.CredentialsSection.batchResultFailed')} ({failure.error})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

                {/*
                  Una fila por puerta con su estado en badge, no una lista de puntos con guiones.
                  Antes era «Puerta de garaje — Aplicada», y en una lista de cinco puertas había que leerse
                  los cinco estados en texto corrido para ver si alguno había fallado; el color lo dice de
                  un vistazo, que es justo lo que se viene a mirar antes de revocar.
                */}
                <ul className="lock-sync-list">
                  {revoking.syncs.map((sync) => (
                    <li key={sync.lockId} className="lock-sync-list__item">
                      <span className="lock-sync-list__lock">
                        <DoorClosedIcon aria-hidden="true" />
                        {sync.lockName}
                      </span>
                      <Badge
                        variant={SYNC_VARIANTS[sync.status]}
                        text={t(`SyncStatus.${sync.status}`)}
                      />
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
            run(
              () => enrollCommunityCard(enrolling.id, nfcUid),
              () => setEnrolling(null),
            )
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
