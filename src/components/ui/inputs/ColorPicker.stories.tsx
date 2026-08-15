import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { ColorPickerProps } from "@/types/ui/inputs/color-picker";

import ColorPicker from "./ColorPicker";

/**
 * Envoltorio con estado, para que elegir un color se vea reflejado.
 * @param {ColorPickerProps} args - Props de la historia
 * @returns {JSX.Element} El selector con su estado
 */
function ControlledColorPicker(args: ColorPickerProps) {
  const [value, setValue] = useState<string | null>(args.value ?? null);

  return (
    <ColorPicker
      {...args}
      value={value}
      onChange={(next) => {
        setValue(next);
        args.onChange(next);
      }}
    />
  );
}

const meta = {
  title: "UI/Inputs/ColorPicker",
  component: ColorPicker,
  parameters: {
    docs: {
      description: {
        component:
          "Selector de color por muestras, no un `input type=\"color\"`: aquí no se elige un tono cualquiera sino uno de una paleta corta, la que el resto de la interfaz sabe pintar.\n\nCada muestra es un botón con `aria-pressed` y con el nombre del color escrito — un cuadrado de color sin nombre no lo puede elegir quien no distingue esos dos tonos.\n\n**Volver a pulsar el color ya elegido lo quita**, que es lo que se intenta por instinto, y con `allowEmpty` hay además una muestra explícita de «ninguno».",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    id: "color",
    label: "Color de la etiqueta",
    value: null,
    onChange: fn(),
  },
  render: (args) => <ControlledColorPicker {...args} />,
} satisfies Meta<typeof ColorPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Sin color elegido: la muestra de «ninguno» es la marcada. */
export const Empty: Story = {};

/** Con un color ya elegido. */
export const Selected: Story = {
  args: { value: "#2E7D32" },
};

/** Sin la opción de «ninguno»: hay que elegir uno. */
export const WithoutEmptyOption: Story = {
  args: { allowEmpty: false, value: "#1E3A5F" },
};

/** Deshabilitado. */
export const Disabled: Story = {
  args: { disabled: true, value: "#B3261E" },
};

/** Con descripción bajo el título. */
export const WithDescription: Story = {
  args: { description: "Se usa en la insignia del listado y en el aviso del tablón." },
};

export const SelectsAColor: Story = {
  name: "Interacción — elige un color",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // Se busca por nombre y no por color: es lo que hace que el selector sea usable sin distinguir tonos.
    const green = canvas.getByRole("button", { name: "Verde" });
    await userEvent.click(green);

    await expect(args.onChange).toHaveBeenCalledWith("#2E7D32");
    await expect(green).toHaveAttribute("aria-pressed", "true");
  },
};

/**
 * Volver a pulsar el color elegido lo quita.
 *
 * Es lo que se intenta por instinto cuando uno se arrepiente, y sin esto habría que buscar la muestra de
 * «ninguno» — que además puede no estar, si `allowEmpty` es `false`.
 */
export const TogglesOff: Story = {
  name: "Interacción — volver a pulsarlo lo quita",
  args: { value: "#2E7D32" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const green = canvas.getByRole("button", { name: "Verde" });
    await expect(green).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(green);

    await expect(args.onChange).toHaveBeenCalledWith(null);
    await expect(green).toHaveAttribute("aria-pressed", "false");
  },
};

export const ClearsWithEmptySwatch: Story = {
  name: "Interacción — la muestra de ninguno limpia",
  args: { value: "#B3261E" },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // La muestra vacía se identifica por su nombre traducido, igual que las de color.
    const [none] = canvas.getAllByRole("button");
    await userEvent.click(none!);

    await expect(args.onChange).toHaveBeenCalledWith(null);
  },
};

/**
 * Solo una muestra puede estar marcada a la vez.
 *
 * `aria-pressed` es lo que lee un lector de pantalla para saber cuál está elegida; dos a la vez lo dejaría sin
 * respuesta a «¿cuál tengo puesto?».
 */
export const OnlyOneSelected: Story = {
  name: "Interacción — solo una marcada a la vez",
  args: { value: "#2E7D32" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Azul" }));

    const pressed = canvas
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-pressed") === "true");

    await expect(pressed).toHaveLength(1);
  },
};
