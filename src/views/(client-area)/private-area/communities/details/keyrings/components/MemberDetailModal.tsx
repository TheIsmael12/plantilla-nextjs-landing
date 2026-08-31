'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PlusIcon, Trash2Icon } from 'lucide-react';

import {
  assignCommunityKeys,
  getKeyringMemberDetail,
  revokeKeyringMember,
} from '@/actions/client-portal/community-lock-credentials-actions';

import { CREDENTIAL_STATUS_VARIANTS } from '@/utils/communityFormatUtils';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import SelectSearch from '@/components/ui/inputs/SelectSearch';

import type { LockGroup, MemberDetail } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-common.scss';

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
 * Dar y quitar es meter y sacar de un llavero, y no hay nada más que elegir: **ni tipo de llave, ni validez,
 * ni horario**. Todo eso lo decide el llavero, que es donde se ve y se cambia una vez para todos.
 *
 * Y quitarle un llavero **no le quita sus llaves**: su PIN y su móvil son suyos y le siguen valiendo para
 * los que le queden. Solo cuando se queda sin ninguno se retiran, y entonces se avisa antes.
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

  const router = useRouter();

  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [toAdd, setToAdd] = useState('');
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

  /** Relee la ficha tras dar o quitar un llavero. */
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

  /** Los que todavía no tiene: darle uno que ya tiene no haría nada y solo confundiría. */
  const available = keyrings.filter(
    (keyring) => !detail?.keyrings.some((own) => own.lockGroupId === keyring.id),
  );

  return (
    <ModalComponent
      title={detail?.residentName || t('detailTitle')}
      isOpen
      isLoading={isWorking}
      onClose={onClose}
      onCancel={onClose}
      cancelText="close"
    >
      <div className="community-form">
        {!detail ? (
          <p className="community-form__help">{tCommon('loading')}</p>
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
                <ul className="key-plan">
                  {detail.keyrings.map((keyring) => (
                    <li key={keyring.id} className="key-plan__item">
                      <span className="key-plan__label">{keyring.keyringName}</span>

                      {(keyring.validFrom || keyring.validUntil) && (
                        <span className="key-plan__unit">
                          {`${keyring.validFrom ?? '—'} → ${keyring.validUntil ?? '—'}`}
                        </span>
                      )}

                      <Button
                        variant="outline"
                        ariaLabel="delete"
                        disabled={isWorking}
                        onClick={() => handleRevoke(keyring.id)}
                      >
                        <Trash2Icon />
                      </Button>
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
              Con qué se identifica, al final y sin acciones.
              Va aquí abajo porque es lo último que se pregunta —primero si tiene el garaje, luego con qué lo
              abre— y no se toca desde aquí: se emite sola con lo que sus llaveros conceden.
            */}
            {detail.credentials.length > 0 && (
              <div className="community-form__field">
                <span className="community-form__label">{t('credentialsHeading')}</span>
                <span className="community-form__help">{t('credentialsHelp')}</span>

                <ul className="key-plan">
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
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </ModalComponent>
  );
}
