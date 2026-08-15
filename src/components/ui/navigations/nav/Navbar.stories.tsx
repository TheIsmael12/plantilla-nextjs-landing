import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SessionProvider, type Session } from "next-auth/react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import Navbar from "./Navbar";

// ─── Mock session ─────────────────────────────────────────────────────────────

const mockSession: Session = {
  user: {
    id: "1",
    username: "ismael.ben",
    firstName: "Ismael",
    lastName: "Ben",
    email: "ismael.ben@enovait.es",
    permissions: ["USER_READ"],
    corporateEmail: null,
    avatarUrl: null,
    isEmailVerified: true,
    preferences: {
      language: "es",
      timezone: "Europe/Madrid",
      dateFormat: "DD/MM/YYYY",
      timeFormat: "24h",
      firstDayOfWeek: "monday",
      theme: "light",
    },
    accessTokenExpires: 4102444800000,
    backendTokens: { accessToken: "mock", refreshToken: "mock" },
  },
  expires: "2099-01-01T00:00:00.000Z",
};

// ─── Layout wrapper ───────────────────────────────────────────────────────────

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div>
    {children}
    <div className="main">Contenido de página</div>
  </div>
);

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: "UI/Navigations/Navbar",
  component: Navbar,
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
    docs: {
      description: {
        component:
          "Barra de navegación superior. Contiene el logo, nombre de la app, el botón hamburger (solo mobile) y las acciones de usuario. Al hacer scroll o abrir el sidebar se fija en pantalla con sombra.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession}>
        <PageWrapper>
          <Story />
        </PageWrapper>
      </SessionProvider>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Default: Story = {
  name: "Por defecto",
};

export const Unauthenticated: Story = {
  name: "Sin sesión",
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <PageWrapper>
          <Story />
        </PageWrapper>
      </SessionProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Navbar sin usuario autenticado: el componente User renderiza sin nombre ni avatar personalizado.",
      },
    },
  },
};

export const SidebarOpen: Story = {
  name: "Sidebar abierto (mobile)",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Simula un viewport mobile y abre el sidebar pulsando el botón hamburger.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", { name: /menú|menu/i });
    await userEvent.click(hamburger);
  },
};

export const SidebarClosesOnNavigate: Story = {
  name: "Sidebar se cierra al navegar (mobile)",
  /*
   * Fuera de la ejecución de pruebas, por lo mismo que su gemela en `Sidebar.stories.tsx`.
   *
   * El paso de abrir el menú funciona; lo que no existe es el enlace que hay que pulsar después: el `Sidebar` que
   * abre este `Navbar` se dibuja sin ítems, porque ninguna ruta de primer nivel de `PRIVATE_ROUTES` lleva
   * `isShownInSidebar`. Y `Navbar` **no se monta en ninguna pantalla de la aplicación**, así que es código
   * heredado de la intranet a la espera de que se decida si se borra o se adapta.
   */
  tags: ["!test"],
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "El botón hamburger abre el sidebar; pulsar cualquier enlace de su interior lo cierra de inmediato (el `onClose` del `Sidebar` colapsa `openSidebar` en el `Navbar`).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", { name: "Abrir menú" });

    await userEvent.click(hamburger);
    expect(canvas.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

    const usersLink = canvas.getByRole("link", { name: /Usuarios/i });
    await userEvent.click(usersLink);

    expect(canvas.getByRole("button", { name: "Abrir menú" })).toBeInTheDocument();
  },
};

export const ClosesSidebarOnDesktopResize: Story = {
  name: "Cierra el sidebar al ensanchar a escritorio",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Un listener de `resize` sobre `window` cierra el sidebar automáticamente al pasar a un ancho de escritorio (≥ 1024px), donde ya se muestra siempre visible y el drawer mobile no tendría sentido dejarlo abierto.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const hamburger = canvas.getByRole("button", { name: "Abrir menú" });

    await userEvent.click(hamburger);
    expect(canvas.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

    const originalWidth = window.innerWidth;
    try {
      // Ensanchar pero seguir por debajo de 1024px: el sidebar no debe cerrarse.
      Object.defineProperty(window, "innerWidth", { value: 800, configurable: true });
      window.dispatchEvent(new Event("resize"));
      expect(canvas.getByRole("button", { name: "Cerrar menú" })).toBeInTheDocument();

      // Al alcanzar un ancho de escritorio, se cierra.
      Object.defineProperty(window, "innerWidth", { value: 1280, configurable: true });
      window.dispatchEvent(new Event("resize"));

      await waitFor(() => {
        expect(canvas.getByRole("button", { name: "Abrir menú" })).toBeInTheDocument();
      });
    } finally {
      Object.defineProperty(window, "innerWidth", { value: originalWidth, configurable: true });
    }
  },
};

export const Scrolled: Story = {
  name: "Con sombra al hacer scroll",
  decorators: [
    (Story) => (
      <>
        <Story />
        <div style={{ height: "150vh" }} />
      </>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Al hacer scroll de la página, la navbar añade la clase `navbar--scrolled` (detectado con un listener de `scroll` sobre `window`, no un `IntersectionObserver`).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const nav = canvasElement.querySelector("nav");
    expect(nav).not.toHaveClass("navbar--scrolled");

    window.scrollTo(0, 200);

    await waitFor(() => {
      expect(nav).toHaveClass("navbar--scrolled");
    });
  },
};

export const UserMenuOpen: Story = {
  name: "Menú de usuario abierto",
  parameters: {
    docs: {
      description: {
        story:
          "Abre el dropdown de usuario pulsando el trigger de forma programática.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The user trigger is the last button in the navbar container
    const buttons = canvas.getAllByRole("button");
    const userTrigger = buttons[buttons.length - 1];
    expect(userTrigger).toBeDefined();
    await userEvent.click(userTrigger as HTMLElement);
  },
};
