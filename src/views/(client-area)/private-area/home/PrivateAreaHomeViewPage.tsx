import { getTranslations } from 'next-intl/server';

import {
  AlarmClockIcon,
  BriefcaseIcon,
  BuildingIcon,
  FileTextIcon,
  TriangleAlertIcon,
  WalletIcon,
} from 'lucide-react';

import { getClientCommunities } from '@/actions/client-portal/communities-actions';
import { getIncidentCounters } from '@/actions/client-portal/community-incidents-actions';
import { getCommunityIncidents } from '@/actions/client-portal/community-incidents-actions';
import { getClientInvoiceSummary, getClientInvoices } from '@/actions/client-portal/invoices-actions';
import { getClientQuotes } from '@/actions/client-portal/quotes-actions';
import { getClientServices } from '@/actions/client-portal/services-actions';

import Card from '@/components/ui/cards/Card';
import StatCard from '@/components/ui/cards/StatCard';
import DashboardBillingCard from '@/views/(client-area)/private-area/home/components/DashboardBillingCard';
import DashboardIncidentsCard from '@/views/(client-area)/private-area/home/components/DashboardIncidentsCard';
import DashboardList from '@/views/(client-area)/private-area/home/components/DashboardList';

import { Link, resolveDetailHref, resolveTemplateHref } from '@/i18n/navigation';

import { formatBillingAmount, formatBillingDate } from '@/utils/billingFormatUtils';

import type { DashboardListRow } from '@/views/(client-area)/private-area/home/components/DashboardList';

import '@/styles/04-components/ui/cards/card.scss';
import '@/styles/04-components/ui/cards/stat-card.scss';
import '@/styles/04-components/client-area/dashboard.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

/** Cuántas filas se enseñan en cada lista del panel: lo justo para ver si hay algo que atender. */
const LIST_SIZE = 5;

interface PrivateAreaHomeViewPageProps {
  locale: string;
}

/**
 * El panel de inicio del área de cliente.
 *
 * Antes eran cuatro tarjetas de enlace —perfil, servicios, presupuestos, facturas— que repetían lo que ya
 * dice la barra de navegación de arriba. Un panel que solo enlaza a donde ya se puede ir con un clic no
 * aporta nada: lo que hace falta es que **al entrar se vea si hay algo que atender**.
 *
 * El orden va de lo urgente a lo informativo, que es el orden en que se leen las cosas:
 *
 * 1. **Cuatro cifras**: lo que se debe, si hay algo vencido, si hay presupuestos esperando respuesta y
 *    cuántas incidencias están abiertas. El color solo se enciende cuando el número pide atención — un panel
 *    con todo en rojo y verde deja de distinguir lo que importa.
 * 2. **Dos gráficos**: la facturación del año y en qué punto están las incidencias.
 * 3. **Tres listas accionables**: presupuestos por responder (que es lo único que aquí se le pide al
 *    cliente), facturas sin pagar y últimas incidencias. Cada fila lleva a su detalle.
 * 4. **Las comunidades**, si tiene: son la puerta a su propia gestión de vecinos y llaves.
 *
 * **Todo se pide aquí, en el servidor, y en paralelo.** Una portada que hace siete peticiones desde el
 * navegador tarda siete veces en estar lista; y si alguna falla, esa pieza no se pinta y el resto sigue en
 * pie, porque un panel a medias es infinitamente mejor que una pantalla de error.
 * @param {PrivateAreaHomeViewPageProps} props - Locale activo, para fechas e importes
 * @returns {Promise<JSX.Element>} El panel del área de cliente renderizado
 */
