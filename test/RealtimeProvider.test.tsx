import { useEffect, useState } from "react";

import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Se dobla el **socket**, no el proveedor: lo que hay que comprobar es cómo se comporta el proveedor ante lo que
 * el socket le manda —quién se conecta, qué eventos reparte y qué pasa al desmontar—, no la librería de sockets.
 *
 * `io()` devuelve un doble que guarda los manejadores registrados, y desde la prueba se emiten eventos como los
 * emitiría el servidor.
 */
const socket = vi.hoisted(() => {
  const handlers = new Map<string, (payload: unknown) => void>();

  return {
    handlers,
    disconnect: vi.fn(),
    on: vi.fn((event: string, handler: (payload: unknown) => void) => {
      handlers.set(event, handler);
    }),
    /** Emite un evento como si viniera del servidor. */
    emit: (event: string, payload?: unknown) => handlers.get(event)?.(payload),
    reset: () => {
      handlers.clear();
      socket.disconnect.mockClear();
      socket.on.mockClear();
    },
  };
});

const io = vi.hoisted(() => vi.fn());

vi.mock("socket.io-client", () => ({ io }));

const session = vi.hoisted(() => ({ status: "authenticated" as string }));

vi.mock("next-auth/react", () => ({ useSession: () => ({ status: session.status }) }));

const getRealtimeTicket = vi.hoisted(() => vi.fn());

vi.mock("@/actions/client-portal/notifications-actions", () => ({ getRealtimeTicket }));

const { default: RealtimeProvider, useRealtime } = await import("@/context/RealtimeProvider");

beforeEach(() => {
  socket.reset();
  io.mockReset();
  io.mockReturnValue(socket);
  session.status = "authenticated";
  getRealtimeTicket.mockResolvedValue({
    status: 200,
    data: { origin: "https://api.enovait.es", namespace: "/portal", ticket: "ticket-1" },
  });
});

describe("useRealtime fuera del proveedor", () => {
  /*
   * Sin proveedor devuelve un contexto **inerte**, no lanza.
   *
   * Es lo que permite que la campana de notificaciones se pueda montar en una historia de Storybook o en una
   * página pública sin envolverla: se comporta como si no hubiera tiempo real, que es exactamente lo que pasa.
   */
  it("devuelve un contexto inerte en vez de fallar", () => {
    const { result } = renderHook(() => useRealtime());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.unreadCount).toBeNull();

    // Y sus funciones se pueden llamar sin romper nada: la de suscripción devuelve su baja.
    expect(() => result.current.setUnreadCount(3)).not.toThrow();
    expect(typeof result.current.onNotification(() => undefined)).toBe("function");
  });
});

describe("la conexión", () => {
  /*
   * **Sin sesión no se conecta**, y esa guarda es la que evita pedir un ticket que el backend rechazaría.
   *
   * `status` pasa por `loading` en cada carga antes de resolverse; conectar ahí sería una petición fallida por
   * página.
   */
  it.each(["loading", "unauthenticated"])("con la sesión en %s no se conecta", async (status) => {
    session.status = status;

    render(<RealtimeProvider>contenido</RealtimeProvider>);

    await waitFor(() => expect(screen.getByText("contenido")).toBeInTheDocument());
    expect(getRealtimeTicket).not.toHaveBeenCalled();
    expect(io).not.toHaveBeenCalled();
  });

  it("con sesión pide un ticket y abre el socket en el namespace que diga el servidor", async () => {
    render(<RealtimeProvider>contenido</RealtimeProvider>);

    await waitFor(() => expect(io).toHaveBeenCalled());

    const [url, options] = io.mock.calls[0] ?? [];
    expect(url).toBe("https://api.enovait.es/portal");
    // Solo websocket: el sondeo largo por HTTP no aporta nada aquí y multiplica las peticiones.
    expect((options as { transports: string[] }).transports).toEqual(["websocket"]);
  });

  /** Si el servidor no da ticket, no se abre nada: sin él la conexión sería rechazada igualmente. */
  it("sin ticket no abre el socket", async () => {
    getRealtimeTicket.mockResolvedValue({ status: 401 });

    render(<RealtimeProvider>contenido</RealtimeProvider>);

    await waitFor(() => expect(getRealtimeTicket).toHaveBeenCalled());
    expect(io).not.toHaveBeenCalled();
  });

  it("al desmontar cierra el socket", async () => {
    const { unmount } = render(<RealtimeProvider>contenido</RealtimeProvider>);

    await waitFor(() => expect(io).toHaveBeenCalled());

    unmount();

    expect(socket.disconnect).toHaveBeenCalled();
  });
});

