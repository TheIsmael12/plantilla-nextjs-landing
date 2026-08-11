'use client';

import { useMemo } from 'react';

import { useTranslations } from 'next-intl';

import Chart from '@/components/ui/charts/Chart';

import { INCIDENT_STATUS_ORDER } from '@/utils/communityFormatUtils';

import type { CommunityIncident, LockAccessSummary } from '@/types/client-portal/community';

import '@/styles/04-components/client-area/community-home.scss';

/** Cuántos meses del pasado entran en la línea de incidencias. */
const MONTHS = 6;

interface CommunityDashboardProps {
  incidents: CommunityIncident[];
  accessSummaries: LockAccessSummary[];
  locale: string;
}

/**
 * Los meses del periodo, del más antiguo al actual, con su etiqueta ya escrita en el idioma activo.
 * @param {string} locale - Idioma activo
 * @param {number} count - Cuántos meses
 * @returns {{key: string, label: string}[]} Un elemento por mes, en orden cronológico
 */
function lastMonths(locale: string, count: number): { key: string; label: string }[] {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat(locale, { month: 'short' });

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);

    return {
      // Clave por año y mes, no solo por mes: seis meses pueden cruzar el cambio de año.
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: formatter.format(date),
    };
  });
}

/**
 * Los gráficos de la portada de la comunidad, sobre los datos que el portal ya puede leer.
 *
 * Tres preguntas, tres gráficos, y ninguno inventa una escala: el reparto por estado dice si hay cosas
 * atascadas, el de tipos dice de qué se queja el edificio, y la línea por mes dice si eso va a más o a menos.
 * Todos parten de **la misma lista de incidencias** que se cuenta en las tarjetas de arriba, así que las
 * cifras no se pueden contradecir entre sí.
 *
 * El cuarto —los accesos por puerta— solo se pinta si hay alguna apertura registrada. Con todo a cero, un
 * gráfico de barras vacías parece un fallo de carga; un texto que dice que no hay aperturas es la verdad.
 * @param {CommunityDashboardProps} props - Incidencias y resumen de accesos ya cargados, y el locale
 * @returns {JSX.Element} Los gráficos del panel
 */
export default function CommunityDashboard({
  incidents,
  accessSummaries,
  locale,
}: CommunityDashboardProps) {
  const t = useTranslations('Views.ClientArea.Communities.Home');
  const tStatus = useTranslations('Views.ClientArea.Communities.IncidentStatus');

  /** Reparto por estado, en el orden del ciclo de vida y sin los estados que no tiene nadie. */
  const byStatus = useMemo(() => {
    const counts = INCIDENT_STATUS_ORDER.map((status) => ({
      status,
      label: tStatus(status),
      value: incidents.filter((incident) => incident.status === status).length,
    })).filter((entry) => entry.value > 0);

    return {
      categories: counts.map((entry) => entry.label),
      values: counts.map((entry) => entry.value),
    };
  }, [incidents, tStatus]);

  /**
   * Reparto por tipo, de más a menos.
   *
   * Se agrupa por `typeName` —el nombre del catálogo— y no por el código: el catálogo de tipos lo configura
   * cada instalación, así que el código no tiene traducción fija y el nombre ya viene resuelto.
   */
  const byType = useMemo(() => {
    const counts = new Map<string, number>();

    for (const incident of incidents) {
      const name = incident.typeName ?? incident.type;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }

    const sorted = [...counts.entries()].sort(([, a], [, b]) => b - a);

    return {
      categories: sorted.map(([name]) => name),
      values: sorted.map(([, value]) => value),
    };
  }, [incidents]);

  /** Cuántas se abrieron cada mes del periodo. */
  const byMonth = useMemo(() => {
    const months = lastMonths(locale, MONTHS);
    const counts = new Map(months.map((month) => [month.key, 0]));

    for (const incident of incidents) {
      const date = new Date(incident.createdAt);
      const key = `${date.getFullYear()}-${date.getMonth()}`;

      // Solo las del periodo: una incidencia de hace un año no cabe en la línea y no debe sumarse a nada.
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return {
      categories: months.map((month) => month.label),
      values: months.map((month) => counts.get(month.key) ?? 0),
    };
  }, [incidents, locale]);

  /** El reparto de accesos por puerta, y si merece la pena pintarlo. */
  const access = useMemo(() => {
    const total = accessSummaries.reduce(
      (sum, summary) => sum + summary.granted + summary.denied + summary.deniedBySchedule,
      0,
    );

    return {
      hasData: total > 0,
      categories: accessSummaries.map((summary) => summary.lockName),
      granted: accessSummaries.map((summary) => summary.granted),
      denied: accessSummaries.map((summary) => summary.denied),
      bySchedule: accessSummaries.map((summary) => summary.deniedBySchedule),
    };
  }, [accessSummaries]);

  /** Sin una sola incidencia no hay tres gráficos vacíos que pintar, sino una frase que decir. */
  if (incidents.length === 0 && !access.hasData) {
    return <p className="community-home__empty">{t('chartsEmpty')}</p>;
  }

  return (
    <div className="community-home__charts">
      {incidents.length > 0 && (
        <article className="community-home__chart">
          <h3 className="community-home__chart-title">{t('chartStatusTitle')}</h3>
          <p className="community-home__chart-hint">{t('chartStatusHint')}</p>

          {/* Anillo y no tarta: el hueco central deja sitio a la leyenda y se comparan mejor los sectores. */}
          <Chart
            type="donut"
            height={260}
            categories={byStatus.categories}
            series={[{ name: t('chartStatusSeries'), data: byStatus.values }]}
            ariaLabel={t('chartStatusTitle')}
          />
        </article>
      )}

      {incidents.length > 0 && (
        <article className="community-home__chart">
          <h3 className="community-home__chart-title">{t('chartTypeTitle')}</h3>
          <p className="community-home__chart-hint">{t('chartTypeHint')}</p>

          {/* Horizontal: los nombres del catálogo son largos y en vertical se giran y no se leen. */}
          <Chart
            type="bar"
            horizontal
            height={260}
            categories={byType.categories}
            series={[{ name: t('chartTypeSeries'), data: byType.values }]}
            ariaLabel={t('chartTypeTitle')}
          />
        </article>
      )}

      {incidents.length > 0 && (
        <article className="community-home__chart community-home__chart--wide">
          <h3 className="community-home__chart-title">{t('chartMonthTitle', { months: MONTHS })}</h3>
          <p className="community-home__chart-hint">{t('chartMonthHint')}</p>

          <Chart
            type="line"
            height={260}
            categories={byMonth.categories}
            series={[{ name: t('chartMonthSeries'), data: byMonth.values }]}
            ariaLabel={t('chartMonthTitle', { months: MONTHS })}
          />
        </article>
      )}

      {access.hasData && (
        <article className="community-home__chart community-home__chart--wide">
          <h3 className="community-home__chart-title">{t('chartAccessTitle')}</h3>
          <p className="community-home__chart-hint">{t('chartAccessHint')}</p>

          {/*
            Apilado: lo que interesa de una puerta es el reparto entre lo que abrió y lo que no, y apilando
            se lee de un vistazo el total y a la vez qué parte se denegó.
          */}
          <Chart
            type="bar"
            stacked
            height={260}
            categories={access.categories}
            series={[
              { name: t('chartAccessGranted'), data: access.granted },
              { name: t('chartAccessDenied'), data: access.denied },
              { name: t('chartAccessBySchedule'), data: access.bySchedule },
            ]}
            ariaLabel={t('chartAccessTitle')}
          />
        </article>
      )}
    </div>
  );
}
