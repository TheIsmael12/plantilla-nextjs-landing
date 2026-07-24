import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { expect, fn, userEvent, within } from "storybook/test";

import { BotIcon, SaveIcon, XIcon } from "lucide-react";
import Button from "./Button";

const storyMessages = {
  Buttons: {
    guardar: "Guardar",
    cancelar: "Cancelar",
    aceptar: "Aceptar",
    eliminar: "Eliminar",
    enviar: "Enviar",
    editar: "Editar",
    confirmar: "Confirmar",
    accion: "Acción",
  },
};

const meta = {
  title: "UI/Buttons/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Botón base del sistema de diseño. Centraliza las variantes semánticas de color, los tamaños y la resolución de `title`/`ariaLabel` como claves de traducción del namespace `Buttons`, para que ningún componente de negocio tenga que llamar a `useTranslations` solo para pasarle un texto ya traducido. Sin `variant` se usa el estilo base sin color semántico (por ejemplo, el botón de cerrar de un modal).",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, contitle) => (
      <NextIntlClientProvider
        locale={(contitle.globals.locale as string) || "es"}
        messages={storyMessages}
      >
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "primary",
        "secondary",
        "outline",
        "fill-color",
        "danger",
        "error",
        "info",
        "success",
        "warning",
        "outline-primary",
        "outline-secondary",
        "outline-danger",
        "outline-error",
        "outline-info",
        "outline-success",
        "outline-warning",
      ],
      description: "Variante visual del botón.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "full"],
      description: "Tamaño del botón.",
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
      description: "Tipo HTML del botón.",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el botón impidiendo cualquier interacción.",
    },
    title: {
      control: "select",
      options: Object.keys(storyMessages.Buttons),
      description:
        "Clave de traducción para el atributo title (tooltip) del botón.",
    },
    children: {
      control: false,
      description:
        "Contenido hijo renderizado directamente (titleo, iconos, etc.).",
    },
    ariaLabel: {
      control: "select",
      options: Object.keys(storyMessages.Buttons),
      description: "Clave de traducción para el aria-label del botón.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales para el elemento `<button>`.",
    },
    onClick: { action: "clicked" },
  },
  args: {
    title: "accion",
    size: "md",
    disabled: false,
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "guardar",
  },
};

export const Primary: Story = {
  name: "Primario",
  args: {
    variant: "primary",
    title: "guardar",
  },
};

export const Secondary: Story = {
  name: "Secundario",
  args: {
    variant: "secondary",
    title: "cancelar",
  },
};

export const Outline: Story = {
  name: "Contorno",
  args: {
    variant: "outline",
    title: "cancelar",
  },
};

export const Danger: Story = {
  name: "Peligro",
  args: {
    variant: "danger",
    title: "eliminar",
  },
};

export const ErrorVariant: Story = {
  name: "Error",
  args: {
    variant: "error",
    title: "aceptar",
  },
};

export const Info: Story = {
  name: "Información",
  args: {
    variant: "info",
    title: "aceptar",
  },
};

export const Success: Story = {
  name: "Éxito",
  args: {
    variant: "success",
    title: "guardar",
  },
};

export const Warning: Story = {
  name: "Advertencia",
  args: {
    variant: "warning",
    title: "aceptar",
  },
};

export const FillColor: Story = {
  name: "Acento (fill-color)",
  parameters: {
    docs: {
      description: {
        story:
          "Variante de acento (`--fill-color`, lima): fondo sólido con texto oscuro en vez de claro, por contraste con un color de fondo tan claro.",
      },
    },
  },
  args: {
    variant: "fill-color",
    title: "confirmar",
  },
};

export const OutlinePrimary: Story = {
  name: "Contorno primario",
  args: {
    variant: "outline-primary",
    title: "confirmar",
  },
};

export const OutlineSecondary: Story = {
  name: "Contorno secundario",
  args: {
    variant: "outline-secondary",
    title: "cancelar",
  },
};

