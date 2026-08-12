import { getTranslations } from 'next-intl/server';

import { AlarmClockIcon, ReceiptIcon, TrendingUpIcon, WalletIcon } from 'lucide-react';

import { getClientInvoiceSummary } from '@/actions/client-portal/invoices-actions';

import StatCard from '@/components/ui/cards/StatCard';

import { formatBillingAmount } from '@/utils/billingFormatUtils';

import '@/styles/04-components/ui/cards/stat-card.scss';
import '@/styles/04-components/client-area/client-list.scss';

interface InvoiceSummaryProps {
  locale: string;
}

/**
 * Resumen de facturación, arriba del listado de facturas.
 *
 * **La primera tarjeta es lo que se debe**, no el total de facturas: quien entra en «Facturas» viene casi
 * siempre a ver si tiene algo pendiente, y ese número es la respuesta. Las vencidas van aparte porque no es
 * lo mismo deber algo que deberlo desde hace dos meses.
 *
 * Los importes vienen sumados por la API sobre todas las facturas del cliente. Calcularlos aquí sobre la
 * página visible daría una cifra que cambia al pasar de página, que en dinero es inaceptable.
 * @param {InvoiceSummaryProps} props - Locale, para formatear los importes
 * @returns {Promise<JSX.Element | null>} El resumen, o `null` si no llegó
 */
export default async function InvoiceSummary({ locale }: InvoiceSummaryProps) {
  const t = await getTranslations('Views.ClientArea.Invoices.summary');
  const tCommon = await getTranslations('Views.ClientArea.Common');

  const { data } = await getClientInvoiceSummary();

  if (!data) return null;

  const money = (value: number) =>
    formatBillingAmount(value, data.currency, locale, tCommon('notAvailable'));

  return (
    <div className="client-list__stats">
      <StatCard
        label={t('pendingAmount')}
        value={money(data.pendingAmount)}
        description={data.unpaid > 0 ? t('unpaidCount', { count: data.unpaid }) : t('allPaid')}
        icon={WalletIcon}
        variant={data.pendingAmount > 0 ? 'warning' : 'success'}
      />
      <StatCard
        label={t('overdue')}
        value={String(data.overdue)}
        description={data.overdue > 0 ? t('overdueHint') : undefined}
        icon={AlarmClockIcon}
        variant={data.overdue === 0 ? 'neutral' : 'danger'}
      />
      <StatCard
        label={t('billedLastYear')}
        value={money(data.billedLastYear)}
        icon={TrendingUpIcon}
        variant="info"
      />
      <StatCard
        label={t('total')}
        value={String(data.total)}
        icon={ReceiptIcon}
        variant="neutral"
      />
    </div>
  );
}
