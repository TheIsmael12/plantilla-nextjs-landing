'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import {
  createLockSchedule,
  removeLockSchedule,
  updateLockSchedule,
} from '@/actions/client-portal/community-keyrings-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';

import Alert from '@/components/ui/alerts/Alert';
import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import EmptyState from '@/components/ui/errors/EmptyState';
import Input from '@/components/ui/inputs/Input';
import Select from '@/components/ui/inputs/Select';
import TimeRangePicker from '@/components/ui/inputs/TimeRangePicker';
import ModalComponent from '@/components/ui/modals/ModalComponent';

import type { DayOfWeek, LockSchedule } from '@/types/client-portal/community';
import type { FetchResponse } from '@/types/responses';

import '@/styles/04-components/client-area/community-common.scss';

const DAY_OF_WEEK_VALUES: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

/** Un tramo dentro del formulario. */
interface SlotValue {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
}

/**
 * Los tramos en orden de semana, de lunes a domingo y por hora dentro del día.
 *
 * Se reordena al escribir y no solo al guardar: quien cambia el día de una fila espera verla moverse
 * a su sitio.
 * @param {SlotValue[]} slots - Los tramos del formulario
 * @returns {SlotValue[]} Los mismos, ordenados
 */
function inWeekOrder(slots: SlotValue[]): SlotValue[] {
  return [...slots].sort(
    (a, b) =>
      DAY_OF_WEEK_VALUES.indexOf(a.dayOfWeek) - DAY_OF_WEEK_VALUES.indexOf(b.dayOfWeek) ||
      a.startTime.localeCompare(b.startTime),
  );
}

/**
 * Los minutos desde medianoche de un `HH:mm`, para poder comparar dos horas.
 * @param {string} time - La hora
 * @returns {number} Los minutos
 */
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);

  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Qué tramos pisan a otro del mismo día, por posición.
 *
 * Dos tramos que se pisan llegan al fabricante como uno solo más largo, así que se avisa antes de
 * guardar en vez de dejar que la cerradura abra horas que nadie ha decidido.
 * @param {SlotValue[]} slots - Los tramos del formulario
 * @returns {(DayOfWeek | undefined)[]} El día que pisa, por posición, o nada si ese tramo está bien
 */
function overlapping(slots: SlotValue[]): (DayOfWeek | undefined)[] {
  return slots.map((slot, index) => {
    const pisa = slots.some((other, otherIndex) => {
      if (otherIndex >= index || other.dayOfWeek !== slot.dayOfWeek) return false;

      return (
        toMinutes(slot.startTime) < toMinutes(other.endTime) &&
        toMinutes(other.startTime) < toMinutes(slot.endTime)
      );
    });

    return pisa ? slot.dayOfWeek : undefined;
  });
}

/** Valores del formulario de un horario. */
interface ScheduleFormValues {
  name: string;
  slots: SlotValue[];
}

const EMPTY_FORM: ScheduleFormValues = { name: '', slots: [] };

interface SchedulesSectionProps {
  serviceId: string;
  schedules: LockSchedule[];
}

/**
 * Los horarios de la comunidad: franjas día/hora con nombre, reutilizables entre las reglas de
 * permiso de los llaveros. «Zonas comunes» se define una vez y lo usan el gimnasio, la piscina y la
 * sala de reuniones — cambiar la hora de cierre del verano se hace aquí una vez, en vez de puerta por
 * puerta.
 *
 * **Sin franjas no restringe nada**: un horario vacío abre siempre, porque el defecto no puede ser
 * «cerrado» sin dejar a los vecinos en la calle.
 * @param {SchedulesSectionProps} props - Comunidad y sus horarios
 * @returns {JSX.Element} La sección renderizada
 */
