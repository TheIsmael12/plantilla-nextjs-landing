import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import Alert from "./Alert";

const meta = {
  title: "UI/Alerts/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Alerta contextual (`role=\"alert\"`, anunciada automáticamente por lectores de pantalla) que muestra un mensaje junto a un icono según su `type` (info, success, warning, error, danger, neutral). Si se recibe `onClose` se muestra además un botón de cierre accesible; en caso contrario la alerta es puramente informativa y no ofrece ninguna interacción.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    type: {
      control: "select",
      options: ["info", "success", "warning", "error", "danger", "neutral"],
      description: "Tipo de alerta: define el icono y el color del alert.",
    },
    message: {
      control: "text",
      description: "Texto informativo mostrado en el alert.",
    },
    onClose: {
      control: false,
      description:
        "Manejador de cierre. Si se omite, no se muestra botón de cierre.",
    },
    id: {
      control: "text",
      description:
        "Id del contenedor, útil para asociarlo desde `aria-describedby` u otro elemento.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales para el contenedor.",
    },
  },
  args: {
    id: "alert-story",
    type: "info",
    message: "Recuerda verificar tu correo electrónico.",
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  name: "Información",
  args: {
    type: "info",
    message: "Recuerda verificar tu correo electrónico.",
  },
};

export const Success: Story = {
  name: "Éxito",
  args: {
    type: "success",
    message: "Tu cuenta se ha creado correctamente.",
  },
};

export const Warning: Story = {
  name: "Advertencia",
  args: {
    type: "warning",
    message: "Tu sesión está a punto de caducar.",
  },
};

export const Error: Story = {
  args: {
    type: "error",
    message: "Error: el correo electrónico ya está registrado.",
  },
};

export const Danger: Story = {
  name: "Peligro",
  args: {
    type: "danger",
    message: "Esta acción eliminará el elemento de forma permanente.",
  },
};

export const Neutral: Story = {
  name: "Neutro",
  args: {
    type: "neutral",
    message: "Tienes 3 notificaciones nuevas.",
  },
};

export const WithoutClose: Story = {
  name: "Sin botón de cierre",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando no se pasa `onClose`, la alerta no renderiza ningún botón de cierre: es puramente informativa.",
      },
    },
  },
  args: {
    type: "info",
    message: "Tienes 3 notificaciones nuevas.",
    onClose: undefined,
  },
};

export const WithInlineAction: Story = {
  name: "Con acción en texto",
  parameters: {
    docs: {
      description: {
        story:
          "`message` acepta cualquier `ReactNode`, no solo texto plano: una acción puede incrustarse como un enlace de texto dentro de la propia frase (normalmente vía `t.rich(...)`, ver `EmailVerificationAlert`) en vez de como un botón aparte junto al mensaje.",
      },
    },
  },
  args: {
    type: "warning",
    message: (
      <>
        Tu correo electrónico no está verificado.{" "}
        <button type="button" className="alert__link">
          Reenviar verificación
        </button>
        .
      </>
    ),
  },
};

export const WithClose: Story = {
  name: "Con botón de cierre",
  args: {
    type: "success",
    message: "Tu cuenta se ha creado correctamente.",
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByRole("button", { name: /cerrar/i });

    await userEvent.click(closeButton);

    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const AllTypes: Story = {
  name: "Todos los tipos",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 16, width: 360 }}
    >
      <Alert {...args} type="success" message="Tu cuenta se ha creado correctamente." />
      <Alert
        {...args}
        type="error"
        message="Error: el correo electrónico ya está registrado."
      />
      <Alert
        {...args}
        type="warning"
        message="Recuerda verificar tu correo electrónico."
      />
      <Alert {...args} type="info" message="Tienes 3 notificaciones nuevas." />
      <Alert
        {...args}
        type="danger"
        message="Esta acción eliminará el elemento de forma permanente."
      />
      <Alert
        {...args}
        type="neutral"
        message="Nueva versión disponible."
      />
    </div>
  ),
};
