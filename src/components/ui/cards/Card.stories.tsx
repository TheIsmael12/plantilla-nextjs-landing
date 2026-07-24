import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import Button from "@/components/ui/buttons/Button";

import { KeyRoundIcon } from "lucide-react";

import Card from "./Card";

const meta = {
  title: "UI/Cards/Card",
  component: Card,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tarjeta de contenido genérica y reutilizable: cabecera opcional (título + acciones) y un área de contenido, en dos variantes — `surface` (fondo sólido, para secciones de página, p. ej. el detalle de un rol) u `outline` (borde, fondo transparente, para agrupar contenido dentro de otra tarjeta, p. ej. una categoría de permisos dentro del formulario de rol). A diferencia de `SettingsSection`, no lleva icono ni fuerza una descripción.",
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
      description: "Título opcional de la tarjeta.",
    },
    actions: {
      control: false,
      description: "Contenido opcional alineado a la derecha de `title` (p. ej. un botón).",
    },
    variant: {
      control: "select",
      options: ["surface", "outline"],
      description:
        "Variante visual: `surface` (fondo sólido) u `outline` (borde, fondo transparente).",
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
    title: "Datos básicos",
    children: (
      <p style={{ fontSize: 14, color: "var(--neutral-color-active)" }}>
        Contenido de la tarjeta.
      </p>
    ),
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outline: Story = {
  name: "Variante outline (anidada)",
  parameters: {
    docs: {
      description: {
        story:
          "La variante `outline` (borde, sin fondo sólido) está pensada para agrupar contenido dentro de otra `Card`, p. ej. una categoría de permisos dentro del panel de permisos del formulario de rol.",
      },
    },
  },
  args: {
    variant: "outline",
    title: "USER",
  },
};

export const WithActions: Story = {
  name: "Con acciones en la cabecera",
  args: {
    title: undefined,
    actions: (
      <Button title="edit" variant="primary">
        <KeyRoundIcon />
      </Button>
    ),
  },
};

export const TitleOnly: Story = {
  name: "Solo título",
  args: {
    children: undefined,
  },
};

export const NoHeader: Story = {
  name: "Sin cabecera (solo contenido)",
  parameters: {
    docs: {
      description: {
        story: "Sin `title` ni `actions`, la cabecera no se renderiza en absoluto: solo queda el contenido.",
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
    await expect(canvas.getByText("Contenido de la tarjeta.")).toBeInTheDocument();
  },
};

export const NestedCards: Story = {
  name: "Tarjetas anidadas (surface + outline)",
  parameters: {
    docs: {
      description: {
        story:
          "Caso de uso real: una tarjeta `surface` de página (permisos de un rol) que contiene varias tarjetas `outline` (una por categoría de permiso).",
      },
    },
  },
  render: () => (
    <Card title="Permisos">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        <Card variant="outline" title="Usuarios">
          <p style={{ fontSize: 13, color: "var(--neutral-color-active)" }}>
            Crear, editar, eliminar.
          </p>
        </Card>
        <Card variant="outline" title="Roles">
          <p style={{ fontSize: 13, color: "var(--neutral-color-active)" }}>
            Crear, editar, eliminar.
          </p>
        </Card>
      </div>
    </Card>
  ),
};
