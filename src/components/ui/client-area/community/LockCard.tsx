'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BatteryIcon,
  CalendarPlusIcon,
  DoorOpenIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

import {
  cancelLockRelease,
  createLockScheduleException,
  deleteLockScheduleException,
  putLockSchedule,
  releaseLock,
} from '@/actions/client-portal/community-locks-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';
import { LOCK_STATUS_VARIANTS, formatCommunityDateTime } from '@/utils/communityFormatUtils';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import Input from '@/components/ui/inputs/Input';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Select from '@/components/ui/inputs/Select';
import SettingsSection from '@/components/ui/sections/SettingsSection';

import type {
  CommunityLock,
  DayOfWeek,
  LockSchedule,
  LockScheduleExceptionType,
  LockScheduleSlotDto,
} from '@/types/client-portal/community';
import type { FetchResponse } from '@/types/responses';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';
import '@/styles/04-components/client-area/community-schedule.scss';

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const EXCEPTION_TYPES: LockScheduleExceptionType[] = ['CLOSED', 'MODIFIED', 'OPEN_ALL_DAY'];
const LOW_BATTERY_THRESHOLD = 20;
/** Horas que se propone liberar por defecto: una mudanza dura una tarde. */
const DEFAULT_RELEASE_HOURS = 4;
/** Tope que impone la API (requisitos-app-comunidad.md, sección 7.7). */
const MAX_RELEASE_HOURS = 24;

interface LockCardProps {
  lock: CommunityLock;
  locale: string;
  schedule: LockSchedule | null;
}

/**
 * Ficha de una cerradura: estado, horario semanal editable, excepciones y
 * liberación temporal. Refleja tres reglas del dominio que, mal representadas,
 * confundirían al usuario: sin tramos la puerta abre siempre (no al revés), un
 * acceso principal no admite modo horario, y con un proveedor que no soporta
 * horarios lo configurado aquí es solo informativo.
 * @param {LockCardProps} props - Cerradura, locale y su horario ya cargado
 * @returns {JSX.Element} La ficha de la cerradura renderizada
 */
