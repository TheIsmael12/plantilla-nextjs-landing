'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { DownloadIcon, RotateCwIcon } from 'lucide-react';

import { getCommunityAccessLog } from '@/actions/client-portal/community-locks-actions';
import { isErrorStatus } from '@/utils/httpStatusUtils';
import { notifyResponse } from '@/utils/toastUtils';
import { ACCESS_RESULT_VARIANTS, formatCommunityDateTime } from '@/utils/communityFormatUtils';
import { downloadFile } from '@/utils/fileDownloadUtils';
import { toLocalIsoDate } from '@/utils/dateUtils';

import Badge from '@/components/ui/buttons/Badge';
import Button from '@/components/ui/buttons/Button';
import List from '@/components/ui/lists/List';
import ListItem from '@/components/ui/lists/ListItem';

import type {
  CommunityLock,
  LockAccessLogEntry,
  LockAccessResult,
  LockAccessSummary,
} from '@/types/client-portal/community';
import type { Filter, FilterValue, FilterValues } from '@/types/ui/tables/table';

import '@/styles/04-components/client-area/client-list.scss';
import '@/styles/04-components/client-area/community-common.scss';

const ENTRIES_PER_PAGE = 25;

/** Resultados por los que se puede filtrar, en el orden en que se buscan. */
const RESULT_OPTIONS: LockAccessResult[] = [
  'GRANTED',
  'GRANTED_BYPASS',
  'DENIED_UNKNOWN',
  'DENIED_EXPIRED',
  'DENIED_LOCK_SCHEDULE',
  'DENIED_CREDENTIAL_SCHEDULE',
  'DENIED_LOCK_DISABLED',
  'ERROR',
];

/** Los filtros vacíos, que son también con los que se entra. */
const EMPTY_FILTERS: FilterValues = { lockId: '', result: '', from: '', to: '' };

interface AccessLogSummaryProps {
  serviceId: string;
  summaries: LockAccessSummary[];
  locks: CommunityLock[];
  locale: string;
}

/**
 * El resumen por puerta y, debajo, el historial de aperturas de la comunidad.
 *
 * **Ya no se pide motivo**, igual que en la intranet. Se exigía escribir uno de cinco letras antes de enseñar
 * una sola fila, y eso no protegía nada: quien entra en esta pantalla lo mira igual, y lo único que
 * conseguía era que se escribiera «revisión» cuarenta veces. La consulta **se sigue auditando** en el
 * servidor, que es lo que de verdad deja rastro de quién ha mirado.
 *
 * Y la puerta pasa a ser un filtro más, no la condición para ver algo: la pregunta que trae aquí casi nunca
 * es «qué ha pasado en el garaje», es «qué ha pasado esta noche», y con una consulta por puerta eso obligaba
 * a repetirla seis veces y ordenar a ojo.
 * @param {AccessLogSummaryProps} props - Comunidad, resumen ya cargado, puertas y locale
 * @returns {JSX.Element} El resumen y el historial
 */
