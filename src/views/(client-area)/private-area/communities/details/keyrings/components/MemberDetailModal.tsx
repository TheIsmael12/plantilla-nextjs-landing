'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  CalendarClockIcon,
  CopyIcon,
  CreditCardIcon,
  EyeIcon,
  KeyRoundIcon,
  Link2OffIcon,
  LinkIcon,
  PlusIcon,
  RotateCwIcon,
  ScanLineIcon,
  SquareAsteriskIcon,
  Trash2Icon,
} from 'lucide-react';

import {
  assignCommunityKeys,
  createCommunityLockCredential,
  enrollCommunityCard,
  getKeyringMemberDetail,
  issueResidentMagicLink,
  resyncLockCredential,
  revealCredentialPin,
  revokeCommunityLockCredential,
  revokeKeyringMember,
  revokeResidentMagicLinks,
  updateKeyringMembership,
} from '@/actions/client-portal/community-lock-credentials-actions';

import { CREDENTIAL_STATUS_VARIANTS } from '@/utils/communityFormatUtils';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';
import { toLocalIsoDate } from '@/utils/dateUtils';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import DatePicker from '@/components/ui/inputs/DatePicker';
import Input from '@/components/ui/inputs/Input';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import RadioGroup from '@/components/ui/inputs/RadioGroup';
import SelectSearch from '@/components/ui/inputs/SelectSearch';

import type {
  KeyringMember,
  LockCredentialType,
  LockGroup,
  MemberCredential,
  MemberDetail,
} from '@/types/client-portal/community';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-key-picker.scss';

/** Cómo se pone el PIN: lo genera la aplicación o lo escribe quien lo entrega. */
type PinMode = 'AUTO' | 'OWN';

interface MemberDetailModalProps {
  serviceId: string;
  residentMembershipId: string;
  keyrings: LockGroup[];
  onClose: () => void;
}

/**
 * La ficha de una persona en el llavero.
 *
 * Contesta las tres preguntas que se hacen sobre alguien, en este orden: **quién es**, **a qué llega** y
 * **con qué se identifica**. Ese orden no es estético: lo primero que se mira al abrir esto es si el del
 * 3.º D tiene el garaje, y lo último —si acaso— con qué lo abre.
 *
 * A qué llega se decide metiéndolo y sacándolo de llaveros, y ahí no hay nada más que elegir: **ni tipo de
 * llave, ni horario**. Todo eso lo decide el llavero, que es donde se ve y se cambia una vez para todos. Lo
 * único propio de la persona es **hasta cuándo** le vale cada uno: se puede vivir aquí indefinidamente y
 * tener el del gimnasio solo mientras dure el abono.
 *
 * Con qué se identifica es suyo y no de una puerta: su PIN, su tarjeta y su enlace valen para todo lo que
 * sus llaveros abran. Se emiten y se retiran desde aquí, porque un llavero sin nada con lo que
 * identificarse no abre ninguna puerta y esa es la situación que esto resuelve.
 *
 * Y quitarle un llavero **no le quita sus llaves**: le siguen valiendo para los que le queden. Solo cuando
 * se queda sin ninguno se retiran, y entonces se avisa antes.
 * @param {MemberDetailModalProps} props - Comunidad, vecino y llaveros disponibles
 * @returns {JSX.Element} El modal renderizado
 */
