'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  assignCommunityKeys,
  getKeyringMembers,
} from '@/actions/client-portal/community-lock-credentials-actions';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import SelectSearch from '@/components/ui/inputs/SelectSearch';

import KeyRecipientsPicker, {
  type KeyRecipient,
} from '@/views/(client-area)/private-area/communities/details/keyrings/components/KeyRecipientsPicker';

import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import type {
  AssignKeysResult,
  LockGroup,
  PortalResident,
  ResidentInvitation,
} from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-key-picker.scss';

/**
 * Los cinco métodos del fabricante, con la bandera del llavero que los enciende.
 *
 * Sirven para poder decir en voz alta con qué se abre lo que se está repartiendo. No se preguntan: los
 * decide el llavero.
 */
const METHODS = [
  ['ONLINE', 'allowsOnline'],
  ['BLUETOOTH', 'allowsBluetooth'],
  ['MOBILE_NFC', 'allowsMobileNfc'],
  ['PIN', 'allowsPin'],
  ['CARD', 'allowsCard'],
] as const;

/** Conjunto vacío estable: uno nuevo en cada render volvería a pintar el selector sin que cambie nada. */
const EMPTY_HOLDERS: Set<string> = new Set();

/**
 * Props de {@link AssignKeysModal}.
 * @interface AssignKeysModalProps
 * @property {string} serviceId - Servicio contratado que soporta la comunidad
 * @property {LockGroup[]} keyrings - Llaveros de la comunidad
 * @property {PortalResident[]} residents - Vecinos con pertenencia activa
 * @property {ResidentInvitation[]} invitations - Invitaciones pendientes de aceptar
 * @property {() => void} onClose - Handler de cierre
 */
interface AssignKeysModalProps {
  serviceId: string;
  keyrings: LockGroup[];
  residents: PortalResident[];
  invitations: ResidentInvitation[];
  onClose: () => void;
}

/**
 * Dar un llavero a varias personas de golpe.
 *
 * **Solo se dan llaveros.** Una puerta suelta ya no se reparte, y no es una simplificación de la pantalla
 * sino el modelo del fabricante: allí el acceso se concede por pertenecer a un grupo, y lo que ese grupo
 * permite —qué métodos, con qué horario, exigiendo presencia o no— vive en su regla. Con puertas sueltas
 * había que inventar un grupo de usar y tirar por cada una, con su configuración duplicada y sin dónde
 * editarla.
 *
 * Y **no se pregunta con qué se abre**, que era lo que hacía que cuarenta vecinos del mismo portal pudieran
 * acabar con cuarenta configuraciones distintas: lo dice el llavero, y se lee aquí antes de repartir.
 * @param {AssignKeysModalProps} props - Propiedades del modal
 * @returns {JSX.Element} El modal renderizado
 */
