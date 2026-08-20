import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import type { CardRadioOption } from "@/types/ui/inputs/card-radio-group";

import CardRadioGroup from "./CardRadioGroup";

const THEME_OPTIONS: CardRadioOption[] = [
  {
    value: "light",
    label: "Claro",
    description: "Fondo claro y texto oscuro.",
    icon: SunIcon,
  },
  {
    value: "dark",
    label: "Oscuro",
    description: "Fondo oscuro y texto claro.",
    icon: MoonIcon,
  },
];

const THEME_OPTIONS_WITHOUT_ICON: CardRadioOption[] = THEME_OPTIONS.map(
  ({ icon: _icon, ...opt }) => opt,
);

const THEME_OPTIONS_WITHOUT_DESCRIPTION: CardRadioOption[] = THEME_OPTIONS.map(
  ({ description: _description, ...opt }) => opt,
);

const THEME_OPTIONS_WITH_SYSTEM: CardRadioOption[] = [
  ...THEME_OPTIONS,
  {
    value: "system",
    label: "Automático",
    description: "Sigue la preferencia del sistema operativo.",
    icon: MonitorIcon,
  },
];

const withPreview = (options: CardRadioOption[]) =>
  options.map((opt) => ({
    ...opt,
    preview: (
      <div
        style={{
          height: 48,
          borderRadius: 6,
          border: "1px solid #e2e5ea",
          background:
            opt.value === "light"
              ? "#f7f8fa"
              : opt.value === "dark"
                ? "#14161a"
                : "linear-gradient(90deg, #f7f8fa 50%, #14161a 50%)",
        }}
      />
    ),
  }));

const meta = {
  title: "UI/Inputs/CardRadioGroup",
  component: CardRadioGroup,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          'Grupo de opciones tipo radio con estilo de tarjeta (icono, texto y vista previa opcional) en vez de un simple punto de radio. Pensado para elecciones pocas y muy visuales, como el tema claro/oscuro. Internamente sigue usando `<input type="radio">` nativos (solo oculta visualmente el círculo del navegador), por lo que conserva gratis la navegación por teclado del grupo (flechas para moverse entre opciones) y la selección excluyente; `label` alimenta además el `aria-label` del contenedor `role="radiogroup"`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Nombre del grupo de radios (atributo name del input).",
    },
    value: {
      control: "text",
      description: "Opción actualmente seleccionada (prop controlada).",
    },
    label: {
      control: "text",
      description: "Etiqueta visible sobre las tarjetas; también se usa como aria-label.",
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
      description: "Array de opciones { value, label, description?, icon?, preview? }.",
    },
    className: {
      control: "text",
      description:
        'Clases CSS adicionales. Por defecto las tarjetas tienen un ancho fijo; pasa "card-radio-group__full" para que se estiren a ocupar toda la fila, o "card-radio-group__md" (min-width: 22rem).',
    },
    onChange: { action: "changed" },
  },
  args: {
    name: "card-radio-story",
    value: "light",
    options: THEME_OPTIONS,
    onChange: fn(),
  },
} satisfies Meta<typeof CardRadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
  },
  /*
   * El nombre accesible de cada radio es **solo su etiqueta**, y la descripción va aparte.
   *
   * No es un detalle: la descripción vive dentro del `<label>`, así que sin `aria-hidden` se colaba en el
   * nombre accesible. Y como las descripciones se mencionan entre sí ("Fondo claro y texto oscuro"), el
   * radio "Claro" acabó respondiendo a una búsqueda por "Oscuro" — que es exactamente lo que rompía tres de
   * las historias de este fichero, y lo que le pasaría a cualquiera que navegue por voz.
   */
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const dark = canvas.getByRole("radio", { name: /Oscuro/i });

    await expect(dark).toHaveAccessibleName("Oscuro");
    await expect(dark).toHaveAccessibleDescription("Fondo oscuro y texto claro.");
  },
};

