import { useTranslations } from 'next-intl';
import { BatteryIcon, InfoIcon, PlugZapIcon, WifiIcon, WifiOffIcon } from 'lucide-react';

import { LOCK_STATUS_VARIANTS, formatCommunityDateTime } from '@/utils/communityFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import SettingsSection from '@/components/ui/sections/SettingsSection';

import type { CommunityLock } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-common.scss';

/** Por debajo de esto, la batería se pinta en rojo: es el aviso que hay que ver venir. */
const LOW_BATTERY_THRESHOLD = 25;

interface LockCardProps {
  lock: CommunityLock;
  locale: string;
}

/**
 * La ficha de una puerta, tal y como la manda el fabricante.
 *
 * **Aquí no se configura nada.** Una puerta es el `gadget` del fabricante y en su API es de solo lectura: el
 * nombre, el aparato al que cuelga, la sede y lo que sabe hacer se deciden al montar la instalación. Hubo
 * aquí un editor de horario y de excepciones de fecha, y era una copia que no llegaba a ninguna cerradura —
 * en el fabricante una puerta no tiene horario, lo tiene la regla de permiso del llavero.
 *
 * Lo que esta tarjeta tiene que decir es **por qué una puerta no responde**, que casi siempre es que el
 * aparato está sin línea o sin pilas.
 * @param {LockCardProps} props - La puerta y el idioma
 * @returns {JSX.Element} La tarjeta renderizada
 */
export default function LockCard({ lock, locale }: LockCardProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const capabilities = lock.capabilities;
  const status = lock.deviceStatus;

  /** Lo que el aparato sabe hacer, en palabras: aquí no se marca nada. */
  const canDo = [
    capabilities?.pin && t('AccessMethod.PIN'),
    capabilities?.nfc && t('AccessMethod.CARD'),
    capabilities?.internet || capabilities?.wifi || capabilities?.ethernet || capabilities?.cellular
      ? t('Locks.capabilityInternet')
      : null,
  ].filter(Boolean);

  return (
    <SettingsSection
      title={lock.name}
      description={[lock.siteName, lock.communityUnitCode].filter(Boolean).join(' · ')}
      actions={
        <div className="community-badges">
          <Badge variant={LOCK_STATUS_VARIANTS[lock.status]} text={t(`LockStatus.${lock.status}`)} />

          {lock.isMainAccess && <Badge variant="info" text={t('Locks.mainAccess')} />}

          {/*
            Cómo está el aparato, arriba y no escondido: es el dato que se viene a buscar cuando alguien
            llama diciendo que no puede entrar.
          */}
          {status && (
            <Badge
              variant={status.online ? 'success' : 'warning'}
              text={status.online ? t('Locks.online') : t('Locks.offline')}
            />
          )}
        </div>
      }
    >
      <dl className="community-facts">
        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.device')}</dt>
          <dd className="community-facts__value">
            {[lock.deviceName, lock.productName, lock.revisionId && `rev. ${lock.revisionId}`]
              .filter(Boolean)
              .join(' · ') || tCommon('notAvailable')}
          </dd>
        </div>

        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.hardwareId')}</dt>
          <dd className="community-facts__value">{lock.hardwareId ?? tCommon('notAvailable')}</dd>
        </div>

        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.canDo')}</dt>
          <dd className="community-facts__value">
            {canDo.length > 0 ? canDo.join(' · ') : tCommon('notAvailable')}
          </dd>
        </div>

        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.actions')}</dt>
          <dd className="community-facts__value">
            {(lock.actions ?? []).map((action) => action.name).join(' · ') ||
              tCommon('notAvailable')}
          </dd>
        </div>

        {/*
          La corriente y la batería solo si el aparato las tiene.
          Un controlador enchufado reporta `batteryPercent: 0`, y enseñar ese cero se leería como «batería
          agotada» en una puerta que no lleva pilas.
        */}
        {status?.mainsPresent && (
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Locks.power')}</dt>
            <dd className="community-facts__value">
              <PlugZapIcon aria-hidden="true" />
              {t('Locks.mains')}
            </dd>
          </div>
        )}

        {status?.batteryPresent && (
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Locks.battery')}</dt>
            <dd
              className={`community-facts__value community-facts__battery${
                status.batteryPercent <= LOW_BATTERY_THRESHOLD
                  ? ' community-facts__battery--low'
                  : ''
              }`}
            >
              <BatteryIcon aria-hidden="true" />
              {`${Math.round(status.batteryPercent)}%`}
            </dd>
          </div>
        )}

        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.connection')}</dt>
          <dd className="community-facts__value">
            {status?.online ? (
              <WifiIcon aria-hidden="true" />
            ) : (
              <WifiOffIcon aria-hidden="true" />
            )}
            {status?.online ? t('Locks.online') : t('Locks.offline')}
          </dd>
        </div>

        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.syncedAt')}</dt>
          <dd className="community-facts__value">
            {formatCommunityDateTime(lock.lastSyncedAt, locale, tCommon('notAvailable'))}
          </dd>
        </div>
      </dl>

      {/*
        Dónde se cambia esto, dicho una vez.
        La pregunta que trae a esta pantalla suele ser «¿por qué no puedo editar nada?», y la respuesta es
        que la puerta es del fabricante: aquí se lee, y el horario vive en el llavero.
      */}
      <p className="community-notice">
        <InfoIcon aria-hidden="true" />
        {t('Locks.readOnlyExplanation')}
      </p>
    </SettingsSection>
  );
}
