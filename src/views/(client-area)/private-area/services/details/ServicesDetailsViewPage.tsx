import { getTranslations } from 'next-intl/server';
import { ArrowLeftIcon, BriefcaseIcon, FileDownIcon } from 'lucide-react';

import {
  getClientServiceDetail,
  getClientServicePriceRevisions,
  getClientServiceQuotes,
} from '@/actions/client-portal/services-actions';
import { formatBillingAmount, formatBillingDate } from '@/utils/billingFormatUtils';

import Badge from '@/components/ui/buttons/Badge';
import BreadcrumbLabel from '@/components/ui/navigations/BreadcrumbLabel';
import LocationMap from '@/components/ui/maps/LocationMap';
import SettingsSection from '@/components/ui/sections/SettingsSection';
import { Link, resolveDetailHref, resolveHref } from '@/i18n/navigation';
import { formatServiceAddress } from '@/utils/addressFormatUtils';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type {
  ClientServiceStatus,
  PriceRevisionStatus,
  TaskStatus,
} from '@/types/client-portal/services';

import '@/styles/04-components/client-area/service-detail.scss';
import '@/styles/04-components/client-area/client-detail.scss';
import '@/styles/04-components/client-area/client-list.scss';
import ViewHeader from '@/views/(client-area)/private-area/components/ViewHeader';

// El detalle no expone la divisa del contrato (no viene en el DTO redactado),
// así que los importes se formatean en la divisa por defecto de la empresa.
const DEFAULT_CURRENCY = 'EUR';

const STATUS_VARIANTS: Record<ClientServiceStatus, BadgeVariant> = {
  PENDING_PAYMENT: 'warning',
  ACTIVE: 'success',
  PAUSED: 'info',
  CANCELLED: 'danger',
  COMPLETED: 'neutral',
};

const TASK_STATUS_VARIANTS: Record<TaskStatus, BadgeVariant> = {
  PENDING: 'neutral',
  IN_PROGRESS: 'info',
  DONE: 'success',
  BLOCKED: 'danger',
};

const REVISION_STATUS_VARIANTS: Record<PriceRevisionStatus, BadgeVariant> = {
  SCHEDULED: 'info',
  APPLIED: 'success',
  CANCELLED: 'neutral',
};

interface ServiceDetailViewPageProps {
  id: string;
  locale: string;
}

/**
 * Vista de `/private-area/services/[id]`: cabecera destacada (nombre, estado,
 * precio, descarga del contrato) y el resto de secciones (equipo, extras,
 * bolsa de horas, tareas, presupuestos asociados, revisiones de precio) en
 * un grid de tarjetas en vez de bloques apilados, para que el detalle no se
 * sienta como una lista larga de fichas de texto. Los tres fetches van en
 * `Promise.all` porque son independientes entre sí y bloquear en serie
 * triplicaría la latencia.
 * @param {ServiceDetailViewPageProps} props - Id del servicio y locale activo
 * @returns {Promise<JSX.Element>} El detalle del servicio renderizado
 */
