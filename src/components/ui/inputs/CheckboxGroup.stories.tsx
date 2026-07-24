import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { CheckboxGroupOption } from "@/types/ui/inputs/checkbox-group";

import CheckboxGroup from "./CheckboxGroup";

const NOTIFICATION_OPTIONS: CheckboxGroupOption[] = [
  { value: "email", label: "Correo electrónico" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Notificaciones push" },
  { value: "whatsapp", label: "WhatsApp" },
];

const ALL_VALUES = NOTIFICATION_OPTIONS.map((opt) => opt.value);

const meta = {
  title: "UI/Inputs/CheckboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Grupo de casillas de selección múltiple, con un botón "Seleccionar todo"/"Deseleccionar todo" bajo las opciones que alterna según si ya están todas marcadas. A diferencia de `Select` con `multiple` (un desplegable), aquí todas las opciones son visibles a la vez. Internamente sigue usando `<input type="checkbox">` nativos (solo oculta visualmente la casilla del navegador), por lo que conserva gratis la navegación por teclado; `label` alimenta además el `aria-label` del contenedor `role="group"`.',
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    name: {
      control: "text",
      description: "Nombre del grupo de casillas (atributo name de cada input).",
    },
    value: {
      control: false,
      description: "Valores actualmente marcados (prop controlada).",
    },
    label: {
      control: "text",
      description: "Etiqueta visible sobre las opciones; también se usa como aria-label del grupo.",
    },
    description: {
      control: "text",
      description: "Breve explicación de qué controla el grupo, visible bajo el label.",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita todas las opciones del grupo (y el botón de seleccionar/deseleccionar todo).",
    },
    options: {
      control: false,
      description: "Array de opciones { value, label } disponibles.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales del contenedor.",
    },
    onChange: { action: "changed" },
  },
  args: {
    name: "checkbox-group-story",
    value: [],
    options: NOTIFICATION_OPTIONS,
    onChange: fn(),
  },
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Canales de notificación",
    description: "Elige por qué canales quieres recibir avisos.",
    value: [],
  },
};

export const SomeOptionsChecked: Story = {
  name: "Algunas opciones marcadas",
  args: {
    label: "Canales de notificación",
    description: "Elige por qué canales quieres recibir avisos.",
    value: ["email", "push"],
  },
};

export const AllOptionsChecked: Story = {
  name: "Todas las opciones marcadas",
  parameters: {
    docs: {
      description: {
        story:
          'Con todas las opciones marcadas el botón inferior cambia de "Seleccionar todo" a "Deseleccionar todo".',
      },
    },
  },
  args: {
    label: "Canales de notificación",
    description: "Elige por qué canales quieres recibir avisos.",
    value: ALL_VALUES,
  },
};

export const DisabledGroup: Story = {
  name: "Grupo deshabilitado",
  parameters: {
    docs: {
      description: {
        story:
          "Con `disabled`, todas las opciones (marcadas o no) y el botón de seleccionar/deseleccionar todo quedan inhabilitados. `CheckboxGroup` no admite deshabilitar opciones sueltas de forma individual, solo el grupo completo.",
      },
    },
  },
  args: {
    label: "Canales de notificación",
    description: "Elige por qué canales quieres recibir avisos.",
    value: ["email"],
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta ni descripción",
  parameters: {
    docs: {
      description: {
        story:
          'Sin `label` ni `description` el grupo se reduce a las opciones, sin cabecera. El `role="group"` queda sin nombre accesible, así que este uso solo tiene sentido cuando el contexto (por ejemplo un `label` externo asociado por otro medio) ya deja claro qué representa el grupo.',
      },
    },
  },
  args: {
    value: [],
  },
};

export const CheckOptionInteraction: Story = {
  name: "Interacción: marcar una opción",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic en una opción sin marcar se invoca `onChange` con el valor añadido a la lista.",
      },
    },
  },
  args: {
    label: "Canales de notificación",
    value: ["email"],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("checkbox", { name: "SMS" });

    await userEvent.click(option);

    await expect(args.onChange).toHaveBeenCalledWith(["email", "sms"]);
  },
};

export const UncheckOptionInteraction: Story = {
  name: "Interacción: desmarcar una opción",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic en una opción ya marcada se invoca `onChange` con el valor eliminado de la lista.",
      },
    },
  },
  args: {
    label: "Canales de notificación",
    value: ["email", "sms"],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("checkbox", { name: "Correo electrónico" });

    await userEvent.click(option);

    await expect(args.onChange).toHaveBeenCalledWith(["sms"]);
  },
};

export const SelectAllInteraction: Story = {
  name: "Interacción: seleccionar todo",
  parameters: {
    docs: {
      description: {
        story:
          'Prueba de interacción: con ninguna opción marcada, el botón muestra "Seleccionar todo" y al pulsarlo invoca `onChange` con todos los valores.',
      },
    },
  },
  args: {
    label: "Canales de notificación",
    value: [],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selectAllButton = canvas.getByRole("button", {
      name: /seleccionar todo/i,
    });

    await userEvent.click(selectAllButton);

    await expect(args.onChange).toHaveBeenCalledWith(ALL_VALUES);
  },
};

export const DeselectAllInteraction: Story = {
  name: "Interacción: deseleccionar todo",
  parameters: {
    docs: {
      description: {
        story:
          'Prueba de interacción: con todas las opciones marcadas, el botón muestra "Deseleccionar todo" y al pulsarlo invoca `onChange` con una lista vacía.',
      },
    },
  },
  args: {
    label: "Canales de notificación",
    value: ALL_VALUES,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const deselectAllButton = canvas.getByRole("button", {
      name: /deseleccionar todo/i,
    });

    await userEvent.click(deselectAllButton);

    await expect(args.onChange).toHaveBeenCalledWith([]);
  },
};

export const DisabledNoInteraction: Story = {
  name: "Interacción: deshabilitado no dispara onChange",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con `disabled`, ninguna opción ni el botón de seleccionar todo responden al clic y `onChange` nunca se invoca.",
      },
    },
  },
  args: {
    label: "Canales de notificación",
    value: ["email"],
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("checkbox", { name: "SMS" });
    const selectAllButton = canvas.getByRole("button", {
      name: /seleccionar todo/i,
    });

    await expect(option).toBeDisabled();
    await expect(selectAllButton).toBeDisabled();

    await userEvent.click(option);

    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>Normal</p>
        <CheckboxGroup
          {...args}
          name="s1"
          value={[]}
          options={NOTIFICATION_OPTIONS}
        />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>Algunas opciones marcadas</p>
        <CheckboxGroup
          {...args}
          name="s2"
          value={["email", "push"]}
          options={NOTIFICATION_OPTIONS}
        />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>Deshabilitado</p>
        <CheckboxGroup
          {...args}
          name="s3"
          value={["email"]}
          options={NOTIFICATION_OPTIONS}
          disabled
        />
      </div>
    </div>
  ),
};
