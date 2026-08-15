import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { NotificationResponseDto } from "@/types/client-portal/notifications";

/*
 * La campana se prueba aquí y no con una historia de Storybook por lo que arrastra: tres server actions —que
 * llevan `server-only`—, el contexto de tiempo real y el enrutador de next-intl. Doblarlo todo desde el navegador
 * exigiría montar la mitad de la aplicación; desde jsdom es una frontera limpia.
 *
 * Lo que **no** se dobla es el componente: se renderiza entero, con sus efectos y su estado.
 *
 * Los textos se buscan por **clave de traducción** (`ariaLabel`, `markAllAsRead`) y no por su versión en español:
 * el `vitest.setup.ts` de este proyecto hace que `useTranslations` devuelva la clave, para que una prueba no se
 * rompa cada vez que alguien retoca una frase. Lo que sí va en texto real es lo que viene en los datos, como el
 * título que manda el servidor.
 */
const actions = vi.hoisted(() => ({
  getClientNotifications: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

vi.mock("@/actions/client-portal/notifications-actions", () => actions);

/** El bus de tiempo real: se guardan los suscriptores para poder emitir desde la prueba. */
const realtime = vi.hoisted(() => ({
  unreadCount: null as number | null,
  setUnreadCount: vi.fn(),
  notificationHandlers: [] as ((n: unknown) => void)[],
  readHandlers: [] as ((id: string) => void)[],
}));

vi.mock("@/context/RealtimeProvider", () => ({
  useRealtime: () => ({
    unreadCount: realtime.unreadCount,
    setUnreadCount: realtime.setUnreadCount,
    onNotification: (handler: (n: unknown) => void) => {
      realtime.notificationHandlers.push(handler);
      return () => undefined;
    },
    onNotificationRead: (handler: (id: string) => void) => {
      realtime.readHandlers.push(handler);
      return () => undefined;
    },
  }),
}));

const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("@/i18n/navigation", async () => {
  const { createElement } = await import("react");

  return {
    useRouter: () => router,
    Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
      createElement("a", { href: String(href) }, children),
  };
});

const { default: ClientNotificationBell } = await import(
  "@/components/ui/navigations/ClientNotificationBell"
);

/**
 * Una notificación de la API.
 * @param {Partial<NotificationResponseDto>} overrides - Lo que cambia
 * @returns {NotificationResponseDto} La notificación
 */
function notification(overrides: Partial<NotificationResponseDto> = {}): NotificationResponseDto {
  return {
    id: "n1",
    type: "INVOICE_ISSUED",
    severity: "INFO",
    titleOverride: "Su factura está lista",
    bodyOverride: "Ya puede descargarla",
    data: {},
    url: null,
    readAt: null,
    createdAt: "2026-03-14T09:00:00.000Z",
    ...overrides,
  } as NotificationResponseDto;
}

beforeEach(() => {
  vi.clearAllMocks();
  realtime.unreadCount = null;
  realtime.notificationHandlers = [];
  realtime.readHandlers = [];

  actions.getClientNotifications.mockResolvedValue({ status: 200, data: { items: [] } });
  actions.markAllNotificationsAsRead.mockResolvedValue({ status: 200, data: true });
  actions.markNotificationAsRead.mockResolvedValue({ status: 200, data: true });

  // `matchMedia` no existe en jsdom y el componente lo usa para decidir si es hoja o desplegable.
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

describe("el contador", () => {
  /*
   * Mientras el tiempo real no ha dicho nada, manda el contador que vino del servidor.
   *
   * Es lo que evita el parpadeo del arranque: el socket tarda en conectar, y empezar en cero haría que la
   * campana apareciera vacía y se rellenara un segundo después.
   */
  it("hasta que llega el tiempo real, manda el del servidor", () => {
    render(<ClientNotificationBell initialUnreadCount={3} />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("en cuanto el tiempo real dice algo, manda él", () => {
    realtime.unreadCount = 7;

    render(<ClientNotificationBell initialUnreadCount={3} />);

    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.queryByText("3")).toBeNull();
  });

  /** Un cero del tiempo real es un valor, no «todavía no se sabe»: la insignia desaparece. */
  it("con cero sin leer no se pinta la insignia", () => {
    realtime.unreadCount = 0;

    render(<ClientNotificationBell initialUnreadCount={3} />);

    expect(screen.queryByText("3")).toBeNull();
  });
});

describe("abrir la campana", () => {
  /*
   * La lista se pide **al abrir**, no al montar.
   *
   * La mayoría de las visitas al portal no despliegan la campana; pedirla siempre sería una petición por página
   * para nada.
   */
  it("no pide nada hasta que se abre", async () => {
    render(<ClientNotificationBell initialUnreadCount={2} />);

    expect(actions.getClientNotifications).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));

    await waitFor(() => expect(actions.getClientNotifications).toHaveBeenCalledTimes(1));
  });

  /** Y solo una vez: cerrar y volver a abrir no repite la petición. */
  it("no vuelve a pedirla al reabrir", async () => {
    render(<ClientNotificationBell initialUnreadCount={2} />);

    const bell = screen.getByRole("button", { name: "ariaLabel" });

    await userEvent.click(bell);
    await waitFor(() => expect(actions.getClientNotifications).toHaveBeenCalledTimes(1));

    await userEvent.click(bell);
    await userEvent.click(bell);

    expect(actions.getClientNotifications).toHaveBeenCalledTimes(1);
  });

  it("pinta lo que devuelve la API", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ titleOverride: "Su factura está lista" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));

    expect(await screen.findByText("Su factura está lista")).toBeInTheDocument();
  });

  it("sin notificaciones lo dice con palabras", async () => {
    render(<ClientNotificationBell initialUnreadCount={0} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));

    expect(await screen.findByText("emptyTitle")).toBeInTheDocument();
  });
});

describe("marcar todas como leídas", () => {
  it("las marca y pone el contador a cero", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification(), notification({ id: "n2" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={2} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));

    await userEvent.click(await screen.findByRole("button", { name: "markAllAsRead" }));

    await waitFor(() => expect(actions.markAllNotificationsAsRead).toHaveBeenCalled());
    expect(realtime.setUnreadCount).toHaveBeenCalledWith(0);
  });

  /*
   * Si el servidor lo rechaza, **se deshace**: vuelven a salir como no leídas y el contador se restaura.
   *
   * La marca se aplica antes de que responda el servidor para que el clic se sienta inmediato; sin la vuelta
   * atrás, un fallo de red dejaría la campana en cero mientras el servidor sigue teniendo dos sin leer, y el
   * siguiente refresco las haría reaparecer sin explicación.
   */
  it("si el servidor falla, deshace el cambio", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification()] },
    });
    actions.markAllNotificationsAsRead.mockResolvedValue({ status: 500 });

    render(<ClientNotificationBell initialUnreadCount={2} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await userEvent.click(await screen.findByRole("button", { name: "markAllAsRead" }));

    // Primero optimista a 0, y al fallar se restaura el valor anterior.
    await waitFor(() => expect(realtime.setUnreadCount).toHaveBeenLastCalledWith(2));
  });
});

