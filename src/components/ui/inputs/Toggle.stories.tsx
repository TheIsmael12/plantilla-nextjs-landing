import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import Toggle from "./Toggle";

const meta = {
  title: "UI/Inputs/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Interruptor (switch) construido sobre un checkbox nativo, pensado para activar/desactivar una opción binaria (ajustes, preferencias, permisos). Expone `role=\"switch\"` para que los lectores de pantalla anuncien un estado on/off en lugar de un checkbox genérico, admite `label` y `description` opcionales, y un `ariaLabel` de respaldo para los casos sin texto visible.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    id: {
      control: "text",
      description: "Id del input nativo, útil para asociar un label externo.",
    },
    name: {
      control: "text",
      description: "Nombre del campo, usado por Formik para el binding.",
    },
    label: {
      control: "text",
      description: "Texto principal visible junto al toggle.",
    },
    description: {
      control: "text",
      description: "Descripción secundaria visible debajo del label.",
    },
    ariaLabel: {
      control: "text",
      description:
        "Nombre accesible (aria-label) usado cuando no hay `label` visible. Obligatorio en ese caso para no dejar el interruptor sin nombre accesible.",
    },
    checked: {
      control: "boolean",
      description: "Estado activo del toggle (prop controlada).",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el toggle impidiendo cualquier interacción.",
    },
    onChange: { action: "changed" },
  },
  args: {
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Notificaciones por email",
    checked: false,
  },
};

export const Checked: Story = {
  name: "Activado",
  args: {
    label: "Notificaciones por email",
    checked: true,
  },
};

export const WithDescription: Story = {
  name: "Con descripción",
  args: {
    label: "Notificaciones push",
    description: "Recibir alertas en tiempo real en tu navegador.",
    checked: false,
  },
};

export const WithDescriptionChecked: Story = {
  name: "Con descripción y activado",
  args: {
    label: "Notificaciones push",
    description: "Recibir alertas en tiempo real en tu navegador.",
    checked: true,
  },
};

export const OnlyDescription: Story = {
  name: "Solo descripción (sin label)",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando no hay `label` pero sí `description`, el bloque de texto se sigue mostrando. Como no hay texto visible asociado al interruptor, es necesario pasar `ariaLabel` para que siga teniendo nombre accesible.",
      },
    },
  },
  args: {
    description: "Función experimental, puede cambiar sin previo aviso.",
    ariaLabel: "Activar función experimental",
    checked: false,
  },
};

export const Disabled: Story = {
  name: "Deshabilitado (apagado)",
  args: {
    label: "Notificaciones por SMS",
    description: "Función no disponible en tu plan actual.",
    checked: false,
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  name: "Deshabilitado (encendido)",
  args: {
    label: "Notificaciones por SMS",
    description: "Función no disponible en tu plan actual.",
    checked: true,
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta visible",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `label` ni `description` visibles, se debe proporcionar `ariaLabel` para que el interruptor conserve un nombre accesible para lectores de pantalla.",
      },
    },
  },
  args: {
    ariaLabel: "Modo oscuro",
    checked: true,
  },
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: localiza el interruptor por su nombre accesible, comprueba su estado inicial vía `aria-checked` y simula un clic con teclado y con ratón.",
      },
    },
  },
  args: {
    label: "Notificaciones por email",
    checked: false,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", {
      name: "Notificaciones por email",
    });

    await expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    await expect(args.onChange).toHaveBeenCalledWith(true);

    toggle.focus();
    await expect(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenCalledWith(true);
  },
};

export const DisabledDoesNotTrigger: Story = {
  name: "Deshabilitado no dispara onChange",
  parameters: { controls: { disable: true } },
  args: {
    label: "Notificaciones por SMS",
    checked: false,
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("switch", {
      name: "Notificaciones por SMS",
    });

    await expect(toggle).toBeDisabled();

    await userEvent.click(toggle);
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 320 }}
    >
      <Toggle
        {...args}
        label="Apagado"
        description="Estado desactivado"
        checked={false}
      />
      <Toggle
        {...args}
        label="Encendido"
        description="Estado activado"
        checked={true}
      />
      <Toggle
        {...args}
        label="Deshabilitado"
        description="No interactuable"
        checked={false}
        disabled
      />
      <Toggle {...args} ariaLabel="Sin etiqueta visible" checked={true} />
    </div>
  ),
};
