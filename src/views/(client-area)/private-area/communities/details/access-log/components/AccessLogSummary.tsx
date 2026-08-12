'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { SearchIcon } from 'lucide-react';

import { getLockAccessLog } from '@/actions/client-portal/community-locks-actions';
import { HTTPStatus } from '@/constants/httpStatus';
import { notifyResponse } from '@/utils/toastUtils';
import { ACCESS_RESULT_VARIANTS, formatCommunityDateTime } from '@/utils/communityFormatUtils';
import { toLocalIsoDate } from '@/utils/dateUtils';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import DatePicker from '@/components/ui/inputs/DatePicker';
import ModalComponent from '@/components/ui/modals/ModalComponent';
import Textarea from '@/components/ui/inputs/Textarea';

import type { LockAccessLogEntry, LockAccessSummary } from '@/types/client-portal/community';

import '@/styles/04-components/ui/forms/form-row.scss';
import '@/styles/04-components/client-area/community-common.scss';

const MIN_REASON_LENGTH = 5;
const MAX_REASON_LENGTH = 300;

interface AccessLogSummaryProps {
  summaries: LockAccessSummary[];
  locale: string;
}

/**
 * Resumen agregado de accesos por puerta y, tras justificar el motivo, el
 * detalle nominal de una puerta concreta. El motivo se pide en un modal
 * *antes* de la petición y nunca es opcional: el backend lo exige (5-300
 * caracteres) y deja constancia de quién consultó qué y por qué.
 * @param {AccessLogSummaryProps} props - Resumen ya cargado en servidor y locale
 * @returns {JSX.Element} Las tarjetas de resumen y el detalle bajo demanda
 */
export default function AccessLogSummary({ summaries, locale }: AccessLogSummaryProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const [isPending, startTransition] = useTransition();

  const [target, setTarget] = useState<LockAccessSummary | null>(null);
  const [reason, setReason] = useState('');
  const [from, setFrom] = useState<Date | null>(null);
  const [to, setTo] = useState<Date | null>(null);
  const [entries, setEntries] = useState<LockAccessLogEntry[] | null>(null);
  const [detailFor, setDetailFor] = useState<LockAccessSummary | null>(null);

  const isReasonValid =
    reason.trim().length >= MIN_REASON_LENGTH && reason.trim().length <= MAX_REASON_LENGTH;

  const handleConsult = () => {
    if (!target || !isReasonValid) return;

    startTransition(async () => {
      const response = await getLockAccessLog(target.lockId, {
        reason: reason.trim(),
        // El filtro elige días, no momentos exactos: se busca desde el
        // primer instante del día de inicio hasta el último del día final.
        from: from ? `${toLocalIsoDate(from)}T00:00:00.000Z` : undefined,
        to: to ? `${toLocalIsoDate(to)}T23:59:59.999Z` : undefined,
      });

      if (response.status === HTTPStatus.OK) {
        setEntries(response.data ?? []);
        setDetailFor(target);
        setTarget(null);
        setReason('');
        setFrom(null);
        setTo(null);
        return;
      }

      notifyResponse(response, t('loadError'));
    });
  };

  return (
    <>
      <div className="community-card__grid">
        {summaries.map((summary) => (
          <article key={summary.lockId} className="community-card">
            <h2 className="community-card__title">{summary.lockName}</h2>

            <div className="community-card__stats">
              <div className="community-card__stat">
                <span className="community-card__stat-value">{summary.granted}</span>
                <span className="community-card__stat-label">{t('AccessLog.granted')}</span>
              </div>
              <div className="community-card__stat">
                <span className="community-card__stat-value">{summary.denied}</span>
                <span className="community-card__stat-label">{t('AccessLog.denied')}</span>
              </div>
              <div className="community-card__stat">
                <span className="community-card__stat-value">{summary.deniedBySchedule}</span>
                <span className="community-card__stat-label">
                  {t('AccessLog.deniedBySchedule')}
                </span>
              </div>
            </div>

            <div className="community-facts__item">
              <span className="community-facts__label">{t('AccessLog.lastAccessAt')}</span>
              <span className="community-facts__value">
                {formatCommunityDateTime(summary.lastAccessAt, locale, tCommon('notAvailable'))}
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              title="viewDetail"
              onClick={() => {
                setTarget(summary);
                setReason('');
              }}
              disabled={isPending}
            >
              <SearchIcon />
            </Button>
          </article>
        ))}
      </div>

      {target && (
        <ModalComponent
          title={t('AccessLog.reasonTitle')}
          isOpen
          isLoading={isPending}
          onClose={() => setTarget(null)}
          onCancel={() => setTarget(null)}
          onConfirm={handleConsult}
          confirmText="consult"
          isLoadingText="consulting"
          confirmDisabled={!isReasonValid}
        >
          <div className="community-form">
            <p>{t('AccessLog.reasonDescription')}</p>

            <div className="community-form__field">
              <Textarea
                id="access-reason"
                name="reason"
                label={t('AccessLog.reasonLabel')}
                noTranslate
                value={reason}
                maxLength={MAX_REASON_LENGTH}
                placeholder={t('AccessLog.reasonPlaceholder')}
                onChange={(event) => setReason(event.target.value)}
              />
              {!isReasonValid && reason.length > 0 && (
                <span className="community-form__error">{t('AccessLog.reasonTooShort')}</span>
              )}
            </div>

            <div className="form-row form-row--cols-2">
              <DatePicker
                id="access-from"
                name="from"
                label={t('AccessLog.fromLabel')}
                value={from}
                onChange={setFrom}
                maxDate={to ?? undefined}
                disableFuture
                clearable
                className="date-picker__full"
              />

              <DatePicker
                id="access-to"
                name="to"
                label={t('AccessLog.toLabel')}
                value={to}
                onChange={setTo}
                minDate={from ?? undefined}
                disableFuture
                clearable
                className="date-picker__full"
              />
            </div>
          </div>
        </ModalComponent>
      )}

      {entries && detailFor && (
        <ModalComponent
          title={t('AccessLog.detailTitle', { lock: detailFor.lockName })}
          isOpen
          isLarge
          onClose={() => {
            setEntries(null);
            setDetailFor(null);
          }}
        >
          {entries.length > 0 ? (
            <div className="community-table__scroll">
              <table className="community-table">
                <thead>
                  <tr>
                    <th>{t('AccessLog.occurredAtColumn')}</th>
                    <th>{t('AccessLog.residentColumn')}</th>
                    <th>{t('AccessLog.credentialColumn')}</th>
                    <th>{t('AccessLog.methodColumn')}</th>
                    <th>{t('AccessLog.resultColumn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        {formatCommunityDateTime(
                          entry.occurredAt,
                          locale,
                          tCommon('notAvailable'),
                        )}
                        {entry.isOccurredAtApproximate && (
                          <>
                            <br />
                            <span className="community-table__muted">
                              {t('AccessLog.approximateTime')}
                            </span>
                          </>
                        )}
                      </td>
                      <td>
                        {entry.residentName ?? (
                          <span className="community-table__muted">
                            {t('Incidents.unknownResident')}
                          </span>
                        )}
                      </td>
                      <td>
                        {entry.credentialLabel ?? (
                          <span className="community-table__muted">—</span>
                        )}
                      </td>
                      <td>{t(`AccessMethod.${entry.method}`)}</td>
                      <td>
                        <Badge
                          variant={ACCESS_RESULT_VARIANTS[entry.result]}
                          text={t(`AccessResult.${entry.result}`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="community-empty">{t('AccessLog.detailEmpty')}</p>
          )}
        </ModalComponent>
      )}
    </>
  );
}