describe("pulsar una notificación", () => {
  it("navega a su URL y la marca como leída", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ url: "/private-area/invoices/1" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await userEvent.click(await screen.findByText("Su factura está lista"));

    expect(router.push).toHaveBeenCalledWith("/private-area/invoices/1");
    await waitFor(() => expect(actions.markNotificationAsRead).toHaveBeenCalledWith("n1"));
  });

  /** Una ya leída no se vuelve a marcar: sería una petición para no cambiar nada. */
  it("una ya leída no se vuelve a marcar", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ readAt: "2026-03-14T10:00:00.000Z" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={0} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await userEvent.click(await screen.findByText("Su factura está lista"));

    expect(actions.markNotificationAsRead).not.toHaveBeenCalled();
  });

  /** Sin URL no se navega: hay notificaciones que solo informan. */
  it("sin URL no navega", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ url: null })] },
    });

    render(<ClientNotificationBell initialUnreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await userEvent.click(await screen.findByText("Su factura está lista"));

    expect(router.push).not.toHaveBeenCalled();
  });
});

describe("el tiempo real", () => {
  /*
   * Una notificación que llega por socket entra **la primera** en la lista ya abierta.
   *
   * Es lo que hace que la campana sirva de algo mientras la pantalla está abierta: sin esto habría que cerrarla
   * y volver a abrirla para ver lo que acaba de pasar.
   */
  it("una notificación nueva entra la primera", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ id: "vieja", titleOverride: "Aviso antiguo" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await screen.findByText("Aviso antiguo");

    const emit = realtime.notificationHandlers[0];
    emit?.(notification({ id: "nueva", titleOverride: "Aviso recién llegado" }));

    expect(await screen.findByText("Aviso recién llegado")).toBeInTheDocument();
  });

  /** Y si llega repetida, no se duplica: se sustituye la que ya estaba. */
  it("una notificación repetida no se duplica", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ id: "n1", titleOverride: "Su factura está lista" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await screen.findByText("Su factura está lista");

    realtime.notificationHandlers[0]?.(notification({ id: "n1" }));

    await waitFor(() => expect(screen.getAllByText("Su factura está lista")).toHaveLength(1));
  });

  /** Leída desde otra pestaña: la fila se actualiza sin recargar. */
  it("marcar como leída en otro sitio se refleja aquí", async () => {
    actions.getClientNotifications.mockResolvedValue({
      status: 200,
      data: { items: [notification({ id: "n1" })] },
    });

    render(<ClientNotificationBell initialUnreadCount={1} />);
    await userEvent.click(screen.getByRole("button", { name: "ariaLabel" }));
    await screen.findByText("Su factura está lista");

    realtime.readHandlers[0]?.("n1");

    // La fila sigue ahí; lo que cambia es su estado de leída.
    await waitFor(() => expect(screen.getByText("Su factura está lista")).toBeInTheDocument());
  });
});
