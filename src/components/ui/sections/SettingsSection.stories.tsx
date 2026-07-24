import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import Button from "@/components/ui/buttons/Button";

import { KeyRoundIcon, ShieldCheckIcon } from "lucide-react";

import SettingsSection from "./SettingsSection";

const meta = {
  title: "UI/Sections/SettingsSection",
  component: SettingsSection,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Envoltorio común para las secciones de ajustes de perfil (Preferencias, Seguridad, Sesiones): icono, título y descripción opcionales en la cabecera (separada del contenido por un divisor), acciones alineadas con la cabecera, y pensado para apilar varias en la misma página sin que se confundan entre sí.",
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
      description:
        "Título de la sección; se omite en páginas de un único propósito ya tituladas por TitleComponent.",
    },
    description: {
      control: "text",
      description: "Breve explicación de qué controla la sección.",
    },
    icon: {
      control: false,
      description:
        "Icono (componente de lucide-react) que identifica la sección de un vistazo cuando hay varias en la misma página.",
    },
    actions: {
      control: false,
      description: "Contenido opcional alineado con la cabecera (p. ej. un botón).",
    },
    children: {
      control: false,
    },
  },
  args: {
    title: "Cambiar contraseña",
    description: "Usa una contraseña de al menos 15 caracteres.",
    icon: KeyRoundIcon,
    children: (
      <p style={{ fontSize: 14, color: "var(--neutral-color-active)" }}>
        Contenido de la sección.
      </p>
    ),
  },
} satisfies Meta<typeof SettingsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DescriptionOnly: Story = {
  name: "Solo descripción (páginas de un único propósito)",
  args: {
    title: undefined,
    description:
      "Gestiona tu zona horaria y preferencias de formato de fecha.",
  },
};

export const WithActions: Story = {
  name: "Con acciones en la cabecera",
  args: {
    title: undefined,
    icon: undefined,
    description: "Estos son los dispositivos que tienen una sesión activa en tu cuenta.",
    actions: <Button title="revokeOthers" variant="error" />,
  },
};

export const TitleOnly: Story = {
  name: "Solo título",
  args: {
    description: undefined,
    icon: undefined,
  },
};

export const FullHeader: Story = {
  name: "Cabecera completa (icono, título, descripción y acciones)",
  args: {
    actions: <Button title="revokeOthers" variant="error" />,
  },
};

export const NoHeader: Story = {
  name: "Sin cabecera (solo contenido)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `title`, `description` ni `actions` la cabecera no se renderiza en absoluto (incluido el icono, que por sí solo no basta para mostrarla): solo queda el contenido.",
      },
    },
  },
  args: {
    title: undefined,
    description: undefined,
    icon: undefined,
    actions: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole("heading")).not.toBeInTheDocument();
    await expect(
      canvas.getByText("Contenido de la sección."),
    ).toBeInTheDocument();
  },
};

export const IconAloneRendersNoHeader: Story = {
  name: "Icono sin título/descripción/acciones (sin cabecera)",
  parameters: {
    docs: {
      description: {
        story:
          "Caso límite a tener en cuenta: `icon` por sí solo no activa la cabecera (`hasHeader` depende de `title`, `description` o `actions`), así que un icono sin acompañamiento textual nunca llega a mostrarse.",
      },
    },
  },
  args: {
    title: undefined,
    description: undefined,
    actions: undefined,
  },
  play: async ({ canvasElement }) => {
    expect(
      canvasElement.querySelector(".settings-section__icon"),
    ).not.toBeInTheDocument();
    expect(
      canvasElement.querySelector(".settings-section__header"),
    ).not.toBeInTheDocument();
  },
};

export const EmptyContent: Story = {
  name: "Sin contenido (solo cabecera)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `children` el área de contenido no se renderiza: la sección queda reducida a su cabecera.",
      },
    },
  },
  args: {
    children: undefined,
  },
  play: async ({ canvasElement }) => {
    expect(
      canvasElement.querySelector(".settings-section__content"),
    ).not.toBeInTheDocument();
    await expect(
      within(canvasElement).getByRole("heading", { name: "Cambiar contraseña" }),
    ).toBeInTheDocument();
  },
};

export const StackedSections: Story = {
  name: "Varias secciones apiladas",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando varias SettingsSection se apilan en la misma página, cada una queda claramente delimitada (tarjeta propia) y el icono ayuda a distinguirlas de un vistazo.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <SettingsSection
        title="Cambiar contraseña"
        description="Usa una contraseña de al menos 15 caracteres."
        icon={KeyRoundIcon}
      >
        <p style={{ fontSize: 14, color: "var(--neutral-color-active)" }}>
          Formulario de cambio de contraseña.
        </p>
      </SettingsSection>

      <SettingsSection
        title="Autenticación de dos factores"
        description="Gestiona la autenticación de dos factores para proteger tu cuenta."
        icon={ShieldCheckIcon}
      >
        <p style={{ fontSize: 14, color: "var(--neutral-color-active)" }}>
          Toggle de 2FA.
        </p>
      </SettingsSection>
    </div>
  ),
};
