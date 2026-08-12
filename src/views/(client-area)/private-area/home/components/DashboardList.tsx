import { ArrowRightIcon } from 'lucide-react';

import { getTranslations } from 'next-intl/server';

import Badge from '@/components/ui/buttons/Badge';
import { Link } from '@/i18n/navigation';

import type { BadgeVariant } from '@/types/ui/buttons/badge';
import type { AnyHref } from '@/i18n/navigation';

/**
 * Una fila de una lista del panel.
 * @interface DashboardListRow
 * @property {string} id - Clave de la fila
 * @property {string} primary - Lo que identifica la fila (un código, un título)
 * @property {string} [secondary] - Segunda línea: fecha, importe, de qué va
 * @property {string} [badgeText] - Estado, si la fila tiene uno
 * @property {BadgeVariant} [badgeVariant] - Color del estado
 * @property {AnyHref} href - A dónde lleva la fila
 */
export interface DashboardListRow {
  id: string;
  primary: string;
  secondary?: string;
  badgeText?: string;
  badgeVariant?: BadgeVariant;
  href: AnyHref;
}

interface DashboardListProps {
  title: string;
  /** Qué se ofrece hacer cuando la lista está vacía, o por qué está bien que lo esté. */
  emptyMessage: string;
  rows: DashboardListRow[];
  /** El listado completo, para el enlace del pie. */
  allHref: AnyHref;
}

/**
 * Una lista corta del panel: los presupuestos que esperan respuesta, las facturas sin pagar, las últimas
 * incidencias.
 *
 * **Cada fila es un enlace al sitio donde se hace algo con ella**, no una fila de tabla. El panel no está
 * para consultar datos —para eso están los listados, con sus filtros— sino para llevar al trabajo pendiente
 * en un clic.
 *
 * Y la lista **no dice cuántas hay en total**: quien tenga treinta facturas sin pagar ya lo sabe por la
 * tarjeta de arriba, y repetir el número aquí solo llena la cabecera. El pie lleva al listado completo.
 * @param {DashboardListProps} props - Título, filas y enlace al listado completo
 * @returns {Promise<JSX.Element>} La lista renderizada
 */
export default async function DashboardList({
  title,
  emptyMessage,
  rows,
  allHref,
}: DashboardListProps) {
  const t = await getTranslations('Views.ClientArea.Home.Dashboard');

  return (
    <section className="dashboard-list">
      <header className="dashboard-list__header">
        <h2 className="dashboard-list__title">{title}</h2>
      </header>

      {rows.length === 0 ? (
        <p className="dashboard-list__empty">{emptyMessage}</p>
      ) : (
        <ul className="dashboard-list__rows">
          {rows.map((row) => (
            <li key={row.id}>
              <Link href={row.href} className="dashboard-list__row">
                <span className="dashboard-list__text">
                  <span className="dashboard-list__primary">{row.primary}</span>
                  {row.secondary && (
                    <span className="dashboard-list__secondary">{row.secondary}</span>
                  )}
                </span>

                {row.badgeText && (
                  <Badge variant={row.badgeVariant ?? 'neutral'} text={row.badgeText} />
                )}

                <ArrowRightIcon className="dashboard-list__arrow" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link href={allHref} className="dashboard-list__all">
        {t('viewAll')}
        <ArrowRightIcon aria-hidden="true" />
      </Link>
    </section>
  );
}
