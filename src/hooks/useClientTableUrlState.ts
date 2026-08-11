'use client';

import { useCallback, useMemo, useTransition } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

import { usePathname, useRouter } from '@/i18n/navigation';

import type { PaginationState, SortingState } from '@tanstack/react-table';

interface UseClientTableUrlStateOptions {
  initialPageSize: number;
  pageParam?: string;
  limitParam?: string;
  /** Nombre del parámetro con el campo de orden (backend NestJS: `sortBy`); por defecto `"sortBy"`. */
  sortByParam?: string;
  /** Nombre del parámetro con la dirección de orden (`"ASC"`/`"DESC"`, backend NestJS: `sortOrder`); por defecto `"sortOrder"`. */
  sortOrderParam?: string;
  searchParam?: string;
  /** Nombres de los parámetros de filtro de negocio de esta tabla (p. ej. `["status"]`); vacío si no tiene ninguno. */
  filterParams?: string[];
}

interface UseClientTableUrlStateResult {
  pagination: PaginationState;
  sorting: SortingState;
  search: string;
  filterValues: Record<string, string>;
  isPending: boolean;
  setPagination: (pagination: PaginationState) => void;
  setSorting: (sorting: SortingState) => void;
  setSearch: (value: string) => void;
  setFilter: (key: string, value: string) => void;
}

/** Decodifica `sortBy`/`sortOrder` (convención del backend NestJS, distinta del `sort=-campo` compacto de la intranet) a un `SortingState` de TanStack Table. */
function parseSortParams(sortBy: string | null, sortOrder: string | null): SortingState {
  if (!sortBy) return [];
  return [{ id: sortBy, desc: sortOrder === 'DESC' }];
}

/**
 * Sincroniza contra la URL el estado de paginación (`page`/`limit`), orden
 * (`sortBy`/`sortOrder`) y búsqueda de una `Table` del portal, para pasarlos
 * como props controladas (`pagination`/`sorting`/`globalFilter` + `on*Change`)
 * desde el Client Component que la monta. Mismo patrón que `usePagination`/
 * `useSorting`/`useFilters` de la intranet, unificado en un único hook y con
 * los nombres de parámetro configurables: las pantallas con dos tablas en la
 * misma página (vecinos+invitaciones, llaveros+credenciales) necesitan
 * namespaces distintos para no pisarse la página/búsqueda entre sí.
 *
 * El orden usa `sortBy`/`sortOrder` (dos parámetros, valores `"ASC"`/`"DESC"`)
 * en vez del `sort=-campo` compacto de la intranet, porque es el contrato
 * real que expone el backend NestJS (`PaginationQueryDto`, común a todos los
 * listados paginados del portal) — nunca se llegó a introducir el formato
 * compacto ahí, así que replicarlo aquí solo añadiría una traducción sin
 * ningún consumidor al otro lado.
 *
 * Resuelve segmentos dinámicos (`[serviceId]`) del mismo modo que
 * `ClientListPagination`/`ClientListSearch`: pasando `params: routeParams`
 * junto al `pathname` canónico a `router.replace`, en vez de intentar
 * sustituirlos a mano.
 * @param {UseClientTableUrlStateOptions} options - Tamaño de página inicial y nombres de parámetro de esta tabla
 * @returns {UseClientTableUrlStateResult} Estado derivado de la URL, sus setters y si hay una navegación en curso
 */