export default function AssignKeysModal({
  serviceId,
  keyrings,
  residents,
  invitations,
  onClose,
}: AssignKeysModalProps) {
  const t = useTranslations('Views.ClientArea.Communities.Keyrings.AssignKeys');
  const tMethods = useTranslations('Views.ClientArea.Communities.AccessMethod');
  const tTypes = useTranslations('Views.ClientArea.Communities.CredentialType');
  const tRole = useTranslations('Views.ClientArea.Communities.ResidentRole');
  const tCommon = useTranslations('Views.ClientArea.Communities');

  const router = useRouter();

  const [targetId, setTargetId] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<AssignKeysResult | null>(null);
  const [isWorking, startWork] = useTransition();

  /**
   * Quién está ya dentro del llavero elegido, para no metérselo dos veces.
   *
   * Se guarda **junto al destino al que pertenece** en vez de en un conjunto suelto: así, al cambiar de
   * llavero, lo que había deja de valer por sí solo y no hace falta limpiarlo. Con un conjunto suelto había
   * que vaciarlo al cambiar, y entre el cambio y la respuesta de la API se veían un instante los titulares
   * del llavero anterior marcados como «ya tiene» — justo el dato que se viene a consultar aquí.
   */
  const [existing, setExisting] = useState<{ targetId: string; ids: Set<string> } | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  const alreadyHave = existing?.targetId === targetId ? existing.ids : EMPTY_HOLDERS;

  /*
   * Al elegir el llavero se pregunta a la API quién está ya dentro.
   *
   * Se preguntan los **miembros** y no las credenciales: una credencial ya no dice a qué llavero pertenece
   * —es el medio con el que alguien se identifica, y le vale para todos los suyos—, así que la única fuente
   * de «quién tiene esto» son sus miembros. Es el caso de uso legítimo de un efecto: un dato externo que
   * depende de lo que se ha elegido en el formulario.
   */
  useEffect(() => {
    if (!targetId) return;

    let cancelled = false;

    void (async () => {
      setIsLoadingExisting(true);

      const response = await getKeyringMembers(serviceId, targetId);

      if (cancelled) return;

      setExisting({
        targetId,
        ids: new Set((response.data ?? []).map((member) => member.residentMembershipId)),
      });
      setIsLoadingExisting(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [serviceId, targetId]);

  const keyring = keyrings.find((group) => group.id === targetId);

  const recipients: KeyRecipient[] = useMemo(() => {
    const fromResidents: KeyRecipient[] = residents.map((resident) => ({
      id: resident.membershipId,
      kind: 'membership',
      name: resident.name || resident.email,
      unitCode: resident.communityUnitCode ?? null,
      meta: tRole(resident.role),
      alreadyHas: alreadyHave.has(resident.membershipId),
    }));

    const fromInvitations: KeyRecipient[] = invitations.map((invitation) => ({
      id: invitation.id,
      kind: 'invitation',
      name: invitation.name || invitation.email,
      unitCode: invitation.communityUnitCode ?? null,
      meta: invitation.name ? invitation.email : undefined,
      /*
       * Una invitación nunca sale bloqueada.
       *
       * Lo que ya tiene son llaveros planificados, no pertenencias, y el conjunto de «ya lo tiene» se calcula
       * de los miembros del llavero, donde una invitación no aparece. Repetirlo es inofensivo: la API lo
       * cuenta como omitido y no duplica nada.
       */
      alreadyHas: false,
    }));

    return [...fromResidents, ...fromInvitations];
  }, [residents, invitations, alreadyHave, tRole]);

  const invitationIds = useMemo(
    () => new Set(invitations.map((invitation) => invitation.id)),
    [invitations],
  );

  const handleAssign = () => {
    startWork(async () => {
      const response = await assignCommunityKeys(serviceId, {
        lockGroupId: targetId,
        membershipIds: selected.filter((id) => !invitationIds.has(id)),
        invitationIds: selected.filter((id) => invitationIds.has(id)),
      });

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status) || !response.data) return;

      // No se cierra: el resumen lleva los PIN generados, y son irrecuperables una vez se cierre.
      setResult(response.data);
      setSelected([]);
      router.refresh();
    });
  };

  const targetOptions = keyrings.map((group) => ({
    value: group.id,
    label: `${group.name} · ${t('rules', { count: group.permissionRules.length })}`,
  }));

  return (
    <ModalComponent
      title={t('title')}
      isOpen
      isLarge
      /*
       * No se cierra pulsando fuera.
       *
       * Mientras se reparte, un clic despistado tira la selección de treinta vecinos. Y con el parte ya en
       * pantalla es peor: si había PIN, esta ventana es la **única** vez que se pueden leer.
       */
      closeOnOutsideClick={false}
      isLoading={isWorking}
      confirmVariant="primary"
      confirmText={result ? 'close' : 'grantKeys'}
      isLoadingText="assigning"
      confirmDisabled={
        !result && (!targetId || selected.length === 0)
      }
      onClose={onClose}
      onCancel={result ? undefined : onClose}
      onConfirm={result ? onClose : handleAssign}
    >
      {result ? (
        <div className="community-form">
          <Alert type="success" message={t('doneTitle')} />

          <ul className="key-plan">
            <li className="key-plan__item">
              <span className="key-plan__label">{t('countJoined', { count: result.joined })}</span>
            </li>

            {result.issued.length > 0 && (
              <li className="key-plan__item">
                <span className="key-plan__label">
                  {t('countIssued', { count: result.issued.length })}
                </span>
              </li>
            )}

            {result.planned > 0 && (
              <li className="key-plan__item">
                <span className="key-plan__label">
                  {t('countPlanned', { count: result.planned })}
                </span>
              </li>
            )}

            {result.skipped > 0 && (
              <li className="key-plan__item">
                <span className="key-plan__label">
                  {t('countSkipped', { count: result.skipped })}
                </span>
              </li>
            )}
          </ul>

          {/* Una tarjeta repartida todavía no abre: hay que entregarla y pasarla por el lector. */}
          {result.pendingCards > 0 && (
            <Alert type="info" message={t('pendingCards', { count: result.pendingCards })} />
          )}

          {/*
            Lo que las puertas del destino no admiten.
            Se dice en vez de callarlo: quien reparte pidió tres tipos y salieron dos, y sin este aviso la
            diferencia se descubre el día que un vecino intenta abrir con lo que no tiene.
          */}
          {result.unsupportedTypes.length > 0 && (
            <Alert
              type="warning"
              message={t('unsupported', {
                types: result.unsupportedTypes.map((type) => tTypes(type)).join(', '),
              })}
            />
          )}

          {/*
            Los PIN, aquí y solo aquí.
            En base de datos van hasheados, así que esta lista es la única vez que se pueden leer. Si se
            cierra sin copiarlos, no se recuperan: hay que revocar la llave y emitir otra.
          */}
          {result.issued.some((key) => key.pin) && (
            <>
              <Alert type="warning" message={t('pinsWarning')} />

              <ul className="key-plan">
                {result.issued
                  .filter((key) => key.pin)
                  .map((key) => (
                    <li key={key.credentialId} className="key-plan__item">
                      <span className="key-plan__label">{key.residentName}</span>
                      {key.unitCode && <span className="key-plan__unit">{key.unitCode}</span>}
                      <span className="key-plan__pin">{key.pin}</span>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      ) : (
        <div className="community-form">
          <p className="community-form__help">{t('description')}</p>

          <SelectSearch
            id="assign-target"
            name="targetId"
            label={t('keyringLabel')}
            noTranslate
            placeholder={t('keyringPlaceholder')}
            className="select__full"
            value={targetId}
            onChange={(value) => {
              setTargetId(value);
              setSelected([]);
            }}
            options={[{ value: '', label: '—' }, ...targetOptions]}
          />

          {/*
            Qué se está dando, en voz alta antes de darlo.
            No se pregunta —lo decide el llavero— pero sí se lee: es la diferencia entre repartir a ciegas y
            saber que este llavero abre con el móvil pero no con PIN.
          */}
          {keyring && (
            <Alert
              type="info"
              message={t('keyringOpensWith', {
                /*
                 * La **unión** de lo que conceden sus reglas, no la intersección.
                 *
                 * Si una regla da PIN para el portal y otra solo app para el garaje, a la persona hay que
                 * darle las dos cosas — cada una le servirá donde valga.
                 */
                methods: METHODS.filter(([, field]) =>
                  keyring.permissionRules.some((rule) => rule[field]),
                )
                  .map(([method]) => tMethods(method))
                  .join(', '),
              })}
            />
          )}

          {targetId ? (
            <KeyRecipientsPicker
              recipients={recipients}
              value={selected}
              onChange={setSelected}
              isLoading={isLoadingExisting}
              disabled={isWorking}
            />
          ) : (
            <Alert type="info" message={t('chooseTargetFirst')} />
          )}
        </div>
      )}
    </ModalComponent>
  );
}