export default async function PrivateAreaHomeViewPage({ locale }: PrivateAreaHomeViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Home');
  const tDash = await getTranslations('Views.ClientArea.Home.Dashboard');
  const tCommon = await getTranslations('Views.ClientArea.Common');
  const tQuotes = await getTranslations('Views.ClientArea.Quotes');
  const tInvoices = await getTranslations('Views.ClientArea.Invoices');
  const tCommunities = await getTranslations('Views.ClientArea.Communities');
  const tCounters = await getTranslations('Views.ClientArea.Communities.Incidents.counters');

  const [invoiceSummary, incidentCounters, quotes, unpaidInvoices, incidents, services, communities] =
    await Promise.all([
      getClientInvoiceSummary(),
      getIncidentCounters(),
      // Solo los que esperan una respuesta suya: es lo único que el panel le pide hacer.
      getClientQuotes({ status: 'SENT', limit: LIST_SIZE }),
      getClientInvoices({ status: 'OVERDUE', limit: LIST_SIZE }),
      getCommunityIncidents({ status: 'EN_CURSO', limit: LIST_SIZE }),
      getClientServices({ status: 'ACTIVE', limit: 1 }),
      getClientCommunities(),
    ]);

  const summary = invoiceSummary.data;
  const counters = incidentCounters.data;

  const money = (value: number) =>
    formatBillingAmount(value, summary?.currency ?? 'EUR', locale, tCommon('notAvailable'));

  const quoteRows: DashboardListRow[] = (quotes.data?.items ?? []).map((quote) => ({
    id: quote.id,
    primary: quote.quoteCode,
    secondary: tQuotes('validUntil') + ': ' + formatBillingDate(quote.validUntil, locale, tCommon('notAvailable')),
    badgeText: tQuotes(`Status.${quote.status}`),
    badgeVariant: 'info',
    href: resolveDetailHref('/private-area/quotes/[id]', quote.id),
  }));

  const invoiceRows: DashboardListRow[] = (unpaidInvoices.data?.items ?? []).map((invoice) => ({
    id: invoice.id,
    primary: invoice.fullNumber ?? tInvoices('noNumber'),
    secondary:
      tInvoices('dueDate') + ': ' + formatBillingDate(invoice.dueDate, locale, tCommon('notAvailable')),
    badgeText: tInvoices(`Status.${invoice.status}`),
    badgeVariant: 'danger',
    href: resolveDetailHref('/private-area/invoices/[id]', invoice.id),
  }));

  const incidentRows: DashboardListRow[] = (incidents.data?.items ?? []).map((incident) => ({
    id: incident.id,
    primary: incident.title,
    secondary: incident.code,
    badgeText: tCommunities(`IncidentStatus.${incident.status}`),
    badgeVariant: incident.isOverdue ? 'danger' : 'pending',
    href: resolveDetailHref('/private-area/incidents/[id]', incident.id),
  }));

  return (
    <>
      <ViewHeader title={t('title')} description={tDash('description')} />

      <div className="dashboard__stats">
        <StatCard
          label={tDash('pendingAmount')}
          value={money(summary?.pendingAmount ?? 0)}
          description={
            (summary?.unpaid ?? 0) > 0
              ? tDash('unpaidCount', { count: summary?.unpaid ?? 0 })
              : tDash('allPaid')
          }
          icon={WalletIcon}
          variant={(summary?.pendingAmount ?? 0) > 0 ? 'warning' : 'success'}
        />
        <StatCard
          label={tDash('overdueInvoices')}
          value={String(summary?.overdue ?? 0)}
          icon={AlarmClockIcon}
          variant={(summary?.overdue ?? 0) === 0 ? 'neutral' : 'danger'}
        />
        <StatCard
          label={tDash('quotesToAnswer')}
          value={String(quotes.data?.pagination.totalItems ?? 0)}
          description={
            (quotes.data?.pagination.totalItems ?? 0) > 0 ? tDash('quotesToAnswerHint') : undefined
          }
          icon={FileTextIcon}
          variant={(quotes.data?.pagination.totalItems ?? 0) > 0 ? 'info' : 'neutral'}
        />
        <StatCard
          label={tCounters('open')}
          value={String(counters?.open ?? 0)}
          description={
            (counters?.overdue ?? 0) > 0
              ? tDash('incidentsOverdueHint', { count: counters?.overdue ?? 0 })
              : undefined
          }
          icon={TriangleAlertIcon}
          variant={(counters?.overdue ?? 0) > 0 ? 'danger' : (counters?.open ?? 0) > 0 ? 'info' : 'neutral'}
        />
      </div>

      {/*
        Cada bloque en una `Card` del sistema de diseño, no en una sección con clases propias.
        El texto de apoyo va dentro del contenido y no como subtítulo de la tarjeta —`Card` no tiene
        descripción— igual que en el panel de la intranet.
      */}
      <div className="dashboard__row">
        {summary && (
          <Card title={tDash('billingTitle')} className="dashboard__panel">
            <p className="dashboard__panel-hint">{tDash('billingHint')}</p>
            <DashboardBillingCard monthly={summary.monthly} currency={summary.currency} />
          </Card>
        )}

        {counters && (
          <Card title={tDash('incidentsTitle')} className="dashboard__panel">
            <p className="dashboard__panel-hint">{tDash('incidentsHint')}</p>
            <DashboardIncidentsCard counters={counters} />
          </Card>
        )}
      </div>

      <div className="dashboard__row dashboard__row--thirds">
        <DashboardList
          title={tDash('quotesTitle')}
          emptyMessage={tDash('quotesEmpty')}
          rows={quoteRows}
          allHref="/private-area/quotes"
        />
        <DashboardList
          title={tDash('invoicesTitle')}
          emptyMessage={tDash('invoicesEmpty')}
          rows={invoiceRows}
          allHref="/private-area/invoices"
        />
        <DashboardList
          title={tDash('incidentsListTitle')}
          emptyMessage={tDash('incidentsListEmpty')}
          rows={incidentRows}
          allHref="/private-area/incidents"
        />
      </div>

      {/*
        Los accesos del pie, y solo los que no están en la barra de arriba.
        «Mis servicios» sí está, pero con el número de contratos activos dice algo que la barra no dice.
      */}
      <div className="dashboard__shortcuts">
        <Link href="/private-area/services" className="dashboard__shortcut">
          <BriefcaseIcon aria-hidden="true" />
          <span>
            <strong>{tDash('servicesShortcut')}</strong>
            {tDash('servicesCount', { count: services.data?.pagination.totalItems ?? 0 })}
          </span>
        </Link>

        {(communities.data ?? []).map((community) => (
          <Link
            key={community.serviceId}
            /* `resolveTemplateHref` y no `resolveDetailHref`: esta ruta nombra su parámetro `serviceId`,
               y el ayudante de detalle solo sabe rellenar `[id]`. */
            href={resolveTemplateHref('/private-area/communities/[serviceId]', {
              serviceId: community.serviceId,
            })}
            className="dashboard__shortcut"
          >
            <BuildingIcon aria-hidden="true" />
            <span>
              <strong>{community.serviceName}</strong>
              {tDash('communityCount', { count: community.residents })}
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