export default function AccessLogSummary({
  serviceId,
  summaries,
  locks,
  locale,
}: AccessLogSummaryProps) {
  const t = useTranslations('Views.ClientArea.Communities');
  const tCommon = useTranslations('Views.ClientArea.Common');

  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState<FilterValues>(EMPTY_FILTERS);
  const [entries, setEntries] = useState<LockAccessLogEntry[]>([]);

  /** Un filtro tal como lo espera la API: siempre texto, nunca un `Date` ni una lista. */
  const asText = (value: FilterValue): string =>
    typeof value === 'string' ? value : value instanceof Date ? toLocalIsoDate(value) : '';

  const load = useCallback(() => {
    const lockId = asText(filterValues.lockId);
    const result = asText(filterValues.result);
    const from = asText(filterValues.from);
    const to = asText(filterValues.to);

    startTransition(async () => {
      const response = await getCommunityAccessLog(serviceId, {
        lockId: lockId || undefined,
        // El filtro elige días, no momentos: desde el primer instante del día hasta el último del final.
        from: from ? `${from}T00:00:00` : undefined,
        to: to ? `${to}T23:59:59` : undefined,
        result: (result as LockAccessResult) || undefined,
        search: search.trim() || undefined,
      });

      if (isErrorStatus(response.status)) {
        notifyResponse(response, t('AccessLog.loadError'));

        return;
      }

      setEntries(response.data ?? []);
    });
    // `t` no cambia entre renders; incluirlo recargaría el registro sin motivo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId, filterValues, search]);

  /*
   * Se carga solo y se recarga al cambiar un filtro.
   *
   * Es lo que convierte esto en un historial en vez de un formulario: no hay nada que enviar, se mira. El
   * botón que queda es el de recargar, para cuando se está esperando a que entre alguien.
   */
  useEffect(load, [load]);

  const filters: Filter[] = [
    {
      key: 'lockId',
      type: 'select',
      label: t('AccessLog.lockLabel'),
      options: [
        { value: '', label: t('AccessLog.allLocks') },
        ...locks.map((lock) => ({ value: lock.id, label: lock.name })),
      ],
    },
    {
      key: 'result',
      type: 'select',
      label: t('AccessLog.resultLabel'),
      options: [
        { value: '', label: t('AccessLog.anyResult') },
        ...RESULT_OPTIONS.map((value) => ({ value, label: t(`AccessResult.${value}`) })),
      ],
    },
    {
      key: 'from',
      type: 'date',
      label: t('AccessLog.from'),
      maxDate: asText(filterValues.to) || undefined,
      disableFuture: true,
    },
    {
      key: 'to',
      type: 'date',
      label: t('AccessLog.to'),
      minDate: asText(filterValues.from) || undefined,
      disableFuture: true,
    },
  ];

  /** Quién abrió, con la mejor identificación que haya de la apertura. */
  const openedBy = (entry: LockAccessLogEntry) =>
    entry.residentName ??
    entry.credentialLabel ??
    entry.openedByLabel ??
    t('AccessLog.unidentified');

  /**
   * Se lleva el historial a una hoja de cálculo.
   *
   * Sale en CSV con `;` y con marca de orden de bytes, que es lo que Excel abre de un doble clic en un
   * Windows en español: con `,` mete todo en una columna, y sin la marca destroza los acentos. No se genera
   * un `.xlsx` de verdad porque eso pide una dependencia entera para lo mismo.
   */
  const handleExport = () => {
    const cabecera = [
      t('AccessLog.csvDate'),
      t('AccessLog.csvLock'),
      t('AccessLog.csvWho'),
      t('AccessLog.csvMethod'),
      t('AccessLog.csvResult'),
    ];

    /** Un valor listo para una celda: sin `;` ni saltos que rompan la fila. */
    const celda = (valor: string) => `"${valor.replace(/"/g, '""')}"`;

    const filas = entries.map((entry) =>
      [
        formatCommunityDateTime(entry.occurredAt, locale, tCommon('notAvailable')),
        entry.lockName,
        openedBy(entry),
        t(`AccessMethod.${entry.method}`),
        t(`AccessResult.${entry.result}`),
      ]
        .map(celda)
        .join(';'),
    );

    downloadFile(
      `${t('AccessLog.csvFileName')}.csv`,
      `﻿${[cabecera.map(celda).join(';'), ...filas].join('\r\n')}`,
      'text/csv',
    );
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
          </article>
        ))}
      </div>

      <section className="community-section">
        <h2 className="community-section__title">{t('AccessLog.historyTitle')}</h2>
        <p className="community-muted">{t('AccessLog.historyDescription')}</p>

        <List
          items={entries}
          getItemId={(entry) => entry.id}
          ariaLabel={t('AccessLog.historyTitle')}
          initialPageSize={ENTRIES_PER_PAGE}
          searchable
          searchPlaceholder={t('AccessLog.searchPlaceholder')}
          /* El backend es quien filtra y busca: aquí solo se pagina lo que ha contestado. */
          manualFiltering
          globalFilter={search}
          onSearchChange={setSearch}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={(key, value) =>
            setFilterValues((previous) => ({ ...previous, [key]: asText(value) }))
          }
          onClearAll={() => setFilterValues(EMPTY_FILTERS)}
          isLoading={isPending}
          emptyMessage={t('AccessLog.empty')}
          toolbarActions={
            <>
              <Button
                variant="outline"
                title={isPending ? 'loading' : 'refresh'}
                onClick={load}
                disabled={isPending}
              >
                <RotateCwIcon />
              </Button>

              <Button
                variant="primary"
                title="export"
                onClick={handleExport}
                disabled={entries.length === 0}
              >
                <DownloadIcon />
              </Button>
            </>
          }
          renderItem={(entry) => (
            <ListItem
              /*
                Quién abrió va de título porque es la pregunta que trae a nadie hasta aquí.
                Cuando no es un vecino —el administrador desde el panel del fabricante, un instalador— el
                fabricante sí dice de dónde vino, y eso se enseña: «sin identificar» a secas suena a fallo y
                deja pensando que el registro está roto cuando no lo está.
              */
              title={openedBy(entry)}
              subtitle={`${entry.lockName} · ${t(`AccessMethod.${entry.method}`)} · ${formatCommunityDateTime(entry.occurredAt, locale, tCommon('notAvailable'))}`}
              badge={
                <>
                  <Badge
                    variant={ACCESS_RESULT_VARIANTS[entry.result]}
                    text={t(`AccessResult.${entry.result}`)}
                  />

                  {/* Que no sea un vecino se dice, para que nadie lo tome por uno. */}
                  {!entry.residentName && entry.openedByLabel && (
                    <Badge variant="neutral" text={t('AccessLog.notAResident')} />
                  )}

                  {entry.isOccurredAtApproximate && (
                    <Badge variant="warning" text={t('AccessLog.approximateTime')} />
                  )}
                </>
              }
            />
          )}
        />

        <p className="community-muted">{t('AccessLog.buttonHasNoIdentity')}</p>
        <p className="community-muted">{t('AccessLog.physicalKeyLeavesNoTrace')}</p>
      </section>
    </>
  );
}
