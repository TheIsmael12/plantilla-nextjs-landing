import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { RadioGroupOption } from "@/types/ui/radio-group/radio-group";
import RadioGroup from "./RadioGroup";

const TIME_FORMAT_OPTIONS: RadioGroupOption[] = [
  { value: "12h", label: "12 horas" },
  { value: "24h", label: "24 horas" },
];

const WEEK_START_OPTIONS: RadioGroupOption[] = [
  { value: "monday", label: "Lunes" },
  { value: "sunday", label: "Domingo" },
];

const LANGUAGE_OPTIONS: RadioGroupOption[] = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
];

const meta = {
  title: "UI/Inputs/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Grupo de opciones excluyentes con estilo propio del sistema de diseño. Internamente sigue usando `<input type="radio">` nativos (solo oculta visualmente el círculo del navegador), por lo que conserva gratis la navegación por teclado del grupo (flechas para moverse entre opciones, Tab para entrar/salir) y la selección excluyente. `label` y `description` se muestran como cabecera del grupo (mismo patrón que `Toggle`) y `label` además alimenta el `aria-label` del contenedor `role="group"`.',
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
      description: "Nombre del grupo de radio (atributo name del input).",
    },
    value: {
      control: "text",
      description: "Opción actualmente seleccionada (prop controlada).",
    },
    label: {
      control: "text",
      description: "Etiqueta visible sobre las opciones; también se usa como aria-label.",
    },
    description: {
      control: "text",
      description: "Breve explicación de qué controla el grupo, visible bajo el label.",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita todas las opciones del grupo.",
    },
    options: {
      control: false,
      description: "Array de opciones { value, label } disponibles.",
    },
    className: {
      control: "text",
      description:
        'Clases CSS adicionales. Por defecto el ancho es automático; pasa "radio-group__full" (100%) o "radio-group__md" (min-width: 18rem) para los otros dos anchos.',
    },
    onChange: { action: "changed" },
  },
  args: {
    name: "radio-story",
    value: "24h",
    options: TIME_FORMAT_OPTIONS,
    onChange: fn(),
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "timeFormat",
    value: "24h",
    options: TIME_FORMAT_OPTIONS,
    label: "Formato de hora",
    description: "Elige si las horas se muestran en formato de 24 horas o de 12 horas.",
  },
};

export const WeekStart: Story = {
  name: "Primer día de la semana",
  args: {
    name: "weekStart",
    value: "monday",
    options: WEEK_START_OPTIONS,
    label: "Primer día de la semana",
  },
};

export const MultipleOptions: Story = {
  name: "Múltiples opciones",
  args: {
    name: "language",
    value: "es",
    options: LANGUAGE_OPTIONS,
    label: "Idioma",
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    name: "timeFormat",
    value: "12h",
    options: TIME_FORMAT_OPTIONS,
    label: "Formato de hora",
    disabled: true,
  },
};

export const FullWidth: Story = {
  name: "Ancho completo",
  args: {
    name: "timeFormat",
    value: "24h",
    options: TIME_FORMAT_OPTIONS,
    label: "Formato de hora",
    className: "radio-group__full",
  },
};

export const MediumWidth: Story = {
  name: "Ancho medio",
  args: {
    name: "timeFormat",
    value: "24h",
    options: TIME_FORMAT_OPTIONS,
    label: "Formato de hora",
    className: "radio-group__md",
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta ni descripción",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `label` ni `description` el grupo se reduce a las opciones, sin cabecera. El `role=\"group\"` queda sin nombre accesible, así que este uso solo tiene sentido cuando el contexto (por ejemplo un `label` externo asociado por otro medio) ya deja claro qué representa el grupo.",
      },
    },
  },
  args: {
    name: "timeFormat",
    value: "24h",
    options: TIME_FORMAT_OPTIONS,
  },
};

export const SelectOptionInteraction: Story = {
  name: "Interacción: seleccionar una opción",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic sobre una opción distinta de la seleccionada se invoca `onChange` con su valor.",
      },
    },
  },
  args: {
    name: "timeFormat",
    value: "24h",
    options: TIME_FORMAT_OPTIONS,
    label: "Formato de hora",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("radio", { name: "12 horas" });

    await userEvent.click(option);

    await expect(args.onChange).toHaveBeenCalledWith("12h");
  },
};

export const KeyboardNavigationInteraction: Story = {
  name: "Interacción: navegación por teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al llegar por Tab a la opción seleccionada y mover el foco con las flechas, el navegador cambia de opción de forma nativa e invoca `onChange`.",
      },
    },
  },
  args: {
    name: "language",
    value: "es",
    options: LANGUAGE_OPTIONS,
    label: "Idioma",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole("radio", { name: "Español" });

    await userEvent.tab();
    await expect(selected).toHaveFocus();

    await userEvent.keyboard("{arrowdown}");

    await expect(args.onChange).toHaveBeenCalledWith("en");
  },
};

export const DisabledNoInteraction: Story = {
  name: "Interacción: deshabilitado no dispara onChange",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con `disabled`, ninguna opción responde al clic y `onChange` nunca se invoca.",
      },
    },
  },
  args: {
    name: "timeFormat",
    value: "12h",
    options: TIME_FORMAT_OPTIONS,
    label: "Formato de hora",
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const option = canvas.getByRole("radio", { name: "24 horas" });

    await expect(option).toBeDisabled();

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
        <RadioGroup
          {...args}
          name="s1"
          value="24h"
          options={TIME_FORMAT_OPTIONS}
        />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>
          Primera opción seleccionada
        </p>
        <RadioGroup
          {...args}
          name="s2"
          value="12h"
          options={TIME_FORMAT_OPTIONS}
        />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>Deshabilitado</p>
        <RadioGroup
          {...args}
          name="s3"
          value="24h"
          options={TIME_FORMAT_OPTIONS}
          disabled
        />
      </div>
    </div>
  ),
};