export default function SchedulesSection({ serviceId, schedules }: SchedulesSectionProps) {
  const t = useTranslations('Views.ClientArea.Communities.Keyrings.Schedules');
  const tDays = useTranslations('Views.ClientArea.Communities.Keyrings.DayOfWeek');
  const tErrors = useTranslations('Common.Errors');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [editing, setEditing] = useState<LockSchedule | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<LockSchedule | null>(null);

  const openCreate = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (schedule: LockSchedule) => {
    setEditing(schedule);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (values: ScheduleFormValues) => {
    const pisados = overlapping(values.slots).filter(Boolean) as DayOfWeek[];

    if (pisados.length > 0) {
      void notifyResponse(
        { status: 400, message: t('overlapBlocked', { day: tDays(pisados[0]) }) },
        tErrors('unexpectedError'),
      );

      return;
    }

    const payload = { name: values.name.trim(), slots: values.slots };

    const response = editing
      ? await updateLockSchedule(serviceId, editing.id, payload)
      : await createLockSchedule(serviceId, payload);

    void notifyResponse(response, tErrors('unexpectedError'));

    if (response.status === HTTPStatus.OK || response.status === HTTPStatus.CREATED) {
      closeForm();
      router.refresh();
    }
  };

  const handleDelete = () => {
    if (!deleting) return;

    startTransition(async () => {
      const response: FetchResponse<void> = await removeLockSchedule(serviceId, deleting.id);
      void notifyResponse(response, tErrors('unexpectedError'));

      if (response.status === HTTPStatus.OK || response.status === HTTPStatus.NO_CONTENT) {
        setDeleting(null);
        router.refresh();
      }
    });
  };

  return (
    <>
      <div className="community-toolbar">
        <div />
        <div className="community-toolbar__actions">
          <Button title="add" variant="primary" onClick={openCreate}>
            <PlusIcon />
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState title={t('empty')} description={t('emptyDescription')} />
      ) : (
        <div className="community-table__scroll">
          <table className="community-table">
            <thead>
              <tr>
                <th>{t('nameColumn')}</th>
                <th>{t('slotsHeading')}</th>
                <th>{t('usageColumn')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td>
                    <strong>{schedule.name}</strong>
                  </td>
                  <td>
                    {schedule.slots.length === 0
                      ? t('noSlots')
                      : schedule.slots
                          .map((slot) => `${tDays(slot.dayOfWeek)} ${slot.startTime}–${slot.endTime}`)
                          .join(' · ')}
                  </td>
                  <td>
                    {schedule.usedByRules > 0 ? (
                      <Badge variant="info" text={t('usedByRules', { count: schedule.usedByRules })} />
                    ) : (
                      <Badge variant="neutral" text={t('unused')} />
                    )}
                  </td>
                  <td>
                    <div className="community-table__actions">
                      <Button variant="outline" ariaLabel="edit" onClick={() => openEdit(schedule)}>
                        <PencilIcon />
                      </Button>

                      <Button variant="outline" ariaLabel="delete" onClick={() => setDeleting(schedule)}>
                        <Trash2Icon />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isFormOpen && (
        <ModalComponent<ScheduleFormValues>
          title={t(editing ? 'editTitle' : 'createTitle')}
          isOpen
          isLarge
          onClose={closeForm}
          initialValues={{
            name: editing?.name ?? '',
            slots: inWeekOrder(editing?.slots ?? []),
          }}
          onSubmit={handleSubmit}
          submitText="save"
          submittingText="saving"
        >
          {({ values, handleChange, handleBlur, setFieldValue }) => {
            const updateSlot = (index: number, patch: Partial<SlotValue>) => {
              void setFieldValue(
                'slots',
                inWeekOrder(values.slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))),
              );
            };

            const pisados = overlapping(values.slots);

            return (
              <div className="community-form">
                <Input
                  id="schedule-name"
                  name="name"
                  label={t('title')}
                  noTranslate
                  placeholder={t('title')}
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  className="input__full"
                />

                <div className="community-form__field">
                  <div className="community-toolbar">
                    <div>
                      <span className="community-form__label">{t('slotsHeading')}</span>
                      <span className="community-form__help">{t('slotsHelp')}</span>
                    </div>

                    <Button
                      variant="outline"
                      title="add"
                      onClick={() =>
                        void setFieldValue(
                          'slots',
                          inWeekOrder([
                            ...values.slots,
                            { dayOfWeek: 'MON' as DayOfWeek, startTime: '08:00', endTime: '22:00' },
                          ]),
                        )
                      }
                    >
                      <PlusIcon />
                    </Button>
                  </div>

                  {values.slots.length === 0 ? (
                    <Alert type="info" message={t('emptyMeansAlways')} />
                  ) : (
                    values.slots.map((slot, index) => (
                      <div key={`slot-${index}`} className="permission-rule">
                        <Select
                          name={`slot-day-${index}`}
                          label={t('dayLabel')}
                          noTranslate
                          placeholder={t('dayLabel')}
                          options={DAY_OF_WEEK_VALUES.map((day) => ({ value: day, label: tDays(day) }))}
                          value={slot.dayOfWeek}
                          onChange={(value) => updateSlot(index, { dayOfWeek: value as DayOfWeek })}
                          className="select__full"
                        />

                        <TimeRangePicker
                          id={`slot-${index}`}
                          label={t('slotRange')}
                          startTime={slot.startTime}
                          endTime={slot.endTime}
                          onChange={(range) => updateSlot(index, range)}
                          error={
                            pisados[index] ? t('overlaps', { day: tDays(pisados[index] as DayOfWeek) }) : undefined
                          }
                        />

                        <Button
                          variant="outline"
                          ariaLabel="delete"
                          onClick={() =>
                            void setFieldValue(
                              'slots',
                              values.slots.filter((_, i) => i !== index),
                            )
                          }
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          }}
        </ModalComponent>
      )}

      {deleting && (
        <ModalComponent
          title={t('deleteTitle')}
          isOpen
          isLoading={isPending}
          confirmVariant="danger"
          confirmText="delete"
          isLoadingText="deleting"
          onClose={() => setDeleting(null)}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        >
          <p>{t('deleteDescription', { name: deleting.name })}</p>

          {deleting.usedByRules > 0 && (
            <Alert type="warning" message={t('deleteBlocked', { count: deleting.usedByRules })} />
          )}
        </ModalComponent>
      )}
    </>
  );
}
