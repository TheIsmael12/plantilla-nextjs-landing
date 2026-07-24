"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

const SEARCH_PARAM = "q";

/**
 * Estado de búsqueda por defecto de {@link Table} cuando no se controla
 * externamente. El texto de búsqueda vive también en la URL (parámetro `q`),
 * para que un enlace copiado conserve la búsqueda activa; el valor inicial
 * se lee de ahí y cada cambio actualiza la URL sin añadir una entrada al
 * historial (`router.replace`).
 * @returns {{search: string, setSearch: (value: string) => void}} Texto de búsqueda y su setter
 */
export function useFilters() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [search, setSearchState] = useState<string>(
    () => searchParams.get(SEARCH_PARAM) ?? "",
  );

  const setSearch = (value: string) => {
    setSearchState(value);

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(SEARCH_PARAM, value);
    } else {
      params.delete(SEARCH_PARAM);
    }

    const query = params.toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- `pathname` ya viene tipado por next-intl; solo se añade la query string.
    router.replace((query ? `${pathname}?${query}` : pathname) as any, { scroll: false });
  };

  return { search, setSearch };
}