describe("el ticket de reconexión", () => {
  /*
   * El primer intento usa el ticket que ya se pidió; **cada reintento pide uno nuevo**.
   *
   * Los tickets son de un solo uso: reconectar con el mismo lo rechazaría el servidor, y socket.io se quedaría
   * reintentando en bucle contra un ticket gastado. Esta es la parte que solo se ve leyendo el `auth` de la
   * librería, y la que se rompería al «simplificarla» a un valor fijo.
   */
  it("el primer intento reutiliza el ticket y el segundo pide otro", async () => {
    render(<RealtimeProvider>contenido</RealtimeProvider>);

    await waitFor(() => expect(io).toHaveBeenCalled());

    const { auth } = (io.mock.calls[0]?.[1] ?? {}) as {
      auth: (callback: (data: { ticket: string }) => void) => void;
    };

    const first = vi.fn();
    auth(first);
    expect(first).toHaveBeenCalledWith({ ticket: "ticket-1" });

    // El segundo intento no reutiliza: vuelve a pedirlo.
    getRealtimeTicket.mockResolvedValue({ status: 200, data: { ticket: "ticket-2" } });

    const second = vi.fn();
    auth(second);

    await waitFor(() => expect(second).toHaveBeenCalledWith({ ticket: "ticket-2" }));
  });

  /** Y si el ticket nuevo tampoco llega, se manda vacío en vez de dejar la llamada colgada. */
  it("si el ticket de reconexión falla, responde con uno vacío", async () => {
    render(<RealtimeProvider>contenido</RealtimeProvider>);
    await waitFor(() => expect(io).toHaveBeenCalled());

    const { auth } = (io.mock.calls[0]?.[1] ?? {}) as {
      auth: (callback: (data: { ticket: string }) => void) => void;
    };

    auth(vi.fn());
    getRealtimeTicket.mockResolvedValue({ status: 500 });

    const retry = vi.fn();
    auth(retry);

    await waitFor(() => expect(retry).toHaveBeenCalledWith({ ticket: "" }));
  });
});

/**
 * Un consumidor que pinta lo que recibe, para comprobar el reparto de eventos.
 * @returns {JSX.Element} Lo recibido
 */
function Consumer() {
  const { isConnected, unreadCount, onNotification, onNotificationRead, onIncidentComment } =
    useRealtime();

  const [received, setReceived] = useState<string[]>([]);

  useEffect(() => {
    const offs = [
      onNotification((n) => setReceived((r) => [...r, `notif:${n.id}`])),
      onNotificationRead((id) => setReceived((r) => [...r, `read:${id}`])),
      onIncidentComment((c) => setReceived((r) => [...r, `comment:${c.id}`])),
    ];

    return () => offs.forEach((off) => off());
  }, [onNotification, onNotificationRead, onIncidentComment]);

  return (
    <div>
      <span data-testid="connected">{String(isConnected)}</span>
      <span data-testid="unread">{String(unreadCount)}</span>
      <span data-testid="received">{received.join("|")}</span>
    </div>
  );
}

describe("el reparto de eventos", () => {
  it("refleja la conexión y la desconexión", async () => {
    render(
      <RealtimeProvider>
        <Consumer />
      </RealtimeProvider>,
    );

    await waitFor(() => expect(io).toHaveBeenCalled());
    expect(screen.getByTestId("connected")).toHaveTextContent("false");

    socket.emit("connect");
    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("true"));

    socket.emit("disconnect");
    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("false"));
  });

  /** Un error de conexión cuenta como desconectado: para quien lo lee es lo mismo, no hay tiempo real. */
  it("un connect_error deja el estado en desconectado", async () => {
    render(
      <RealtimeProvider>
        <Consumer />
      </RealtimeProvider>,
    );

    await waitFor(() => expect(io).toHaveBeenCalled());

    socket.emit("connect");
    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("true"));

    socket.emit("connect_error");
    await waitFor(() => expect(screen.getByTestId("connected")).toHaveTextContent("false"));
  });

  it("el contador de no leídas llega desde el socket", async () => {
    render(
      <RealtimeProvider>
        <Consumer />
      </RealtimeProvider>,
    );

    await waitFor(() => expect(io).toHaveBeenCalled());
    expect(screen.getByTestId("unread")).toHaveTextContent("null");

    socket.emit("unread.count", { count: 4 });

    await waitFor(() => expect(screen.getByTestId("unread")).toHaveTextContent("4"));
  });

  it.each([
    ["notification", { id: "n1" }, "notif:n1"],
    ["notification.read", { id: "n2" }, "read:n2"],
    ["incident.comment", { id: "c1" }, "comment:c1"],
  ])("reparte el evento %s a quien esté suscrito", async (event, payload, expected) => {
    render(
      <RealtimeProvider>
        <Consumer />
      </RealtimeProvider>,
    );

    await waitFor(() => expect(io).toHaveBeenCalled());

    socket.emit(event, payload);

    await waitFor(() => expect(screen.getByTestId("received")).toHaveTextContent(expected));
  });
});
