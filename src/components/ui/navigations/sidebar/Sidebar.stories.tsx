import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import Sidebar from "./Sidebar";

const meta = {
  title: "UI/Navigations/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
    docs: {
      description: {
        component:
          "Panel de navegación lateral. En mobile es un drawer off-canvas que se comporta como un overlay modal (bloquea el scroll del body y se cierra al hacer click fuera, con Escape o al navegar a otra ruta); en desktop (≥ 1024px) aparece como panel sticky siempre visible. Muestra las rutas de PRIVATE_ROUTES marcadas con isShownInSidebar.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controla la visibilidad del drawer (relevante en mobile).",
    },
    onClose: { action: "closed" },
  },
  args: {
    isOpen: true,
    onClose: fn(),
  },
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Layout helper ────────────────────────────────────────────────────────────

const SidebarWrapper = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", height: "100dvh", position: "relative" }}>
    {children}
  </div>
);

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Open: Story = {
  name: "Abierto — Dashboard activo",
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
};

export const Closed: Story = {
  name: "Cerrado",
  args: { isOpen: false },
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
  parameters: {
    docs: {
      description: {
        story: "Estado colapsado en mobile: el panel está fuera de pantalla.",
      },
    },
  },
};

export const OpenWithDeepPath: Story = {
  name: "Abierto — ruta profunda",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/sessions" },
    },
    docs: {
      description: {
        story: "El sidebar no marca ningún ítem activo porque /profile/sessions no está en isShownInSidebar.",
      },
    },
  },
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
};

// ─── Interacciones ────────────────────────────────────────────────────────────

export const ClosesOnNavigate: Story = {
  name: "Interacción — cierra al pulsar un enlace",
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
  parameters: {
    docs: {
      description: {
        story:
          "Cada enlace del menú invoca `onClose` directamente al pulsarse (además de al detectar el cambio de ruta), para cerrar el drawer en mobile sin esperar a la navegación.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const usersLink = canvas.getByRole("link", { name: /Usuarios/i });

    await userEvent.click(usersLink);

    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const ClosesOnEscape: Story = {
  name: "Interacción — cierra con Escape",
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
  parameters: {
    docs: {
      description: {
        story:
          "El drawer se comporta como un overlay modal en mobile: además de cerrarse al hacer click fuera, la tecla Escape también invoca `onClose` para no dejar una vía de cierre exclusiva de ratón.",
      },
    },
  },
  play: async ({ args }) => {
    // Otras teclas no deben cerrar el drawer.
    await userEvent.keyboard("a");
    await expect(args.onClose).not.toHaveBeenCalled();

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const ClosesOnOutsideClick: Story = {
  name: "Interacción — cierra al hacer click fuera",
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
  parameters: {
    docs: {
      description: {
        story:
          "Al pulsar sobre el overlay (o cualquier elemento fuera del `aside`) se invoca `onClose`, vía `useOutsideClick`.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const overlay = canvasElement.querySelector(".sidebar__overlay");
    expect(overlay).not.toBeNull();

    await userEvent.click(overlay as Element);

    await expect(args.onClose).toHaveBeenCalled();
  },
};

export const WithoutOnCloseHandler: Story = {
  name: "Interacción — sin onClose (opcional)",
  args: { onClose: undefined },
  decorators: [(Story) => <SidebarWrapper><Story /></SidebarWrapper>],
  parameters: {
    docs: {
      description: {
        story:
          "`onClose` es opcional (`onClose?: () => void`): al no recibirlo, click fuera y Escape no deben lanzar ningún error, simplemente no hacen nada.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const overlay = canvasElement.querySelector(".sidebar__overlay");
    expect(overlay).not.toBeNull();

    await userEvent.click(overlay as Element);
    await userEvent.keyboard("{Escape}");

    // No debe lanzar: el aside sigue montado (isOpen no cambia sin onClose).
    expect(canvasElement.querySelector("aside")).toBeInTheDocument();
  },
};
