'use client';

import { useMemo } from 'react';

import { useLocale, useTranslations } from 'next-intl';

import Chart from '@/components/ui/charts/Chart';

import { formatBillingAmount } from '@/utils/billingFormatUtils';

import type { PortalInvoiceMonth } from '@/types/client-portal/invoices';

interface DashboardBillingCardProps {
  monthly: PortalInvoiceMonth[];
  currency: string;
}

/**
 * Lo facturado y lo pagado, mes a mes.
 *
 * **Dos líneas y no una.** La distancia entre ellas es el dato: se puede tener un mes de mucha factura y no
 * haber pagado nada de él, y una sola línea de «facturación» esconde justo eso. Como los cobros se apuntan
 * contra el mes de la factura, esa separación se lee como «lo que aún debo de ese mes».
 *
 * De línea y no de barras porque lo que se mira es la evolución del año, no el duelo entre marzo y abril.
 * @param {DashboardBillingCardProps} props - Serie mensual y moneda
 * @returns {JSX.Element} El gráfico de facturación
 */
export default function DashboardBillingCard({ monthly, currency }: DashboardBillingCardProps) {
  const t = useTranslations('Views.ClientArea.Home.Dashboard');
  const tCommon = useTranslations('Views.ClientArea.Common');
  const locale = useLocale();

  /** «ago. 26»: cabe en el eje y no confunde el mismo mes de dos años distintos. */
  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: 'short', year: '2-digit' }),
    [locale],
  );

  const categories = monthly.map((point) => {
    const [year, month] = point.month.split('-');
    return monthFormatter.format(new Date(Number(year), Number(month) - 1, 1));
  });

  return (
    <Chart
      type="line"
      categories={categories}
      series={[
        { name: t('billed'), data: monthly.map((point) => point.billed) },
        { name: t('paid'), data: monthly.map((point) => point.paid) },
      ]}
      formatValue={(value) => formatBillingAmount(value, currency, locale, tCommon('notAvailable'))}
      emptyMessage={t('billingEmpty')}
      height={280}
    />
  );
}