export function useClientTableUrlState({
  initialPageSize,
  pageParam = 'page',
  limitParam = 'limit',
  sortByParam = 'sortBy',
  sortOrderParam = 'sortOrder',
  searchParam = 'q',
  filterParams = [],
}: UseClientTableUrlStateOptions): UseClientTableUrlStateResult {
  const router = useRouter();
  const pathname = usePathname();
  const routeParams = useParams<Record<string, string | string[] | undefined>>();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const pagination = useMemo<PaginationState>(() => {
    const pageValue = Number(searchParams.get(pageParam));
    const limitValue = Number(searchParams.get(limitParam));

    return {
      pageIndex: Number.isFinite(pageValue) && pageValue > 0 ? pageValue - 1 : 0,
      pageSize: Number.isFinite(limitValue) && limitValue > 0 ? limitValue : initialPageSize,
    };
  }, [searchParams, pageParam, limitParam, initialPageSize]);

  const sorting = useMemo(
    () => parseSortParams(searchParams.get(sortByParam), searchParams.get(sortOrderParam)),
    [searchParams, sortByParam, sortOrderParam],
  );

  const search = searchParams.get(searchParam) ?? '';

  // Identidad estable pese a que el llamador pasa un array literal en cada
  // render: solo el contenido debe invalidar el `useMemo` de `filterValues`,
  // no la identidad del array (el `eslint-disable` de abajo, en cambio, ya no
  // hace falta: el compilador de React exige expresiones simples en las deps,
  // así que la serialización vive aquí, fuera del array de dependencias).
  const filterParamsKey = filterParams.join(',');

  const filterValues = useMemo(() => {
    const values: Record<string, string> = {};
    for (const key of filterParams) {
      values[key] = searchParams.get(key) ?? '';
    }
    return values;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- se depende de `filterParamsKey` (contenido serializado) en vez de `filterParams` (identidad de array nueva en cada render del llamador).
  }, [searchParams, filterParamsKey]);

  const navigate = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);

      startTransition(() => {
        router.replace(
          {
            pathname,
            params: routeParams,
            query: Object.fromEntries(params.entries()),
          } as unknown as Parameters<typeof router.replace>[0],
          { scroll: false },
        );

        /*
         * Y se fuerza el refresco, porque cambiar solo la query string no vuelve a pedir la página.
         *
         * La caché de router del cliente indexa por los segmentos de la ruta, **no por la query string**: al
         * pulsar una cabecera para ordenar, la URL pasaba a `?sortBy=createdAt&sortOrder=ASC` y la tabla
         * seguía enseñando exactamente las mismas filas. Se comprobó midiendo: entrando por URL, ASC y DESC
         * devuelven listas distintas; pulsando la cabecera, las tres veces salía la misma. Es decir, el orden
         * y los filtros de **todas** las tablas del portal cambiaban la dirección y no los datos.
         *
         * Va dentro de la misma transición que el `replace`, así que el indicador de carga que ya expone este
         * hook (`isPending`) cubre las dos cosas y no aparece un parpadeo intermedio.
         */
        router.refresh();
      });
    },
    [searchParams, router, pathname, routeParams],
  );

  const setPagination = useCallback(
    (next: PaginationState) => {
      navigate((params) => {
        if (next.pageIndex === 0) {
          params.delete(pageParam);
        } else {
          params.set(pageParam, String(next.pageIndex + 1));
        }

        if (next.pageSize === initialPageSize) {
          params.delete(limitParam);
        } else {
          params.set(limitParam, String(next.pageSize));
        }
      });
    },
    [navigate, pageParam, limitParam, initialPageSize],
  );

  const setSorting = useCallback(
    (next: SortingState) => {
      navigate((params) => {
        const [first] = next;
        if (first) {
          params.set(sortByParam, first.id);
          params.set(sortOrderParam, first.desc ? 'DESC' : 'ASC');
        } else {
          params.delete(sortByParam);
          params.delete(sortOrderParam);
        }
        params.delete(pageParam);
      });
    },
    [navigate, sortByParam, sortOrderParam, pageParam],
  );

  const setSearch = useCallback(
    (value: string) => {
      navigate((params) => {
        if (value) {
          params.set(searchParam, value);
        } else {
          params.delete(searchParam);
        }
        params.delete(pageParam);
      });
    },
    [navigate, searchParam, pageParam],
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      navigate((params) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
        params.delete(pageParam);
      });
    },
    [navigate, pageParam],
  );

  return {
    pagination,
    sorting,
    search,
    filterValues,
    isPending,
    setPagination,
    setSorting,
    setSearch,
    setFilter,
  };
}
