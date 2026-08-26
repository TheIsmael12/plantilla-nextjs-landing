import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Session } from "next-auth/react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { vi } from "vitest";

import User from "./User";

// `signOut` de `next-auth/react` intentaría un fetch real (revocar la sesión
// en el backend, y luego navegar de verdad vía `window.location.href`) si no
// se mockea. Se probó `spyOn` (de `storybook/test`) sobre el namespace del
// módulo en vez de `vi.mock`, para no romper el Storybook "de verdad"
// (`pnpm storybook`) — pero no funciona: `User.tsx` ya tiene su propia
// referencia a `signOut` resuelta en otro momento/contexto (el bridge
// navegador↔Vitest de `@storybook/addon-vitest`), así que mutar el
// namespace desde el `play` no la alcanza (test verificado: `signOut` nunca
// se llama). `vi.mock` sí intercepta la resolución del módulo en origen y
// llega a ambos lados — mismo patrón ya usado en
// `TwoFactorSetupModal`/`TwoFactorDisableModal` para sus propias
// dependencias. Coste conocido y ya aceptado en este proyecto: con `vi.mock`
// a nivel de módulo, este archivo (igual que esos dos) falla con
// "Cannot read properties of undefined (reading 'customEqualityTesters')"
// si se abre directamente en `pnpm storybook` (dev-mode, sin el runner de
// Vitest) — pero funciona correctamente bajo `pnpm test:storybook:full`,
// que es de donde sale la cobertura real.
vi.mock("next-auth/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-auth/react")>();
  return {
    ...actual,
    signOut: vi.fn(),
  };
});

const { SessionProvider, signOut } = await import("next-auth/react");
const mockSignOut = vi.mocked(signOut);

// ─── Mock sessions ────────────────────────────────────────────────────────────

const sessionAuthenticated: Session = {
  user: {
    id: "1",
    username: "ismael.ben",
    firstName: "Ismael",
    lastName: "Ben",
    email: "ismael.ben@imora.es",
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

const sessionNoName: Session = {
  user: {
    id: "2",
    username: "usuario",
    firstName: "",
    lastName: "",
    email: "usuario@imora.es",
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

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: "UI/Navigations/User",
  component: User,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
    docs: {
      description: {
        component:
          "Trigger de usuario en la navbar: muestra avatar, nombre y un menú desplegable con accesos rápidos al perfil y cierre de sesión.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof User>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Unauthenticated: Story = {
  name: "Sin sesión",
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Estado sin sesión activa: muestra el avatar por defecto sin nombre.",
      },
    },
  },
};

export const Authenticated: Story = {
  name: "Autenticado con nombre",
  decorators: [
    (Story) => (
      <SessionProvider session={sessionAuthenticated}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const AuthenticatedNoName: Story = {
  name: "Autenticado sin nombre",
  decorators: [
    (Story) => (
      <SessionProvider session={sessionNoName}>
        <Story />
      </SessionProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: "Usuario autenticado cuyo nombre no está disponible: el menú sigue siendo accesible.",
      },
    },
  },
};

export const MenuOpen: Story = {
  name: "Menú abierto",
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", minHeight: "22rem" }}>
        <SessionProvider session={sessionAuthenticated}>
          <Story />
        </SessionProvider>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await userEvent.click(trigger);
  },
};

export const ClosesOnOutsideClick: Story = {
  name: "Interacción — cierra al hacer click fuera",
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", minHeight: "22rem" }}>
        <SessionProvider session={sessionAuthenticated}>
          <Story />
        </SessionProvider>
        <p data-testid="outside">Fuera del menú</p>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "El menú desplegable se cierra al detectar un click fuera de él, vía `useOutsideClick`.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(canvas.getByTestId("outside"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const ClosesOnMenuItemClick: Story = {
  name: "Interacción — cierra al navegar desde el menú",
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", minHeight: "22rem" }}>
        <SessionProvider session={sessionAuthenticated}>
          <Story />
        </SessionProvider>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Pulsar cualquier enlace del menú (p. ej. «Mi perfil») lo cierra de inmediato, sin esperar al cambio de ruta.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(canvas.getByRole("link", { name: /Mi perfil/i }));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const LogoutFlow: Story = {
  name: "Interacción — confirmar / cancelar / cerrar cierre de sesión",
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", minHeight: "22rem" }}>
        <SessionProvider session={sessionAuthenticated}>
          <Story />
        </SessionProvider>
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Cubre las tres salidas del modal de confirmación de cierre de sesión: cerrarlo con el botón «X» (`onClose`), cancelarlo con «Cancelar» (`onCancel`) y confirmarlo (`onConfirm`/`handleLogout`, que invoca `signOut`).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    mockSignOut.mockClear();

    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button");

    // 1) Abre el menú y pulsa «Cerrar sesión»: abre el modal de confirmación.
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByText("Cerrar sesión"));
    expect(body.getByRole("dialog")).toBeInTheDocument();

    // 2) Botón «X» del modal → onClose.
    const closeButtons = body.getAllByRole("button", { name: "Cancelar" });
    await userEvent.click(closeButtons[0]!);
    expect(body.queryByRole("dialog")).not.toBeInTheDocument();

    // 3) Reabre y cancela con el botón «Cancelar» del footer → onCancel.
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByText("Cerrar sesión"));
    expect(body.getByRole("dialog")).toBeInTheDocument();

    const cancelButtons = body.getAllByRole("button", { name: "Cancelar" });
    await userEvent.click(cancelButtons[cancelButtons.length - 1]!);
    expect(body.queryByRole("dialog")).not.toBeInTheDocument();

    // 4) Reabre y confirma → handleLogout → signOut.
    await userEvent.click(trigger);
    await userEvent.click(canvas.getByText("Cerrar sesión"));
    const confirmButton = body.getByRole("button", { name: "Cerrar sesión" });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
    });
  },
};

export const MenuOpenActiveProfile: Story = {
  name: "Menú abierto — perfil activo",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile" },
    },
    docs: {
      description: {
        story: "El ítem «Mi perfil» aparece resaltado porque /profile es la ruta actual.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", minHeight: "22rem" }}>
        <SessionProvider session={sessionAuthenticated}>
          <Story />
        </SessionProvider>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button");
    await userEvent.click(trigger);
  },
};