export const WithPreview: Story = {
  name: "Con vista previa",
  args: {
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
    options: withPreview(THEME_OPTIONS),
  },
};

export const WithoutIcon: Story = {
  name: "Sin icono",
  parameters: {
    docs: {
      description: {
        story:
          "El icono de cada opción (`icon`) es opcional: sin él, la tarjeta muestra solo el texto de la opción.",
      },
    },
  },
  args: {
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
    options: THEME_OPTIONS_WITHOUT_ICON,
  },
};

export const WithoutOptionDescription: Story = {
  name: "Opción sin descripción propia",
  parameters: {
    docs: {
      description: {
        story:
          "La `description` es opcional por opción: sin ella, la tarjeta no renderiza el texto secundario ni el `aria-describedby` asociado (a diferencia de `description` del grupo, que sigue siendo independiente).",
      },
    },
  },
  args: {
    label: "Tema",
    options: THEME_OPTIONS_WITHOUT_DESCRIPTION,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const lightOption = canvas.getByRole("radio", { name: "Claro" });

    await expect(lightOption).not.toHaveAttribute("aria-describedby");
  },
};

export const MultipleOptions: Story = {
  name: "Múltiples opciones",
  args: {
    label: "Tema",
    description: "Elige el tema de la aplicación.",
    options: THEME_OPTIONS_WITH_SYSTEM,
    value: "system",
  },
};

export const FullWidth: Story = {
  name: "Ancho completo",
  args: {
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
    className: "card-radio-group__full",
  },
};

export const MediumWidth: Story = {
  name: "Ancho medio",
  args: {
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
    className: "card-radio-group__md",
  },
};

export const WithoutHeader: Story = {
  name: "Sin etiqueta ni descripción",
  parameters: {
    docs: {
      description: {
        story:
          'Sin `label` ni `description` el grupo se reduce a las tarjetas, sin cabecera. El `role="radiogroup"` queda sin nombre accesible, así que este uso solo tiene sentido cuando el contexto (por ejemplo un `label` externo asociado por otro medio) ya deja claro qué representa el grupo.',
      },
    },
  },
  args: {
    label: undefined,
    description: undefined,
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "Tema",
    disabled: true,
  },
};

export const SelectOptionInteraction: Story = {
  name: "Interacción: seleccionar una opción",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic sobre una tarjeta distinta de la seleccionada se invoca `onChange` con su valor.",
      },
    },
  },
  args: {
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const darkOption = canvas.getByRole("radio", { name: /Oscuro/i });

    await userEvent.click(darkOption);

    await expect(args.onChange).toHaveBeenCalledWith("dark");
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
    label: "Tema",
    description: "Elige entre tema claro y oscuro para la aplicación.",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const selected = canvas.getByRole("radio", { name: /Claro/i });

    await userEvent.tab();
    await expect(selected).toHaveFocus();

    await userEvent.keyboard("{arrowdown}");

    await expect(args.onChange).toHaveBeenCalledWith("dark");
  },
};

export const DisabledNoInteraction: Story = {
  name: "Interacción: deshabilitado no dispara onChange",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con `disabled`, ninguna tarjeta responde al clic y `onChange` nunca se invoca.",
      },
    },
  },
  args: {
    label: "Tema",
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const darkOption = canvas.getByRole("radio", { name: /Oscuro/i });

    await expect(darkOption).toBeDisabled();

    await userEvent.click(darkOption);

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
        <CardRadioGroup {...args} name="s1" value="light" options={THEME_OPTIONS} />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>Con vista previa</p>
        <CardRadioGroup
          {...args}
          name="s2"
          value="dark"
          options={withPreview(THEME_OPTIONS)}
        />
      </div>
      <div>
        <p style={{ marginBottom: 8, fontSize: 13 }}>Deshabilitado</p>
        <CardRadioGroup
          {...args}
          name="s3"
          value="light"
          options={THEME_OPTIONS}
          disabled
        />
      </div>
    </div>
  ),
};
