import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { expect, fn, userEvent, within } from "storybook/test";

import { OctagonXIcon, ServerCrashIcon } from "lucide-react";

import ErrorState from "./ErrorState";

const storyMessages = {
  Common: {
    Errors: {
      generic: "Ha ocurrido un error inesperado.",
    },
  },
};

const meta = {
  title: "UI/Errors/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Estado de error genérico para secciones que fallan al cargar datos (listados, widgets, paneles). Muestra un icono, un título (traducido a `Common.Errors.generic` si no se indica uno propio), el mensaje descriptivo del fallo y, opcionalmente, una acción (normalmente un botón de reintentar). El contenedor lleva `role=\"alert\"` para que los lectores de pantalla anuncien el error en cuanto aparece.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => (
      <NextIntlClientProvider
        locale={(context.globals.locale as string) || "es"}
        messages={storyMessages}
      >
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  argTypes: {
    title: {
      control: "text",
      description:
        'Título del error; si se omite se usa la traducción "Common.Errors.generic".',
    },
    message: {
      control: "text",
      description: "Mensaje descriptivo del error.",
    },
    icon: {
      control: false,
      description:
        "Icono (componente de lucide-react) mostrado sobre el título; por defecto AlertTriangleIcon.",
    },
    action: {
      control: false,
      description:
        "Contenido opcional bajo el mensaje (p. ej. un botón de reintentar).",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales aplicadas al contenedor principal.",
    },
  },
  args: {
    message: "No se pudo conectar con el servidor.",
  },
} satisfies Meta<typeof ErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTitle: Story = {
  name: "Con título propio",
  args: { title: "No se pudieron cargar los usuarios" },
};

const handleRetry = fn();

export const WithAction: Story = {
  name: "Con acción de reintentar",
  args: {
    action: (
      <button
        type="button"
        className="btn btn--primary btn--md"
        onClick={handleRetry}
      >
        Reintentar
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const retryButton = canvas.getByRole("button", { name: /reintentar/i });

    await userEvent.click(retryButton);

    await expect(handleRetry).toHaveBeenCalled();
  },
};

export const WithCustomIcon: Story = {
  name: "Con icono personalizado",
  args: {
    title: "Error del servidor",
    message: "El servidor ha respondido con un error 500.",
    icon: ServerCrashIcon,
  },
};

export const WithClassName: Story = {
  name: "Con clase adicional",
  parameters: {
    docs: {
      description: {
        story:
          "Ejemplo del uso de `className` para ajustar el contenedor desde fuera (p. ej. limitar su ancho).",
      },
    },
  },
  args: {
    className: "custom-error-state",
    title: "No se pudo completar la operación",
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360, border: "1px dashed var(--border-color)" }}>
        <Story />
      </div>
    ),
  ],
};

export const AccessibleRole: Story = {
  name: "Rol accesible (role=alert)",
  parameters: {
    docs: {
      description: {
        story:
          "Verifica que el contenedor expone `role=\"alert\"`, de forma que un lector de pantalla anuncie el error automáticamente en cuanto se monta, sin necesidad de que el usuario navegue hasta él.",
      },
    },
  },
  args: {
    title: "No se pudieron cargar los usuarios",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const alertEl = canvas.getByRole("alert");

    await expect(alertEl).toBeInTheDocument();
    await expect(
      within(alertEl).getByText("No se pudieron cargar los usuarios"),
    ).toBeInTheDocument();
  },
};

export const AllIcons: Story = {
  name: "Comparativa de iconos",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <ErrorState {...args} title="Por defecto" />
      <ErrorState {...args} title="Servidor caído" icon={ServerCrashIcon} />
      <ErrorState {...args} title="Acceso denegado" icon={OctagonXIcon} />
    </div>
  ),
};
