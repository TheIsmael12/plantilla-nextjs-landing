import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SessionProvider } from "next-auth/react";

import PreferencesProvider, { type UserPreferences } from "@/context/PreferencesProvider";
import type { UserSession } from "@/types/ui/cards/session-card";

import SessionCard from "./SessionCard";

const PREFERENCES: UserPreferences = {
  language: "es",
  timezone: "Europe/Madrid",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  firstDayOfWeek: "monday",
  theme: "light",
};

const BASE_SESSION: UserSession = {
  id: "d7410cb8-dc14-4b18-8690-9bd404fff66a",
  device: "Desktop",
  os: "Windows",
  browser: "Chrome",
  ip: "203.0.113.7",
  status: "ACTIVE",
  createdAt: "2026-07-02T10:00:00Z",
  lastActivityAt: "2026-07-02T10:15:00Z",
  expiresAt: "2026-07-09T10:00:00Z",
  isCurrent: true,
};

const meta = {
  title: "UI/Cards/SessionCard",
  component: SessionCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Representa una sesión activa (`GET users/me/sessions`): dispositivo/navegador/sistema ya resueltos por el backend, IP, fechas de actividad y expiración, y un botón para revocarla. El icono de dispositivo se elige clasificando `session.device` en móvil/tablet/escritorio (cae en escritorio si no lo reconoce o no viene informado). El botón de revocar solo se muestra si la sesión no es la actual y se recibe `onRevoke`; al ser un botón de solo icono, su nombre accesible lo aporta `ariaLabel` (clave de traducción `Buttons.revoke`/`Buttons.revoking`), nunca texto visible.",
      },
    },
  },
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <PreferencesProvider initialPreferences={PREFERENCES}>
          <div style={{ maxWidth: 480 }}>
            <Story />
          </div>
        </PreferencesProvider>
      </SessionProvider>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    session: {
      control: false,
      description: "Sesión a representar (forma de UserSession).",
    },
    onRevoke: { action: "revoke" },
    isRevoking: {
      control: "boolean",
      description: "Muestra el estado de carga del botón de revocar.",
    },
  },
  args: {
    session: BASE_SESSION,
    onRevoke: fn(),
  },
} satisfies Meta<typeof SessionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentSession: Story = {
  name: "Sesión actual",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando `session.isCurrent` es `true` no se renderiza el botón de revocar, sea cual sea `onRevoke`.",
      },
    },
  },
  args: {
    session: { ...BASE_SESSION, isCurrent: true },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const OtherSession: Story = {
  name: "Otra sesión (revocable)",
  args: {
    session: {
      ...BASE_SESSION,
      id: "a1b2c3d4-1111-2222-3333-444455556666",
      isCurrent: false,
      device: "Desktop",
      os: "Linux",
      browser: "Firefox",
      ip: "198.51.100.23",
    },
  },
};

export const MobileSession: Story = {
  name: "Dispositivo móvil",
  args: {
    session: {
      ...BASE_SESSION,
      id: "mobile-session",
      isCurrent: false,
      device: "Mobile",
      os: "iOS",
      browser: "Safari",
      ip: "192.0.2.44",
    },
  },
};

export const TabletSession: Story = {
  name: "Tablet",
  args: {
    session: {
      ...BASE_SESSION,
      id: "tablet-session",
      isCurrent: false,
      device: "Tablet",
      os: "iOS",
      browser: "Safari",
      ip: "192.0.2.55",
    },
  },
};

export const UnknownDevice: Story = {
  name: "Navegador/SO desconocido",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando la API no informa navegador/sistema (cadena vacía), se muestran los textos de fallback en lugar del nombre de navegador/SO.",
      },
    },
  },
  args: {
    session: {
      ...BASE_SESSION,
      id: "unknown-session",
      isCurrent: false,
      device: "Desktop",
      os: "",
      browser: "",
      ip: "10.0.0.5",
    },
  },
};

export const DeviceNotReported: Story = {
  name: "Sin tipo de dispositivo informado",
  parameters: {
    docs: {
      description: {
        story:
          "Si la API no informa `session.device` (campo opcional), se usa el icono de escritorio por defecto.",
      },
    },
  },
  args: {
    session: {
      ...BASE_SESSION,
      id: "no-device-session",
      isCurrent: false,
      device: undefined,
      os: "Linux",
      browser: "Firefox",
      ip: "198.51.100.99",
    },
  },
};

export const UnrecognizedDevice: Story = {
  name: "Tipo de dispositivo no reconocido",
  parameters: {
    docs: {
      description: {
        story:
          "Si `session.device` no coincide con ninguna categoría conocida (móvil/tablet/escritorio), se usa el icono de escritorio como valor por defecto.",
      },
    },
  },
  args: {
    session: {
      ...BASE_SESSION,
      id: "unrecognized-device-session",
      isCurrent: false,
      device: "SmartTV",
      os: "Tizen",
      browser: "Samsung Internet",
      ip: "192.0.2.77",
    },
  },
};

export const NotRevocable: Story = {
  name: "Sin acción de revocar disponible",
  parameters: {
    docs: {
      description: {
        story:
          "Aunque la sesión no sea la actual, si no se recibe `onRevoke` (por ejemplo mientras la lista de sesiones aún carga) no se muestra el botón de revocar.",
      },
    },
  },
  args: {
    session: {
      ...BASE_SESSION,
      id: "not-revocable-session",
      isCurrent: false,
      device: "Desktop",
      os: "macOS",
      browser: "Safari",
      ip: "192.0.2.10",
    },
    onRevoke: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole("button")).not.toBeInTheDocument();
  },
};

export const Revoking: Story = {
  name: "Revocando…",
  parameters: {
    docs: {
      description: {
        story:
          "Con `isRevoking`, el botón de revocar se deshabilita y su `aria-label` cambia a la clave `Buttons.revoking` para reflejar el estado de carga.",
      },
    },
  },
  args: {
    session: {
      ...BASE_SESSION,
      id: "revoking-session",
      isCurrent: false,
      device: "Desktop",
      os: "Linux",
      browser: "Firefox",
    },
    isRevoking: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /revocando/i });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(args.onRevoke).not.toHaveBeenCalled();
  },
};

export const RevokeInteraction: Story = {
  name: "Interacción: revocar sesión",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic en el botón de revocar (localizado por su nombre accesible) se invoca `onRevoke`.",
      },
    },
  },
  args: {
    session: {
      ...BASE_SESSION,
      id: "revoke-interaction-session",
      isCurrent: false,
      device: "Desktop",
      os: "Linux",
      browser: "Firefox",
      ip: "198.51.100.23",
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /revocar/i });

    await userEvent.click(button);

    await expect(args.onRevoke).toHaveBeenCalled();
  },
};