export default function MemberDetailModal({
  serviceId,
  residentMembershipId,
  keyrings,
  onClose,
}: MemberDetailModalProps) {
  const t = useTranslations('Views.ClientArea.Communities.Keyrings.Members');
  const tTypes = useTranslations('Views.ClientArea.Communities.CredentialType');
  const tStatus = useTranslations('Views.ClientArea.Communities.CredentialStatus');
  const tCommon = useTranslations('Views.ClientArea.Communities');
  const tShared = useTranslations('Views.ClientArea.Common');

  const router = useRouter();

  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [toAdd, setToAdd] = useState('');

  /**
   * El PIN que se está emitiendo: si lo pone la aplicación o lo escribe quien lo entrega.
   *
   * Se pregunta porque las dos formas son legítimas y no son la misma cosa. El automático es lo correcto
   * casi siempre —nadie debería inventarse un secreto, y sale distinto para cada vecino—, pero quien ya le
   * ha dicho un número a alguien por teléfono necesita poder escribir **ese**.
   */
  const [pinDraft, setPinDraft] = useState<{ mode: PinMode; pin: string } | null>(null);

  /** La llave que se está a punto de retirar, para poder preguntar antes: no tiene vuelta. */
  const [revokeTarget, setRevokeTarget] = useState<MemberCredential | null>(null);

  /** La tarjeta a la que se le va a leer el plástico, y el UID que se está escribiendo. */
  const [enrollTarget, setEnrollTarget] = useState<{
    credential: MemberCredential;
    nfcUid: string;
  } | null>(null);

  /** El llavero al que se le está poniendo vigencia, con las fechas que se están escribiendo. */
  const [validity, setValidity] = useState<{
    keyring: KeyringMember;
    validFrom: string | null;
    validUntil: string | null;
  } | null>(null);

  /**
   * Lo que se acaba de emitir y **solo se puede leer ahora**: un PIN o un enlace de acceso.
   *
   * Vive aquí y en ningún otro sitio. El PIN se guarda hasheado y el enlace no se puede volver a consultar,
   * así que cerrar este aviso sin apuntarlo obliga a emitir otro. Los dos comparten el mismo sitio porque
   * comparten esa condición, que es lo único que hay que entender de ellos.
   */
  const [revealed, setRevealed] = useState<{ kind: 'PIN' | 'LINK'; value: string } | null>(null);

  const [isWorking, startWork] = useTransition();

  const load = useCallback(
    () => getKeyringMemberDetail(serviceId, residentMembershipId),
    [serviceId, residentMembershipId],
  );

  /*
   * La ficha se pide al abrir el modal, y la respuesta se descarta si para entonces se ha cerrado.
   *
   * Sin la comprobación, cerrar y abrir la de otro vecino deja llegar la primera respuesta encima de la
   * segunda: se ve la ficha equivocada, con el nombre correcto en el título.
   */
  useEffect(() => {
    let current = true;

    void load().then((response) => {
      if (current) setDetail(response.data ?? null);
    });

    return () => {
      current = false;
    };
  }, [load]);

  /** Relee la ficha tras cualquier cambio. */
  const reload = async () => {
    const response = await load();
    setDetail(response.data ?? null);
  };

  const handleAdd = () => {
    startWork(async () => {
      const response = await assignCommunityKeys(serviceId, {
        lockGroupId: toAdd,
        membershipIds: [residentMembershipId],
      });

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status)) return;

      setToAdd('');
      await reload();
      router.refresh();
    });
  };

  const handleRevoke = (keyringMembershipId: string) => {
    startWork(async () => {
      const response = await revokeKeyringMember(serviceId, keyringMembershipId);

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status)) return;

      await reload();
      router.refresh();
    });
  };

  /**
   * Guarda hasta cuándo le vale un llavero.
   *
   * El día elegido cuenta **entero**: «hasta el 31» significa que el 31 abre, así que la hora de fin es el
   * último minuto de ese día y no su medianoche. Sin eso, quien pone «hasta el domingo» se queda fuera el
   * domingo por la mañana.
   */
  const handleValidity = () => {
    if (!validity) return;

    startWork(async () => {
      const response = await updateKeyringMembership(serviceId, validity.keyring.id, {
        validFrom: validity.validFrom ? `${validity.validFrom}T00:00:00.000Z` : null,
        validUntil: validity.validUntil ? `${validity.validUntil}T23:59:00.000Z` : null,
      });

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status)) return;

      setValidity(null);
      await reload();
    });
  };

  /**
   * Emite una llave nueva para esta persona: su PIN o su tarjeta.
   *
   * El PIN va vacío cuando lo pone la aplicación: el servidor lo genera con la longitud que admiten sus
   * puertas —seis dígitos exactos en el fabricante que tenemos— y lo devuelve una única vez.
   * @param {LockCredentialType} type - Qué se emite
   * @param {string} [pin] - El PIN, si lo escribe quien lo entrega
   */
  const handleIssue = (type: LockCredentialType, pin?: string) => {
    startWork(async () => {
      const response = await createCommunityLockCredential(serviceId, {
        residentMembershipId,
        type,
        label: tTypes(type),
        ...(pin ? { pin } : {}),
      });

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status)) return;

      /*
       * El PIN en claro llega **solo en esta respuesta**.
       *
       * Se guarda hasheado, así que esta es la única vez que se puede leer sin preguntárselo al fabricante:
       * por eso se enseña en su propio aviso y no en un mensaje que se va a los tres segundos.
       */
      if (response.data?.plainPin) setRevealed({ kind: 'PIN', value: response.data.plainPin });

      setPinDraft(null);
      await reload();
    });
  };

  /**
   * Vuelve a leer el PIN de una llave preguntándoselo al fabricante.
   *
   * **No emite uno nuevo**: el que el vecino se sabe sigue valiendo. Es lo que hace falta cuando alguien lo
   * ha olvidado — antes la única salida era darle otro y hacerle aprenderse un número distinto.
   */
  const handleRevealPin = (credential: MemberCredential) => {
    startWork(async () => {
      const response = await revealCredentialPin(credential.id);

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status) || !response.data?.pin) return;

      setRevealed({ kind: 'PIN', value: response.data.pin });
    });
  };

  /**
   * Reprograma una llave en las puertas que le falten.
   *
   * Hace falta porque una llave se emite con las puertas que hay ese día: cuando se monta una nueva, la que
   * la gente ya tenía no la conoce y esa puerta no les abre.
   */
  const handleResync = (credential: MemberCredential) => {
    startWork(async () => {
      const response = await resyncLockCredential(credential.id);

      notifyResponse(response, tCommon('loadError'));

      if (!isErrorStatus(response.status)) await reload();
    });
  };

  /**
   * Retira una llave: su PIN, su tarjeta o su móvil.
   *
   * Se pregunta antes porque no tiene vuelta: el PIN se borra de las cerraduras y el vecino se queda sin ese
   * número. Lo que **no** hace es sacarle de sus llaveros — sigue pudiendo abrir con lo que le quede, y se
   * le puede dar otro cuando haga falta.
   */
  const handleRevokeCredential = () => {
    if (!revokeTarget) return;

    startWork(async () => {
      const response = await revokeCommunityLockCredential(revokeTarget.id);

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status)) return;

      setRevokeTarget(null);
      await reload();
    });
  };

  /** Asocia el plástico a una tarjeta ya emitida: es el paso que no se puede dar a distancia. */
  const handleEnroll = () => {
    if (!enrollTarget) return;

    startWork(async () => {
      const response = await enrollCommunityCard(
        enrollTarget.credential.id,
        enrollTarget.nfcUid.trim(),
      );

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status)) return;

      setEnrollTarget(null);
      await reload();
    });
  };

  /** Emite el enlace de acceso. Lo mismo que el PIN: se lee ahora o no se lee. */
  const handleMagicLink = () => {
    startWork(async () => {
      const response = await issueResidentMagicLink(serviceId, residentMembershipId);

      notifyResponse(response, tCommon('loadError'));

      if (isErrorStatus(response.status) || !response.data?.link) return;

      setRevealed({ kind: 'LINK', value: response.data.link });
      await reload();
    });
  };

  /**
   * Retira todos los enlaces de acceso del vecino.
   *
   * Se retiran **todos** y no uno concreto: no se pueden leer, así que quien viene a cortar uno no sabe cuál
   * se filtró, y dejar otro vivo sería no haber cortado nada. Sigue entrando con su PIN y su tarjeta.
   */
  const handleRevokeLinks = () => {
    startWork(async () => {
      const response = await revokeResidentMagicLinks(serviceId, residentMembershipId);

      notifyResponse(
        isErrorStatus(response.status)
          ? response
          : {
              ...response,
              message: t('linksRevoked', { count: response.data?.revoked ?? 0 }),
            },
        tCommon('loadError'),
      );

      if (isErrorStatus(response.status)) return;

      await reload();
    });
  };

  /**
   * Si ya tiene viva una llave de esa clase.
   *
   * **De PIN y de móvil hay una sola**: es su código, el que se sabe de memoria, y la base de datos lo
   * impone con un índice único. De tarjetas hay las que haga falta —se pierde una y se da otra—, así que esa
   * no se bloquea nunca.
   * @param {LockCredentialType} type - La clase de llave
   * @returns {boolean} Si ya la tiene
   */
  const alreadyHas = (type: LockCredentialType): boolean =>
    type !== 'NFC_CARD' &&
    (detail?.credentials ?? []).some(
      (credential) => credential.type === type && credential.status !== 'REVOKED',
    );

  /** Los que todavía no tiene: darle uno que ya tiene no haría nada y solo confundiría. */
  const available = keyrings.filter(
    (keyring) => !detail?.keyrings.some((own) => own.lockGroupId === keyring.id),
  );

  /** Las llaves vivas: las retiradas siguen en la lista, pero no cuentan para «se queda sin nada». */
  const liveCredentials = (detail?.credentials ?? []).filter(
    (credential) => credential.status !== 'REVOKED',
  );

  return (
    <ModalComponent
      title={detail?.residentName || t('detailTitle')}
      isOpen
      isLarge
      isLoading={isWorking}
      onClose={onClose}
      onCancel={onClose}
      cancelText="close"
    >
      <div className="community-form">
        {!detail ? (
          <p className="community-form__help">{tShared('loading')}</p>
        ) : (
          <>
            <div className="community-form__field">
              <span className="community-form__label">{t('who')}</span>
              <span className="community-form__help">
                {[detail.email, detail.communityUnitCode].filter(Boolean).join(' · ')}
              </span>

              {/* La vigencia del vecino, no la de sus llaves: un inquilino de temporada caduca entero. */}
              <span className="community-form__help">
                {detail.validFrom || detail.validUntil
                  ? `${detail.validFrom ?? '—'} → ${detail.validUntil ?? '—'}`
                  : t('noValidity')}
              </span>
            </div>

            <div className="community-form__field">
              <span className="community-form__label">{t('keyringsHeading')}</span>
              <span className="community-form__help">{t('keyringsHelp')}</span>

              {detail.keyrings.length === 0 ? (
                <span className="community-form__help">{t('noKeyringsHelp')}</span>
              ) : (
                <ul className="key-plan key-plan--roomy">
                  {detail.keyrings.map((keyring) => (
                    <li key={keyring.id} className="key-plan__item">
                      <span className="key-plan__label">{keyring.keyringName}</span>

                      {/*
                        La vigencia solo si la tiene: la mayoría de los llaveros no caduca, y dos rayas en
                        cada fila es ruido que hace más difícil ver la que sí caduca.
                      */}
                      {(keyring.validFrom || keyring.validUntil) && (
                        <span className="key-plan__unit">
                          {`${keyring.validFrom ?? '—'} → ${keyring.validUntil ?? '—'}`}
                        </span>
                      )}

                      <div className="key-plan__actions">
                        {/*
                          Hasta cuándo le vale **este** llavero, que no es lo mismo que hasta cuándo es
                          vecino: se puede vivir aquí indefinidamente y tener el gimnasio solo mientras dure
                          el abono.
                        */}
                        <Button
                          variant="outline"
                          ariaLabel="communityKeyringValidity"
                          disabled={isWorking}
                          onClick={() =>
                            setValidity({
                              keyring,
                              validFrom: keyring.validFrom?.slice(0, 10) ?? null,
                              validUntil: keyring.validUntil?.slice(0, 10) ?? null,
                            })
                          }
                        >
                          <CalendarClockIcon />
                        </Button>

                        <Button
                          variant="outline"
                          ariaLabel="delete"
                          disabled={isWorking}
                          onClick={() => handleRevoke(keyring.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/*
                Quitarle el último llavero le retira también lo que le identifica.
                Se dice antes y no después: es la diferencia entre «le he quitado el gimnasio» y «le he
                dejado sin PIN», y quien lo hace tiene que saber cuál de las dos está a punto de pasar.
              */}
              {detail.keyrings.length === 1 && (
                <Alert type="warning" message={t('lastKeyringWarning')} />
              )}
            </div>

            {available.length > 0 && (
              <div className="community-form__field">
                <SelectSearch
                  id="member-keyring-add"
                  name="keyringToAdd"
                  label={t('addKeyringLabel')}
                  noTranslate
                  placeholder={t('addKeyringLabel')}
                  className="select__full"
                  value={toAdd}
                  onChange={setToAdd}
                  options={[
                    { value: '', label: '—' },
                    ...available.map((keyring) => ({ value: keyring.id, label: keyring.name })),
                  ]}
                />

                <Button
                  variant="primary"
                  title="add"
                  disabled={!toAdd || isWorking}
                  onClick={handleAdd}
                >
                  <PlusIcon />
                </Button>
              </div>
            )}

            {/*
              Con qué se identifica, al final.
              Va aquí abajo porque es lo último que se pregunta —primero si tiene el garaje, luego con qué lo
              abre—, pero sí se toca desde aquí: un llavero sin nada con lo que identificarse no abre nada.
            */}
            <div className="community-form__field">
              <span className="community-form__label">{t('credentialsHeading')}</span>
              <span className="community-form__help">{t('credentialsHelp')}</span>

              {/*
                Cuántos enlaces tiene vivos.
                Un enlace no se puede leer una vez emitido, así que este número es lo único que dice si esa
                persona tiene uno, tres o ninguno — y si el botón de retirar va a retirar algo.
              */}
              {detail.magicLinks > 0 && (
                <span className="community-form__help">
                  {t('magicLinkCount', { count: detail.magicLinks })}
                </span>
              )}

              {/* Sin llavero no hay nada que emitir: la llave abriría exactamente nada. */}
              {detail.keyrings.length === 0 ? (
                <Alert type="info" message={t('needsKeyringToIssue')} />
              ) : (
                <div className="community-toolbar__actions">
                  {/* Ya tiene PIN: se retira el suyo antes de darle otro, no se acumulan. */}
                  <Button
                    variant="outline"
                    ariaLabel="communityIssuePin"
                    disabled={isWorking || alreadyHas('PIN')}
                    onClick={() => setPinDraft({ mode: 'AUTO', pin: '' })}
                  >
                    <SquareAsteriskIcon />
                  </Button>

                  <Button
                    variant="outline"
                    ariaLabel="communityIssueCard"
                    disabled={isWorking}
                    onClick={() => handleIssue('NFC_CARD')}
                  >
                    <CreditCardIcon />
                  </Button>

                  <Button
                    variant="outline"
                    ariaLabel="communityIssueMagicLink"
                    disabled={isWorking}
                    onClick={handleMagicLink}
                  >
                    <LinkIcon />
                  </Button>

                  {/*
                    Y poder cortarlos.
                    Un enlace no caduca solo ni se puede volver a leer: si se comparte con quien no debía,
                    esto es lo único que lo para. Antes había que sacar a la persona de sus llaveros, que le
                    quitaba también el PIN y la tarjeta.
                  */}
                  <Button
                    variant="outline-error"
                    ariaLabel="communityRevokeMagicLinks"
                    disabled={isWorking || detail.magicLinks === 0}
                    onClick={handleRevokeLinks}
                  >
                    <Link2OffIcon />
                  </Button>
                </div>
              )}

              {detail.credentials.length === 0 ? (
                <span className="community-form__help">{t('noCredentialsHelp')}</span>
              ) : (
                <ul className="key-plan key-plan--roomy">
                  {detail.credentials.map((credential) => (
                    <li key={credential.id} className="key-plan__item">
                      <span className="key-plan__label">{tTypes(credential.type)}</span>

                      <Badge
                        variant={CREDENTIAL_STATUS_VARIANTS[credential.status]}
                        text={tStatus(credential.status)}
                      />

                      {/*
                        Programada o no, dicho por puertas.
                        Es la diferencia entre «tiene PIN» y «tiene PIN, y en el garaje no funciona»: si el
                        vecino cree tener el garaje y no lo tiene, es mejor que lo sepa antes de bajar.
                      */}
                      {credential.syncedLocks < credential.totalLocks && (
                        <span className="key-plan__unit">
                          {t('pendingLocks', {
                            count: credential.totalLocks - credential.syncedLocks,
                          })}
                        </span>
                      )}

                      <div className="key-plan__actions">
                        {/*
                          Reprogramarla en las puertas que le falten.
                          El aviso sin botón obligaba a buscar dónde se reprograma, y el caso normal —una
                          puerta recién montada— se arregla con una pulsación.
                        */}
                        {credential.syncedLocks < credential.totalLocks && (
                          <Button
                            variant="outline"
                            ariaLabel="communityResyncCredential"
                            disabled={isWorking}
                            onClick={() => handleResync(credential)}
                          >
                            <RotateCwIcon />
                          </Button>
                        )}

                        {/*
                          Ver el PIN, preguntándoselo al fabricante.
                          Aquí se guarda hasheado y no se puede releer, pero él sí lo tiene — y es lo que la
                          cerradura espera de verdad. Sin esto, a quien lo olvidaba había que darle otro.
                        */}
                        {credential.type === 'PIN' && credential.status !== 'REVOKED' && (
                          <Button
                            variant="outline"
                            ariaLabel="communityRevealPin"
                            disabled={isWorking}
                            onClick={() => handleRevealPin(credential)}
                          >
                            <EyeIcon />
                          </Button>
                        )}

                        {/*
                          La tarjeta es lo único que no se puede entregar a distancia.
                          Existe desde que se le da el llavero y no abre nada hasta que alguien le pone el
                          plástico delante y lee su UID, así que el botón vive aquí: es donde se ve que está
                          pendiente, y quien lo ve es quien la va a entregar.
                        */}
                        {credential.type === 'NFC_CARD' && credential.status !== 'REVOKED' && (
                          <Button
                            variant="outline"
                            ariaLabel="enroll"
                            disabled={isWorking}
                            onClick={() => setEnrollTarget({ credential, nfcUid: '' })}
                          >
                            <ScanLineIcon />
                          </Button>
                        )}

                        {/*
                          Y retirarla.
                          Hace falta para lo de siempre: un PIN que se ha compartido por el grupo del edificio,
                          o una tarjeta perdida. No le saca del llavero — sigue abriendo con lo que le quede.
                        */}
                        {credential.status !== 'REVOKED' && (
                          <Button
                            variant="outline-error"
                            ariaLabel="communityRevokeCredential"
                            disabled={isWorking}
                            onClick={() => setRevokeTarget(credential)}
                          >
                            <Trash2Icon />
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>

      {/*
        Cómo se pone el PIN, antes de emitirlo.
        Las dos formas son legítimas: la automática es la buena casi siempre —nadie debería inventarse un
        secreto— y la escrita hace falta cuando ya se le ha dicho un número a alguien por teléfono.
      */}
      {pinDraft && (
        <ModalComponent
          isOpen
          title={t('pinFormTitle')}
          isLoading={isWorking}
          confirmText="confirm"
          isLoadingText="saving"
          confirmDisabled={pinDraft.mode === 'OWN' && !/^\d{4,10}$/.test(pinDraft.pin)}
          onClose={() => setPinDraft(null)}
          onCancel={() => setPinDraft(null)}
          onConfirm={() => handleIssue('PIN', pinDraft.mode === 'OWN' ? pinDraft.pin : undefined)}
        >
          <div className="form-rows">
            <RadioGroup
              name="pinMode"
              label={t('pinModeLabel')}
              value={pinDraft.mode}
              onChange={(value) => setPinDraft({ mode: value as PinMode, pin: '' })}
              options={[
                { value: 'AUTO', label: t('pinModeAuto') },
                { value: 'OWN', label: t('pinModeOwn') },
              ]}
            />

            {pinDraft.mode === 'AUTO' ? (
              <p className="community-form__help">{t('pinModeAutoHelp')}</p>
            ) : (
              <div className="community-form__field">
                <Input
                  id="pin"
                  name="pin"
                  type="text"
                  label={t('pinLabel')}
                  noTranslate
                  placeholder={t('pinPlaceholder')}
                  value={pinDraft.pin}
                  maxLength={10}
                  onChange={(event) =>
                    setPinDraft({ ...pinDraft, pin: event.target.value.replace(/\D/g, '') })
                  }
                  className="input__full"
                />

                {/*
                  La longitud la manda la cerradura, no nosotros: la del fabricante que tenemos exige seis
                  exactos. Se avisa aquí en vez de dejar que lo diga el servidor con el PIN ya dictado.
                */}
                <span className="community-form__help">{t('pinLengthHelp')}</span>
              </div>
            )}

            <Alert type="info" message={t('pinShownOnceNotice')} />
          </div>
        </ModalComponent>
      )}

      {/*
        La vigencia, en un modal y no en la fila.
        Son dos fechas y una explicación de qué pasa al llegar: en la fila no cabe, y en línea convertía cada
        llavero en un formulario.
      */}
      {validity && (
        <ModalComponent
          isOpen
          /*
            El nombre del llavero **no** va en el título.
            Metido dentro salía «Hasta cuándo vale «Zonas Comunes (CP Serrano 145)»», que en un diálogo
            estrecho ocupa tres líneas, empuja la X y deja la cabecera desbordada. Va abajo, donde tiene
            sitio.
          */
          title={t('validityTitle')}
          isLoading={isWorking}
          confirmText="save"
          isLoadingText="saving"
          onClose={() => setValidity(null)}
          onCancel={() => setValidity(null)}
          onConfirm={handleValidity}
        >
          <div className="form-rows">
            {/* De qué llavero se está hablando, en su propia línea y con su icono. */}
            <p className="community-form__label">
              <KeyRoundIcon aria-hidden="true" size={16} /> {validity.keyring.keyringName}
            </p>

            <p className="community-form__help">{t('validityHelp')}</p>

            <div className="form-row form-row--cols-2">
              <DatePicker
                id="validFrom"
                name="validFrom"
                label={t('validFrom')}
                value={validity.validFrom}
                onChange={(value) =>
                  setValidity({ ...validity, validFrom: value ? toLocalIsoDate(value) : null })
                }
                maxDate={validity.validUntil ?? undefined}
                clearable
                className="date-picker__full"
              />

              <DatePicker
                id="validUntil"
                name="validUntil"
                label={t('validUntil')}
                value={validity.validUntil}
                onChange={(value) =>
                  setValidity({ ...validity, validUntil: value ? toLocalIsoDate(value) : null })
                }
                minDate={validity.validFrom ?? undefined}
                clearable
                className="date-picker__full"
              />
            </div>

            <Alert type="info" message={t('validityEmptyMeansAlways')} />
          </div>
        </ModalComponent>
      )}

      {/*
        Retirar una llave se pregunta antes: no tiene vuelta.
        El PIN se borra de las cerraduras y el vecino se queda sin ese número. Lo que no pasa es que pierda
        el acceso: sus llaveros siguen ahí y se le puede dar otra.
      */}
      {revokeTarget && (
        <ModalComponent
          isOpen
          title={t('revokeCredentialTitle', { type: tTypes(revokeTarget.type) })}
          isLoading={isWorking}
          confirmVariant="error"
          confirmText="revoke"
          isLoadingText="revoking"
          onClose={() => setRevokeTarget(null)}
          onCancel={() => setRevokeTarget(null)}
          onConfirm={handleRevokeCredential}
        >
          <div className="form-rows">
            <p>{t('revokeCredentialDescription')}</p>

            {/* Que no se quede sin nada con lo que identificarse, dicho antes y no después. */}
            {liveCredentials.length === 1 && (
              <Alert type="warning" message={t('revokeLastCredential')} />
            )}
          </div>
        </ModalComponent>
      )}

      {/* El plástico: se lee su UID delante del vecino, que es el único momento en que se tiene. */}
      {enrollTarget && (
        <ModalComponent
          isOpen
          title={t('enrollTitle')}
          isLoading={isWorking}
          confirmText="save"
          isLoadingText="saving"
          confirmDisabled={enrollTarget.nfcUid.trim().length < 4}
          onClose={() => setEnrollTarget(null)}
          onCancel={() => setEnrollTarget(null)}
          onConfirm={handleEnroll}
        >
          <div className="form-rows">
            <p>{t('enrollDescription')}</p>

            <Input
              id="nfcUid"
              name="nfcUid"
              label={t('nfcUidLabel')}
              noTranslate
              placeholder={t('nfcUidPlaceholder')}
              value={enrollTarget.nfcUid}
              onChange={(event) =>
                setEnrollTarget({ ...enrollTarget, nfcUid: event.target.value })
              }
              className="input__full"
            />

            <Alert type="info" message={t('nfcIsPersonalData')} />
          </div>
        </ModalComponent>
      )}

      {/*
        El PIN y el enlace, aquí y solo aquí.
        No se cierra pulsando fuera: es la única vez que se pueden leer, y volver a pedirlos no los recupera
        — emite otros y tumba los que la persona ya tenga.
      */}
      {revealed && (
        <ModalComponent
          isOpen
          title={t(revealed.kind === 'PIN' ? 'pinTitle' : 'linkTitle')}
          closeOnOutsideClick={false}
          confirmText="done"
          onClose={() => setRevealed(null)}
          onConfirm={() => setRevealed(null)}
        >
          <div className="form-rows">
            <p>{t(revealed.kind === 'PIN' ? 'pinDescription' : 'linkDescription')}</p>

            <div className="secret-row">
              <p className="secret-row__value">{revealed.value}</p>

              <Button
                variant="outline"
                ariaLabel="copy"
                onClick={() => void navigator.clipboard.writeText(revealed.value)}
              >
                <CopyIcon />
              </Button>
            </div>

            {/*
              El PIN se puede volver a leer y el enlace no: son dos avisos distintos, y decir el mismo en los
              dos casos hacía emitir otro enlace «por si acaso», que tumba el que la persona ya tenga.
            */}
            <Alert
              type={revealed.kind === 'PIN' ? 'info' : 'warning'}
              message={t(revealed.kind === 'PIN' ? 'pinCanBeReadAgain' : 'linkShownOnce')}
            />
          </div>
        </ModalComponent>
      )}
    </ModalComponent>
  );
}