export const OutlineDanger: Story = {
  name: "Contorno peligro",
  args: {
    variant: "outline-danger",
    title: "eliminar",
  },
};

export const OutlineError: Story = {
  name: "Contorno error",
  args: {
    variant: "outline-error",
    title: "aceptar",
  },
};

export const OutlineInfo: Story = {
  name: "Contorno información",
  args: {
    variant: "outline-info",
    title: "aceptar",
  },
};

export const OutlineSuccess: Story = {
  name: "Contorno éxito",
  args: {
    variant: "outline-success",
    title: "guardar",
  },
};

export const OutlineWarning: Story = {
  name: "Contorno advertencia",
  args: {
    variant: "outline-warning",
    title: "aceptar",
  },
};

export const Small: Story = {
  name: "Tamaño pequeño",
  args: {
    size: "sm",
    children: <BotIcon />,
  },
};

export const FullWidth: Story = {
  name: "Ancho completo",
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    size: "full",
    title: "enviar",
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    title: "guardar",
    disabled: true,
  },
};

export const WithChildren: Story = {
  name: "Con contenido hijo",
  args: {
    title: "guardar",
    children: <SaveIcon />,
  },
};

export const Submit: Story = {
  name: "Tipo submit",
  args: {
    type: "submit",
    title: "enviar",
  },
};

export const Reset: Story = {
  name: "Tipo reset",
  args: {
    type: "reset",
    variant: "outline",
    title: "cancelar",
  },
};

export const NoVariant: Story = {
  name: "Sin variante",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `variant` el botón usa el estilo base sin color semántico, pensado para casos como el botón de cerrar de un modal.",
      },
    },
  },
  args: {
    title: "cancelar",
  },
};

export const IconOnlyWithAriaLabel: Story = {
  name: "Solo icono con aria-label",
  parameters: {
    docs: {
      description: {
        story:
          "Botón sin texto visible: al no recibir `title`, el nombre accesible lo aporta `ariaLabel`, imprescindible para que sea utilizable con lectores de pantalla.",
      },
    },
  },
  args: {
    title: undefined,
    ariaLabel: "cancelar",
    children: <XIcon aria-hidden="true" />,
  },
};

export const ClickInteraction: Story = {
  name: "Interacción: clic",
  parameters: {
    docs: {
      description: {
        story: "Prueba de interacción: al hacer clic se invoca `onClick`.",
      },
    },
  },
  args: {
    title: "guardar",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /guardar/i });

    await userEvent.click(button);

    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const DisabledNoInteraction: Story = {
  name: "Interacción: deshabilitado no dispara onClick",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: un botón deshabilitado no responde al clic (ni de ratón ni de teclado) y `onClick` nunca se invoca.",
      },
    },
  },
  args: {
    title: "guardar",
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: /guardar/i });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AllVariants: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="outline">
        Outline
      </Button>
      <Button {...args} variant="danger">
        Danger
      </Button>
      <Button {...args} variant="error">
        Error
      </Button>
      <Button {...args} variant="info">
        Info
      </Button>
      <Button {...args} variant="success">
        Success
      </Button>
      <Button {...args} variant="warning">
        Warning
      </Button>
      <Button {...args} variant="fill-color">
        Fill color
      </Button>
      <Button {...args} variant="outline-primary">
        Outline primary
      </Button>
      <Button {...args} variant="outline-secondary">
        Outline secondary
      </Button>
      <Button {...args} variant="outline-danger">
        Outline danger
      </Button>
      <Button {...args} variant="outline-error">
        Outline error
      </Button>
      <Button {...args} variant="outline-info">
        Outline info
      </Button>
      <Button {...args} variant="outline-success">
        Outline success
      </Button>
      <Button {...args} variant="outline-warning">
        Outline warning
      </Button>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "Todos los tamaños",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: 200,
      }}
    >
      <Button {...args} size="sm">
        <BotIcon />
      </Button>
      <Button {...args} size="md">
        Mediano (md)
      </Button>
      <Button {...args} size="full">
        Completo (full)
      </Button>
    </div>
  ),
};
