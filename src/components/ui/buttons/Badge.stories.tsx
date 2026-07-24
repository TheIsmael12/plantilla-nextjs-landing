import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { BadgeCheckIcon } from "lucide-react";

import { ALERT_ICONS } from "@/constants/ui/alerts";
import Badge from "./Badge";

const meta = {
  title: "UI/Buttons/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Insignia (badge) del sistema de diseño: una pequeña píldora de color usada para estados (activo/bloqueado...), verificaciones (correo verificado) u otras etiquetas cortas. Comparte la misma paleta semántica que `Alert` (info/success/warning/error/danger/neutral). Sin `children` ni `text` se usa el propio `variant` como texto de respaldo.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["info", "success", "warning", "error", "danger", "neutral"],
      description: "Variante visual de la insignia: determina el color de fondo/texto.",
    },
    text: {
      control: "text",
      description: "Texto mostrado en la insignia; se ignora si se pasa `children`.",
    },
    icon: {
      control: false,
      description: "Icono opcional (componente de lucide-react) mostrado antes del texto.",
    },
    children: {
      control: false,
      description:
        "Contenido personalizado; si se omite se usa `text`, y si tampoco hay `text` se usa el propio `variant` como texto de respaldo.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales para el elemento `<p>`.",
    },
  },
  args: {
    variant: "neutral",
    text: "Etiqueta",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    variant: "neutral",
    text: "Etiqueta",
  },
};

export const Info: Story = {
  name: "Información",
  args: {
    variant: "info",
    text: "Información",
  },
};

export const Success: Story = {
  name: "Éxito",
  args: {
    variant: "success",
    text: "Activo",
  },
};

export const Warning: Story = {
  name: "Advertencia",
  args: {
    variant: "warning",
    text: "Pendiente",
  },
};

export const ErrorVariant: Story = {
  name: "Error",
  args: {
    variant: "error",
    text: "Rechazado",
  },
};

export const Danger: Story = {
  name: "Peligro",
  args: {
    variant: "danger",
    text: "Bloqueado",
  },
};

export const Neutral: Story = {
  name: "Neutro",
  args: {
    variant: "neutral",
    text: "Borrador",
  },
};

export const WithIcon: Story = {
  name: "Con icono",
  args: {
    variant: "success",
    text: "Verificado",
    icon: BadgeCheckIcon,
  },
};

export const WithChildren: Story = {
  name: "Con contenido hijo",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando se pasa `children`, tiene prioridad sobre `text`: permite componer contenido personalizado (p. ej. varios nodos) en lugar de un simple string.",
      },
    },
  },
  args: {
    variant: "info",
    text: "Este texto se ignora",
    children: (
      <>
        <BadgeCheckIcon className="badge__icon" />
        Correo verificado
      </>
    ),
  },
};

export const FallbackToVariant: Story = {
  name: "Sin texto: usa la variante como respaldo",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `text` ni `children`, la insignia usa el propio nombre de `variant` como contenido de respaldo.",
      },
    },
  },
  args: {
    variant: "warning",
    text: undefined,
    children: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("warning")).toBeInTheDocument();
  },
};

export const LongText: Story = {
  name: "Texto largo",
  parameters: {
    docs: {
      description: {
        story:
          "La insignia no trunca el contenido: con un texto largo, la píldora simplemente ajusta su ancho al contenido.",
      },
    },
  },
  args: {
    variant: "info",
    text: "Este es un texto de insignia inusualmente largo para comprobar su comportamiento",
  },
};

export const AllVariants: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge {...args} variant="info" text="Información" />
      <Badge {...args} variant="success" text="Activo" />
      <Badge {...args} variant="warning" text="Pendiente" />
      <Badge {...args} variant="error" text="Rechazado" />
      <Badge {...args} variant="danger" text="Bloqueado" />
      <Badge {...args} variant="neutral" text="Borrador" />
    </div>
  ),
};

export const AllVariantsWithIcon: Story = {
  name: "Todas las variantes con icono",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Badge {...args} variant="info" text="Información" icon={ALERT_ICONS.info} />
      <Badge {...args} variant="success" text="Activo" icon={ALERT_ICONS.success} />
      <Badge {...args} variant="warning" text="Pendiente" icon={ALERT_ICONS.warning} />
      <Badge {...args} variant="error" text="Rechazado" icon={ALERT_ICONS.error} />
      <Badge {...args} variant="danger" text="Bloqueado" icon={ALERT_ICONS.danger} />
      <Badge {...args} variant="neutral" text="Borrador" icon={ALERT_ICONS.neutral} />
    </div>
  ),
};
