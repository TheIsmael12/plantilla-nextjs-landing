'use client';

import { useParams, useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';

import '@/styles/04-components/client-area/client-list.scss';

interface StatusFilterOption {
  value: string;
  label: string;
}

interface StatusFilterProps {
  label: string;
  allLabel: string;
  options: StatusFilterOption[];
  activeStatus?: string;
  /**
   * Parámetro de la URL que escribe el filtro; por defecto `status`.
   *
   * Existe porque no todos los listados filtran por «estado»: el histórico de notificaciones filtra por si
   * están leídas (`?read=`). Sin esto habría que duplicar el componente entero —con su resolución de
   * segmentos dinámicos y su vuelta a la página 1— para cambiar una cadena.
   */
  paramName?: string;
}

/**
 * Pastillas de filtro por estado de los listados del portal: navegan a la
 * misma ruta con `?status=...` actualizado, preservando el resto de la query
 * string y volviendo siempre a la página 1. Mismo patrón que `BlogFilters`.
 * Recibe las etiquetas ya traducidas porque cada listado las resuelve de su
 * propio namespace (`Services`/`Quotes`/`Invoices`).
 * @param {StatusFilterProps} props - Propiedades del componente
 * @returns {JSX.Element} Las pastillas de filtro renderizadas
 */
export default function StatusFilter({
  label,
  allLabel,
  options,
  activeStatus,
  paramName = 'status',
}: StatusFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const routeParams = useParams<Record<string, string | string[] | undefined>>();
  const router = useRouter();

  const navigateWithStatus = (value?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');

    if (value) {
      params.set(paramName, value);
    } else {
      params.delete(paramName);
    }

    // `usePathname()` de next-intl devuelve la plantilla canónica sin
    // resolver en rutas con segmento dinámico (p. ej. `.../[serviceId]/incidents`,
    // con el literal `[serviceId]` incluido): hay que sustituirlo por el valor
    // real del segmento antes de navegar, igual que hace `BreadCrumbs.tsx`.
    const resolvedPathname = pathname.replace(
      /\[(.+?)\]/g,
      // `segment` y no `paramName`: ese nombre ya es la prop del filtro, y reutilizarlo aquí la tapaba.
      (match, segment: string) => {
        const value = routeParams[segment];
        return typeof value === 'string' ? value : match;
      },
    );

    const query = params.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `pathname` ya viene tipado por next-intl; solo se añade la query string.
    router.replace((query ? `${resolvedPathname}?${query}` : resolvedPathname) as any, {
      scroll: false,
    });
  };

  return (
    <div className="client-list__filters" role="group" aria-label={label}>
      <button
        type="button"
        className={`client-list__filter-pill${!activeStatus ? ' client-list__filter-pill--active' : ''}`}
        aria-pressed={!activeStatus}
        onClick={() => navigateWithStatus(undefined)}
      >
        {allLabel}
      </button>

      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`client-list__filter-pill${activeStatus === option.value ? ' client-list__filter-pill--active' : ''}`}
          aria-pressed={activeStatus === option.value}
          onClick={() => navigateWithStatus(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
