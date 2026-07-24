import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import IndeterminateCheckbox from "./IndeterminateCheckbox";

const meta = {
  title: "UI/Tables/IndeterminateCheckbox",
  component: IndeterminateCheckbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Checkbox/radio de selección de fila de `Table`: soporta el estado indeterminado (parcialmente seleccionado, en la cabecera cuando solo algunas filas de la página están marcadas) y un modo radio (selección única), ya que el atributo HTML `indeterminate` no puede fijarse por JSX, solo imperativamente sobre el nodo del DOM.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    checked: { control: "boolean", description: "Estado marcado/desmarcado." },
    indeterminate: {
      control: "boolean",
      description:
        "Estado \"parcialmente seleccionado\" (algunas filas de la página, no todas).",
    },
    radio: {
      control: "boolean",
      description:
        "Si es `true`, se renderiza como radio (selección única de fila) en vez de checkbox.",
    },
    disabled: { control: "boolean", description: "Deshabilita el control." },
    onChange: { control: false },
  },
  args: {
    "aria-label": "Seleccionar fila",
    checked: false,
    onChange: fn(),
  },
} satisfies Meta<typeof IndeterminateCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  name: "Desmarcado",
};

export const Checked: Story = {
  name: "Marcado",
  args: { checked: true },
};

export const Indeterminate: Story = {
  name: "Indeterminado",
  args: { indeterminate: true, "aria-label": "Seleccionar todas las filas" },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  name: "Deshabilitado y marcado",
  args: { disabled: true, checked: true },
};

export const Radio: Story = {
  name: "Modo radio (selección única)",
  args: { radio: true, checked: true, "aria-label": "Seleccionar fila única" },
};

export const CustomClassName: Story = {
  name: "Con clase adicional",
  parameters: {
    docs: {
      description: {
        story:
          "Cualquier `className` recibido se añade a la clase base del `<label>` que envuelve el control.",
      },
    },
  },
  args: { className: "table__checkbox--custom" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Seleccionar fila" });

    expect(checkbox.closest("label")).toHaveClass("table__checkbox--custom");
  },
};

export const ClickInteraction: Story = {
  name: "Interacción: clic dispara onChange",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole("checkbox", { name: "Seleccionar fila" });

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    await expect(args.onChange).toHaveBeenCalledTimes(1);
  },
};
