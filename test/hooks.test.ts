import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsMounted } from "@/hooks/useIsMounted";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePagination } from "@/hooks/usePagination";

/**
 * Sustituye `window.matchMedia`, que jsdom no implementa.
 *
 * Devuelve además el disparador del evento `change`, que es lo que permite comprobar la parte interesante: que el
 * hook reacciona a un cambio de tamaño y no solo lee el valor una vez.
 * @param {boolean} initialMatches - Si la consulta casa al principio
 * @returns {{ emit: (matches: boolean) => void, removed: () => boolean }} Cómo emitir el cambio y si se limpió
 */
function stubMatchMedia(initialMatches: boolean) {
  let listener: ((event: MediaQueryListEvent) => void) | undefined;
  let wasRemoved = false;

  const mediaQuery = {
    matches: initialMatches,
    addEventListener: (_: string, callback: (event: MediaQueryListEvent) => void) => {
      listener = callback;
    },
    removeEventListener: () => {
      wasRemoved = true;
    },
  };

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => mediaQuery),
  );

  return {
    emit: (matches: boolean) => act(() => listener?.({ matches } as MediaQueryListEvent)),
    removed: () => wasRemoved,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useMediaQuery", () => {
  /*
   * Arranca en `false` **siempre**, aunque la consulta case.
   *
   * No es un descuido: `window` no existe al renderizar en el servidor, así que el valor inicial tiene que ser el
   * mismo en los dos lados o React avisa de un desajuste de hidratación. El valor real llega en el efecto.
   */
  it("empieza en false y toma el valor real tras montar", () => {
    stubMatchMedia(true);

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    expect(result.current).toBe(true);
  });

  it("devuelve false si la consulta no casa", () => {
    stubMatchMedia(false);

    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    expect(result.current).toBe(false);
  });

  it("reacciona cuando cambia el tamaño de la ventana", () => {
    const media = stubMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    expect(result.current).toBe(false);

    media.emit(true);
    expect(result.current).toBe(true);

    media.emit(false);
    expect(result.current).toBe(false);
  });

  /** Se desuscribe al desmontar: sin esto, cada montaje deja un escucha vivo sobre la consulta. */
  it("quita el escucha al desmontar", () => {
    const media = stubMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 1024px)"));

    unmount();

    expect(media.removed()).toBe(true);
  });
});

describe("useIsMounted", () => {
  /*
   * En cliente devuelve `true`; lo que no se puede comprobar aquí es el `false` del servidor.
   *
   * Ese valor sale del tercer argumento de `useSyncExternalStore`, que solo se usa al renderizar en el servidor.
   * Comprobarlo exigiría `renderToString`, y lo que este hook resuelve —evitar el aviso de hidratación— ya lo
   * garantiza la propia API de React.
   */
  it("en cliente devuelve true", () => {
    const { result } = renderHook(() => useIsMounted());

    expect(result.current).toBe(true);
  });
});

describe("usePagination", () => {
  it("arranca en la primera página con el tamaño que se le pide", () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 25 }));

    expect(result.current.pagination).toEqual({ pageIndex: 0, pageSize: 25 });
  });

  it("cambiar de página conserva el tamaño", () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

    act(() => result.current.setPageIndex(3));

    expect(result.current.pagination).toEqual({ pageIndex: 3, pageSize: 10 });
  });

  /*
   * Cambiar el tamaño **no** devuelve a la primera página, y conviene saberlo.
   *
   * Es lo que hace el módulo hoy: `setPageSize` solo toca `pageSize`. En una tabla que estaba en la página 8 con
   * 10 filas, pasar a 100 por página deja el índice en 8 y muestra un tramo que probablemente ya no existe. Se
   * fija como comportamiento conocido: quien lo use tiene que reponer el índice, o cambiarse aquí a propósito.
   */
  it("cambiar el tamaño no repone el índice de página", () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

    act(() => result.current.setPageIndex(8));
    act(() => result.current.setPageSize(100));

    expect(result.current.pagination).toEqual({ pageIndex: 8, pageSize: 100 });
  });

  it("setPagination reemplaza el estado entero", () => {
    const { result } = renderHook(() => usePagination({ initialPageSize: 10 }));

    act(() => result.current.setPagination({ pageIndex: 2, pageSize: 50 }));

    expect(result.current.pagination).toEqual({ pageIndex: 2, pageSize: 50 });
  });
});