export default function LockCard({ lock, locale, schedule }: LockCardProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [slots, setSlots] = useState<LockScheduleSlotDto[]>(
    schedule?.slots.map((slot) => ({
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      label: slot.label ?? undefined,
    })) ?? [],
  );

  const [isExceptionOpen, setIsExceptionOpen] = useState(false);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionType, setExceptionType] = useState<LockScheduleExceptionType>('CLOSED');
  const [exceptionStart, setExceptionStart] = useState('');
  const [exceptionEnd, setExceptionEnd] = useState('');
  const [exceptionReason, setExceptionReason] = useState('');

  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [releaseHours, setReleaseHours] = useState(String(DEFAULT_RELEASE_HOURS));
  const [releaseReason, setReleaseReason] = useState('');

  const parsedReleaseHours = Number(releaseHours);
  const isReleaseHoursValid =
    Number.isFinite(parsedReleaseHours) &&
    parsedReleaseHours > 0 &&
    parsedReleaseHours <= MAX_RELEASE_HOURS;

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

  const hasInvalidSlot = slots.some((slot) => slot.endTime <= slot.startTime);

  const addSlot = () =>
    setSlots([...slots, { dayOfWeek: 'MON', startTime: '08:00', endTime: '20:00' }]);

  const updateSlot = (index: number, patch: Partial<LockScheduleSlotDto>) =>
    setSlots(slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot)));

  const removeSlot = (index: number) => setSlots(slots.filter((_, i) => i !== index));

  return (
    <SettingsSection
      title={lock.name}
      description={lock.communityUnitCode ?? undefined}
      icon={DoorOpenIcon}
      actions={
        <div className="schedule-lock__badges">
          <Badge
            variant={LOCK_STATUS_VARIANTS[lock.status]}
            text={t(`LockStatus.${lock.status}`)}
          />
          {lock.isMainAccess && <Badge variant="info" text={t('Locks.mainAccess')} />}
          {lock.isReleased && <Badge variant="warning" text={t('Locks.released')} />}
        </div>
      }
    >
      <dl className="community-facts">
        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.provider')}</dt>
          <dd className="community-facts__value">{t(`LockProvider.${lock.provider}`)}</dd>
        </div>
        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.connectivity')}</dt>
          <dd className="community-facts__value">
            {t(`LockConnectivity.${lock.connectivity}`)}
          </dd>
        </div>
        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.scheduleMode')}</dt>
          <dd className="community-facts__value">{t(`ScheduleMode.${lock.scheduleMode}`)}</dd>
        </div>
        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.battery')}</dt>
          <dd
            className={`community-facts__value schedule-lock__battery${
              lock.batteryLevel !== null && lock.batteryLevel <= LOW_BATTERY_THRESHOLD
                ? ' schedule-lock__battery--low'
                : ''
            }`}
          >
            <BatteryIcon aria-hidden="true" />
            {lock.batteryLevel !== null ? `${lock.batteryLevel}%` : tCommon('notAvailable')}
          </dd>
        </div>
        <div className="community-facts__item">
          <dt className="community-facts__label">{t('Locks.lastSeen')}</dt>
          <dd className="community-facts__value">
            {formatCommunityDateTime(lock.lastSeenAt, locale, tCommon('notAvailable'))}
          </dd>
        </div>
        {lock.isReleased && (
          <div className="community-facts__item">
            <dt className="community-facts__label">{t('Locks.releasedUntil')}</dt>
            <dd className="community-facts__value">
              {formatCommunityDateTime(lock.releasedUntil, locale, tCommon('notAvailable'))}
            </dd>
          </div>
        )}
      </dl>

      {lock.isScheduleInformationalOnly && (
        <p className="community-notice community-notice--warning">
          <TriangleAlertIcon aria-hidden="true" />
          {t('Locks.informationalOnlyWarning')}
        </p>
      )}

      {lock.isMainAccess && (
        <p className="community-notice">
          <TriangleAlertIcon aria-hidden="true" />
          {t('Locks.mainAccessScheduleWarning')}
        </p>
      )}

      <div className="schedule-editor">
        <strong>{t('Locks.ScheduleSection.title')}</strong>
        <span className="community-form__help">{t('Locks.ScheduleSection.description')}</span>

        {slots.length === 0 && (
          <p className="community-notice">
            <DoorOpenIcon aria-hidden="true" />
            {t('Locks.alwaysOpenNotice')}
          </p>
        )}

        <div className="schedule-editor__slots">
          {slots.map((slot, index) => (
            <div key={index} className="schedule-editor__slot">
              <Select
                id={`${lock.id}-day-${index}`}
                name={`day-${index}`}
                label={t('Locks.ScheduleSection.dayLabel')}
                noTranslate
                placeholder={t('Locks.ScheduleSection.dayPlaceholder')}
                className="select__full"
                value={slot.dayOfWeek}
                onChange={(value) => updateSlot(index, { dayOfWeek: value as DayOfWeek })}
                options={DAYS.map((day) => ({
                  value: day,
                  label: t(`DayOfWeek.${day}`),
                }))}
              />

              <Input
                id={`${lock.id}-start-${index}`}
                name={`slot-start-${index}`}
                type="time"
                label={t('Locks.ScheduleSection.startLabel')}
                noTranslate
                className="input__full"
                value={slot.startTime}
                onChange={(event) => updateSlot(index, { startTime: event.target.value })}
              />

              <Input
                id={`${lock.id}-end-${index}`}
                name={`slot-end-${index}`}
                type="time"
                label={t('Locks.ScheduleSection.endLabel')}
                noTranslate
                className="input__full"
                value={slot.endTime}
                onChange={(event) => updateSlot(index, { endTime: event.target.value })}
              />

              <Input
                id={`${lock.id}-label-${index}`}
                name={`slot-label-${index}`}
                label={t('Locks.ScheduleSection.slotLabel')}
                noTranslate
                placeholder={t('Locks.ScheduleSection.slotPlaceholder')}
                className="input__full"
                value={slot.label ?? ''}
                maxLength={100}
                onChange={(event) => updateSlot(index, { label: event.target.value })}
              />

              <button
                type="button"
                className="schedule-editor__slot-remove"
                aria-label={t('Locks.ScheduleSection.removeSlot')}
                onClick={() => removeSlot(index)}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>

        {hasInvalidSlot && (
          <p className="community-form__error">{t('Locks.ScheduleSection.invalidRange')}</p>
        )}

        <div className="schedule-editor__actions">
          <Button size="sm" variant="outline" title="add" onClick={addSlot}>
            <PlusIcon />
          </Button>
          <Button
            size="sm"
            variant="primary"
            title="save"
            onClick={() => run(() => putLockSchedule(lock.id, slots))}
            disabled={isPending || hasInvalidSlot}
          >
            <SaveIcon />
          </Button>
          {slots.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setSlots([])}>
              {t('Locks.ScheduleSection.clearAll')}
            </Button>
          )}
        </div>
      </div>

      <div className="schedule-editor">
        <strong>{t('Locks.ExceptionsSection.title')}</strong>
        <span className="community-form__help">{t('Locks.ExceptionsSection.description')}</span>

        {schedule && schedule.exceptions.length > 0 ? (
          <div className="community-table__scroll">
            <table className="community-table">
              <thead>
                <tr>
                  <th>{t('Locks.ExceptionsSection.dateLabel')}</th>
                  <th>{t('Locks.ExceptionsSection.typeLabel')}</th>
                  <th>{t('Locks.ExceptionsSection.reasonLabel')}</th>
                  <th aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {schedule.exceptions.map((exception) => (
                  <tr key={exception.id}>
                    <td>{exception.date}</td>
                    <td>
                      {t(`ExceptionType.${exception.type}`)}
                      {exception.type === 'MODIFIED' && exception.modifiedStartTime && (
                        <>
                          {' '}
                          ({exception.modifiedStartTime} – {exception.modifiedEndTime})
                        </>
                      )}
                    </td>
                    <td>
                      {exception.reason ?? <span className="community-table__muted">—</span>}
                    </td>
                    <td>
                      <div className="community-table__actions">
                        <Button
                          size="sm"
                          variant="outline"
                          ariaLabel="delete"
                          onClick={() =>
                            run(() => deleteLockScheduleException(lock.id, exception.id))
                          }
                          disabled={isPending}
                        >
                          <TrashIcon />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="community-empty">{t('Locks.ExceptionsSection.empty')}</p>
        )}

        <div className="schedule-editor__actions">
          <Button
            size="sm"
            variant="outline"
            title="add"
            onClick={() => setIsExceptionOpen(true)}
          >
            <CalendarPlusIcon />
          </Button>

          {lock.isReleased ? (
            <Button
              size="sm"
              variant="outline-danger"
              title="cancelRelease"
              onClick={() => run(() => cancelLockRelease(lock.id))}
              disabled={isPending}
            >
              <XIcon />
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              title="release"
              onClick={() => {
                setReleaseHours(String(DEFAULT_RELEASE_HOURS));
                setReleaseReason('');
                setIsReleaseOpen(true);
              }}
              disabled={isPending}
            >
              <DoorOpenIcon />
            </Button>
          )}
        </div>
      </div>

      {isExceptionOpen && (
        <ModalComponent
          title={t('Locks.ExceptionsSection.addTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setIsExceptionOpen(false)}
          onCancel={() => setIsExceptionOpen(false)}
          onConfirm={() =>
            run(
              () =>
                createLockScheduleException(lock.id, {
                  date: exceptionDate,
                  type: exceptionType,
                  modifiedStartTime:
                    exceptionType === 'MODIFIED' ? exceptionStart || undefined : undefined,
                  modifiedEndTime:
                    exceptionType === 'MODIFIED' ? exceptionEnd || undefined : undefined,
                  reason: exceptionReason || undefined,
                }),
              () => setIsExceptionOpen(false),
            )
          }
          confirmText="create"
          isLoadingText="creating"
          confirmDisabled={!exceptionDate}
        >
          <div className="community-form">
            <div className="form-row form-row--cols-2">
              <div className="community-form__field">
                <Input
                  id={`${lock.id}-exc-date`}
                  name="exceptionDate"
                  type="date"
                  label={t('Locks.ExceptionsSection.dateLabel')}
                  noTranslate
                  className="input__full"
                  value={exceptionDate}
                  onChange={(event) => setExceptionDate(event.target.value)}
                />
                <span className="community-form__help">
                  {t('Locks.ExceptionsSection.dateHelp')}
                </span>
              </div>

              <Select
                id={`${lock.id}-exc-type`}
                name="exceptionType"
                label={t('Locks.ExceptionsSection.typeLabel')}
                noTranslate
                placeholder={t('Locks.ExceptionsSection.typePlaceholder')}
                description={t('Locks.ExceptionsSection.typeHelp')}
                className="select__full"
                value={exceptionType}
                onChange={(value) => setExceptionType(value as LockScheduleExceptionType)}
                options={EXCEPTION_TYPES.map((type) => ({
                  value: type,
                  label: t(`ExceptionType.${type}`),
                }))}
              />

              {exceptionType === 'MODIFIED' && (
                <>
                  <Input
                    id={`${lock.id}-exc-start`}
                    name="exceptionStart"
                    type="time"
                    label={t('Locks.ExceptionsSection.modifiedStartLabel')}
                    noTranslate
                    className="input__full"
                    value={exceptionStart}
                    onChange={(event) => setExceptionStart(event.target.value)}
                  />

                  <Input
                    id={`${lock.id}-exc-end`}
                    name="exceptionEnd"
                    type="time"
                    label={t('Locks.ExceptionsSection.modifiedEndLabel')}
                    noTranslate
                    className="input__full"
                    value={exceptionEnd}
                    onChange={(event) => setExceptionEnd(event.target.value)}
                  />
                </>
              )}
            </div>

            <div className="community-form__field">
              <Input
                id={`${lock.id}-exc-reason`}
                name="exceptionReason"
                label={t('Locks.ExceptionsSection.reasonLabel')}
                noTranslate
                placeholder={t('Locks.ExceptionsSection.reasonPlaceholder')}
                className="input__full"
                value={exceptionReason}
                maxLength={300}
                onChange={(event) => setExceptionReason(event.target.value)}
              />
              <span className="community-form__help">
                {t('Locks.ExceptionsSection.reasonHelp')}
              </span>
            </div>
          </div>
        </ModalComponent>
      )}

      {isReleaseOpen && (
        <ModalComponent
          title={t('Locks.ReleaseSection.releaseTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setIsReleaseOpen(false)}
          onCancel={() => setIsReleaseOpen(false)}
          onConfirm={() =>
            run(
              () =>
                releaseLock(lock.id, {
                  releasedUntil: new Date(
                    Date.now() + parsedReleaseHours * 60 * 60 * 1000,
                  ).toISOString(),
                  reason: releaseReason || undefined,
                }),
              () => setIsReleaseOpen(false),
            )
          }
          confirmText="release"
          isLoadingText="releasing"
          confirmDisabled={!isReleaseHoursValid}
        >
          <div className="community-form">
            <Alert
              type="warning"
              message={t('Locks.ReleaseSection.opensWithoutCredential')}
              className="input__full"
            />

            <div className="community-form__field">
              <Input
                id={`${lock.id}-release-hours`}
                name="releaseHours"
                type="number"
                label={t('Locks.ReleaseSection.hoursLabel')}
                noTranslate
                className="input__full"
                value={releaseHours}
                onChange={(event) => setReleaseHours(event.target.value)}
              />
              <span className="community-form__help">
                {t('Locks.ReleaseSection.hoursHelp')}
              </span>
            </div>

            {!isReleaseHoursValid && (
              <p className="community-form__error">
                {t('Locks.ReleaseSection.maxHours', { max: MAX_RELEASE_HOURS })}
              </p>
            )}

            <div className="community-form__field">
              <Input
                id={`${lock.id}-release-reason`}
                name="releaseReason"
                label={t('Locks.ReleaseSection.reasonLabel')}
                noTranslate
                placeholder={t('Locks.ReleaseSection.reasonPlaceholder')}
                className="input__full"
                value={releaseReason}
                maxLength={300}
                onChange={(event) => setReleaseReason(event.target.value)}
              />
              <span className="community-form__help">
                {t('Locks.ReleaseSection.reasonHelp')}
              </span>
            </div>

            <span className="community-form__help">{t('Locks.ReleaseSection.audited')}</span>
          </div>
        </ModalComponent>
      )}
    </SettingsSection>
  );
}
