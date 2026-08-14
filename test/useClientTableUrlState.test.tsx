import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * El estado de la tabla **vive en la URL**, así que lo que hay que doblar es el enrutador.
 *
 * `searchParams` se controla desde cada caso y `router.replace` se espía: lo que se comprueba es qué consulta
 * acaba en la URL, que es el contrato real del hook. La navegación de next-intl (`@/i18n/navigation`) se dobla
 * además porque no resuelve `next/navigation` en el árbol de pnpm.
 */
const routerState = vi.hoisted(() => ({
  search: new URLSearchParams(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => routerState.search,
  useParams: () => ({}),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: routerState.replace, refresh: vi.fn() }),
  usePathname: () => "/private-area/invoices",
}));

const { useClientTableUrlState } = await import("@/hooks/useClientTableUrlState");

/**
 * La consulta con la que se llamó a `router.replace`, ya como objeto.
 * @returns {Record<string, string>} Los parámetros de la última navegación
 */
function lastQuery(): Record<string, string> {
  const [href] = routerState.replace.mock.calls.at(-1) ?? [];

  return (href as { query?: Record<string, string> })?.query ?? {};
}

beforeEach(() => {
  routerState.search = new URLSearchParams();
  routerState.replace.mockClear();
});

describe("lo que se lee de la URL", () => {
  it("sin parámetros arranca en la primera página con el tamaño por defecto", () => {
    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 20 });
    expect(result.current.sorting).toEqual([]);
    expect(result.current.search).toBe("");
  });

  /*
   * La URL cuenta desde 1 y la tabla desde 0, y esa conversión es el detalle que más se equivoca.
   *
   * `?page=3` es la tercera página para quien lee la barra de direcciones, y `pageIndex: 2` para TanStack Table.
   */
  it("traduce el número de página de la URL al índice de la tabla", () => {
    routerState.search = new URLSearchParams("page=3&limit=50");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 50 });
  });

  it.each(["page=0", "page=-1", "page=abc", "limit=0", "limit=abc"])(
    "un %s inválido cae a los valores por defecto",
    (query) => {
      routerState.search = new URLSearchParams(query);

      const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

      expect(result.current.pagination.pageIndex).toBe(0);
      expect(result.current.pagination.pageSize).toBeGreaterThan(0);
    },
  );

  it("lee la ordenación", () => {
    routerState.search = new URLSearchParams("sortBy=total&sortOrder=DESC");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    expect(result.current.sorting).toEqual([{ id: "total", desc: true }]);
  });

  /** Cualquier cosa que no sea `DESC` es ascendente: no se inventa un tercer estado. */
  it("sin DESC explícito, ordena ascendente", () => {
    routerState.search = new URLSearchParams("sortBy=total&sortOrder=ASC");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    expect(result.current.sorting).toEqual([{ id: "total", desc: false }]);
  });

  it("sin campo de orden no hay ordenación", () => {
    routerState.search = new URLSearchParams("sortOrder=DESC");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    expect(result.current.sorting).toEqual([]);
  });

  it("lee la búsqueda y los filtros declarados", () => {
    routerState.search = new URLSearchParams("q=serrano&status=PAID&otro=x");

    const { result } = renderHook(() =>
      useClientTableUrlState({ initialPageSize: 20, filterParams: ["status"] }),
    );

    expect(result.current.search).toBe("serrano");
    expect(result.current.filterValues).toEqual({ status: "PAID" });
  });

  it("un filtro declarado que no está en la URL llega como cadena vacía", () => {
    const { result } = renderHook(() =>
      useClientTableUrlState({ initialPageSize: 20, filterParams: ["status"] }),
    );

    expect(result.current.filterValues).toEqual({ status: "" });
  });
});

describe("lo que se escribe en la URL", () => {
  /*
   * Los valores por defecto **se borran de la URL en vez de escribirse**.
   *
   * Es lo que mantiene los enlaces limpios y compartibles: volver a la primera página deja `/facturas` y no
   * `/facturas?page=1&limit=20`. Y de paso hace que dos URLs que muestran lo mismo sean la misma URL.
   */
  it("volver a la primera página quita el parámetro en vez de poner page=1", () => {
    routerState.search = new URLSearchParams("page=3");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setPagination({ pageIndex: 0, pageSize: 20 }));

    expect(lastQuery()).not.toHaveProperty("page");
  });

  it("el tamaño por defecto tampoco se escribe", () => {
    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setPagination({ pageIndex: 1, pageSize: 20 }));

    const query = lastQuery();
    expect(query.page).toBe("2");
    expect(query).not.toHaveProperty("limit");
  });

  it("un tamaño distinto sí se escribe", () => {
    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setPagination({ pageIndex: 0, pageSize: 100 }));

    expect(lastQuery().limit).toBe("100");
  });

  it("ordenar escribe campo y sentido", () => {
    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setSorting([{ id: "total", desc: true }]));

    expect(lastQuery()).toMatchObject({ sortBy: "total", sortOrder: "DESC" });
  });

  it("quitar la ordenación borra los dos parámetros", () => {
    routerState.search = new URLSearchParams("sortBy=total&sortOrder=DESC");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setSorting([]));

    const query = lastQuery();
    expect(query).not.toHaveProperty("sortBy");
    expect(query).not.toHaveProperty("sortOrder");
  });

  /*
   * Reordenar **devuelve a la primera página**, y esto es lo que evita una pantalla vacía.
   *
   * Estando en la página 8 y cambiando el orden, el tramo 71-80 del nuevo orden puede no existir: la tabla se
   * quedaría en blanco y parecería que no hay datos.
   */
  it("cambiar el orden vuelve a la primera página", () => {
    routerState.search = new URLSearchParams("page=8");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setSorting([{ id: "total", desc: false }]));

    expect(lastQuery()).not.toHaveProperty("page");
  });

  it("conserva los parámetros ajenos que ya estaban en la URL", () => {
    routerState.search = new URLSearchParams("utm_source=boletin");

    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setSorting([{ id: "total", desc: true }]));

    expect(lastQuery().utm_source).toBe("boletin");
  });

  /** Navega sin saltar arriba: la tabla se queda donde estaba al cambiar de página. */
  it("navega sin mover el scroll", () => {
    const { result } = renderHook(() => useClientTableUrlState({ initialPageSize: 20 }));

    act(() => result.current.setPagination({ pageIndex: 1, pageSize: 20 }));

    expect(routerState.replace).toHaveBeenCalledWith(expect.anything(), { scroll: false });
  });
});
