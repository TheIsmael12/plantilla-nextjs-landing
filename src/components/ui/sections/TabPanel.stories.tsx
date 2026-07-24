import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import Button from "@/components/ui/buttons/Button";

import TabPanel from "./TabPanel";

const meta = {
  title: "UI/Sections/TabPanel",
  component: TabPanel,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Panel de contenido de una pestaña (`TabsComponent`): una tarjeta simple (fondo + padding + esquinas redondeadas) sin el icono/descripción de `SettingsSection`, pensada para el contenido de una pestaña que ya tiene su propio título en la navegación (p. ej. Detalles del detalle de usuario) y no necesita repetirlo.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 640 }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Título opcional del panel.",
    },
    actions: {
      control: false,
      description: "Contenido opcional alineado a la derecha de `title` (p. ej. un botón).",
    },
    children: {
      control: false,
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales para la raíz.",
    },
  },
  args: {
    children: (
      <p style={{ fontSize: 14, color: "var(--neutral-color-active)" }}>
        Contenido de la pestaña.
      </p>
    ),
  },
} satisfies Meta<typeof TabPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  name: "Con título",
  args: {
    title: "Sesiones",
  },
};

export const WithActions: Story = {
  name: "Con acciones en la cabecera",
  args: {
    title: "Sesiones",
    actions: <Button title="revokeAllOthers" variant="error" />,
  },
};

export const NoHeader: Story = {
  name: "Sin cabecera (solo contenido)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `title` ni `actions`, la cabecera no se renderiza en absoluto: solo queda el contenido, tal y como se usa en la pestaña de Detalles del detalle de usuario (el propio título de la pestaña ya identifica la sección).",
      },
    },
  },
  args: {
    title: undefined,
    actions: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole("heading")).not.toBeInTheDocument();
    await expect(canvas.getByText("Contenido de la pestaña.")).toBeInTheDocument();
  },
};