export default async function ServicesDetailsViewPage({ id, locale }: ServiceDetailViewPageProps) {
  const t = await getTranslations('Views.ClientArea.Services');
  const tDetail = await getTranslations('Views.ClientArea.Services.Detail');
  const tCommon = await getTranslations('Views.ClientArea.Common');
  const tQuotes = await getTranslations('Views.ClientArea.Quotes');

  const [detailResponse, quotesResponse, revisionsResponse] = await Promise.all([
    getClientServiceDetail(id),
    getClientServiceQuotes(id),
    getClientServicePriceRevisions(id),
  ]);

  const service = detailResponse.data;

  if (!service) {
    return (
      <>
        <p className="client-detail__empty">{tDetail('notFound')}</p>
      </>
    );
  }

  const quotes = quotesResponse.data?.items ?? [];
  const priceRevisions = revisionsResponse.data?.items ?? [];

  const money = (value: number | undefined) =>
    formatBillingAmount(value, DEFAULT_CURRENCY, locale, tCommon('notAvailable'));

  const address = formatServiceAddress(service.address);

  return (
    <>
      <BreadcrumbLabel label={service.serviceName} />

      <div className="service-detail__hero">
        <div className="service-detail__hero-icon">
          <BriefcaseIcon aria-hidden="true" />
        </div>

        <div className="service-detail__hero-body">
          <Badge variant={STATUS_VARIANTS[service.status]} text={t(`Status.${service.status}`)} />
          <h1 className="service-detail__hero-title">{service.serviceName}</h1>
          <p className="service-detail__hero-description">
            {service.serviceDescription || (
              <span className="client-detail__placeholder">{tDetail('noDescription')}</span>
            )}
          </p>

          <div className="service-detail__hero-meta">
            <div className="service-detail__hero-meta-item">
              <span className="service-detail__hero-meta-label">{t('basePrice')}</span>
              <span className="service-detail__hero-meta-value">{money(service.basePrice)}</span>
            </div>
            <div className="service-detail__hero-meta-item">
              <span className="service-detail__hero-meta-label">{t('baseQuantity')}</span>
              <span className="service-detail__hero-meta-value">
                {service.baseQuantity} {service.baseUnit}
              </span>
            </div>
          </div>
        </div>

        <a
          className="service-detail__hero-download"
          href={`/api/client-portal/services/${id}/contract`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileDownIcon size={16} aria-hidden="true" />
          {tDetail('downloadContract')}
        </a>
      </div>

      <div className="service-detail__grid">
        <SettingsSection title={tDetail('teamTitle')}>
          {service.team && service.team.length > 0 ? (
            <dl className="client-detail__list">
              {service.team.map((member) => (
                <div key={member.userId} className="client-detail__row">
                  <dt className="client-detail__term">
                    {member.firstName} {member.lastName}
                  </dt>
                  <dd className="client-detail__value">{t(`MemberRole.${member.role}`)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="client-detail__empty">{tDetail('teamEmpty')}</p>
          )}
        </SettingsSection>

        <SettingsSection title={tDetail('extrasTitle')}>
          {service.extras && service.extras.length > 0 ? (
            <dl className="client-detail__list">
              {service.extras.map((extra) => (
                <div key={extra.id} className="client-detail__row">
                  <dt className="client-detail__term">{extra.name}</dt>
                  <dd className="client-detail__value">
                    {extra.quantity} {extra.unit} · {money(extra.price)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="client-detail__empty">{tDetail('extrasEmpty')}</p>
          )}
        </SettingsSection>

        {service.hourBank && (
          <SettingsSection title={tDetail('hourBankTitle')}>
            <dl className="client-detail__list">
              <div className="client-detail__row">
                <dt className="client-detail__term">{tDetail('contractedHours')}</dt>
                <dd className="client-detail__value">{service.hourBank.contractedHours}</dd>
              </div>
              <div className="client-detail__row">
                <dt className="client-detail__term">{tDetail('approvedHours')}</dt>
                <dd className="client-detail__value">
                  {service.hourBank.approvedHours ?? tCommon('notAvailable')}
                </dd>
              </div>
            </dl>
          </SettingsSection>
        )}

        <SettingsSection title={tDetail('tasksTitle')}>
          {service.tasks && service.tasks.length > 0 ? (
            <dl className="client-detail__list">
              {service.tasks.map((task) => (
                <div key={task.id} className="client-detail__row">
                  <dt className="client-detail__term">{task.title}</dt>
                  <dd className="client-detail__value">
                    {formatBillingDate(task.dueDate, locale, tCommon('notAvailable'))}
                    <Badge
                      variant={TASK_STATUS_VARIANTS[task.status]}
                      text={t(`TaskStatus.${task.status}`)}
                    />
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="client-detail__empty">{tDetail('tasksEmpty')}</p>
          )}
        </SettingsSection>

        <SettingsSection title={tDetail('quotesTitle')}>
          {quotes.length > 0 ? (
            <div className="client-list__rows">
              {quotes.map((quote) => (
                <Link
                  key={quote.id}
                  href={resolveDetailHref('/private-area/quotes/[id]', quote.id)}
                  className="client-list__row"
                >
                  <div className="client-list__row-main">
                    <span className="client-list__row-code">{quote.quoteCode}</span>
                    <span className="client-list__row-subtitle">
                      {formatBillingDate(quote.issueDate, locale, tCommon('notAvailable'))}
                    </span>
                  </div>
                  <Badge variant="info" text={tQuotes(`Status.${quote.status}`)} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="client-detail__empty">{tDetail('quotesEmpty')}</p>
          )}
        </SettingsSection>

        {address && (
          <LocationMap
            address={address}
            title={tDetail('locationTitle')}
            className="service-detail__grid-full"
          />
        )}

        <SettingsSection title={tDetail('priceRevisionsTitle')} className="service-detail__grid-full">
          {priceRevisions.length > 0 ? (
            <div className="client-detail__table-wrapper">
              <table className="client-detail__table">
                <thead>
                  <tr>
                    <th scope="col">{tDetail('effectiveFrom')}</th>
                    <th scope="col">{tDetail('previousPrice')}</th>
                    <th scope="col">{tDetail('newPrice')}</th>
                    <th scope="col">{tDetail('reason')}</th>
                    <th scope="col">{tCommon('statusLabel')}</th>
                  </tr>
                </thead>
                <tbody>
                  {priceRevisions.map((revision) => (
                    <tr key={revision.id}>
                      <td>
                        {formatBillingDate(revision.effectiveFrom, locale, tCommon('notAvailable'))}
                      </td>
                      <td>{money(revision.previousPrice)}</td>
                      <td>{money(revision.newPrice)}</td>
                      <td>{revision.reason ?? tCommon('notAvailable')}</td>
                      <td>
                        <Badge
                          variant={REVISION_STATUS_VARIANTS[revision.status]}
                          text={t(`PriceRevisionStatus.${revision.status}`)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="client-detail__empty">{tDetail('priceRevisionsEmpty')}</p>
          )}
        </SettingsSection>
      </div>
    </>
  );
}
