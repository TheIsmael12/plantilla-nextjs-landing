import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import type { OtpInputProps } from "@/types/ui/inputs/otp-input";

import OtpInput from "./OtpInput";

/**
 * Envoltorio con estado propio: mantiene `value` sincronizado con lo que
 * escribe el usuario para que las pruebas de interacción multi-paso (escribir
 * varios dígitos seguidos) reflejen el uso real del componente controlado,
 * a la vez que sigue delegando en el `onChange` de los args (fn de acciones).
 */
function ControlledOtpInput(args: OtpInputProps) {
  const [value, setValue] = useState(args.value);

  return (
    <OtpInput
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
  title: "UI/Inputs/OtpInput",
  component: OtpInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Input segmentado para códigos numéricos (verificación de email, 2FA). Cada casilla es un `<input>` independiente con su propio `aria-label` (posición dentro del código), pero se comportan como un único campo controlado: soporta pegado y autocompletado del código completo en cualquier casilla, navegación con flechas entre casillas y borrado hacia atrás encadenado.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    id: {
      control: "text",
      description: "Id asignado a la primera casilla, para asociar un `label` externo.",
    },
    name: {
      control: "text",
      description: "Nombre de campo asignado a la primera casilla, usado por Formik para el binding.",
    },
    length: {
      control: "number",
      description: "Número de casillas/dígitos del código.",
    },
    value: {
      control: "text",
      description: "Código actual (prop controlada).",
    },
    error: {
      control: "text",
      description:
        "Clave de traducción (namespace `Validations`) del error. Requiere `touched=true` para mostrarse.",
    },
    touched: {
      control: "boolean",
      description: "Si el campo ha sido interactuado (controla cuándo se pinta el error).",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita todas las casillas impidiendo cualquier interacción.",
    },
    autoFocus: {
      control: "boolean",
      description: "Si la primera casilla debe recibir el foco al montar.",
    },
    onChange: {
      action: "changed",
      description: "Se invoca con el código completo cada vez que cambia cualquier casilla.",
    },
  },
  args: {
    name: "code",
    length: 6,
    value: "",
    onChange: fn(),
  },
} satisfies Meta<typeof OtpInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  name: "Vacío",
};

export const PartiallyFilled: Story = {
  name: "Parcialmente rellenado",
  args: {
    value: "123",
  },
};

export const Filled: Story = {
  name: "Completo",
  args: {
    value: "123456",
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    value: "123456",
    touched: true,
    error: "code.length",
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    value: "123456",
    disabled: true,
  },
};

export const AutoFocus: Story = {
  name: "Con autoFocus",
  parameters: {
    docs: {
      description: {
        story: "La primera casilla recibe el foco automáticamente al montar el componente.",
      },
    },
  },
  args: {
    autoFocus: true,
  },
};

export const ShorterLength: Story = {
  name: "Longitud personalizada (4 dígitos)",
  args: {
    length: 4,
    value: "12",
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <OtpInput {...args} value="" />
      <OtpInput {...args} value="123" />
      <OtpInput {...args} value="123456" />
      <OtpInput {...args} value="123456" touched error="code.length" />
      <OtpInput {...args} value="123456" disabled />
    </div>
  ),
};

export const TypingInteraction: Story = {
  name: "Interacción: escribir dígito a dígito",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: escribe un dígito en la primera casilla, comprueba que el foco salta automáticamente a la siguiente y que `onChange` recibe el código acumulado. Usa un envoltorio con estado propio para reflejar el uso real como campo controlado.",
      },
    },
  },
  render: (args) => <ControlledOtpInput {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.type(slots[0] as HTMLElement, "1");
    await expect(args.onChange).toHaveBeenCalledWith("1");

    await expect(slots[1] as HTMLElement).toHaveFocus();

    await userEvent.type(slots[1] as HTMLElement, "2");
    await expect(args.onChange).toHaveBeenCalledWith("12");
  },
};

export const PasteInteraction: Story = {
  name: "Interacción: pegar código completo",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: pegar un código completo en la primera casilla rellena todas las casillas de golpe.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.click(slots[0] as HTMLElement);
    await userEvent.paste("123456");

    await expect(args.onChange).toHaveBeenCalledWith("123456");
  },
};

export const BackspaceNavigatesBack: Story = {
  name: "Interacción: borrar navega a la casilla anterior",
  args: {
    value: "12",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Con la tercera casilla vacía, pulsar Retroceso mueve el foco a la segunda casilla y borra su contenido.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.click(slots[2] as HTMLElement);
    await userEvent.keyboard("{Backspace}");

    await expect(slots[1] as HTMLElement).toHaveFocus();
    await expect(args.onChange).toHaveBeenCalledWith("1");
  },
};

export const AccessibleNames: Story = {
  name: "Nombres accesibles por casilla",
  parameters: {
    docs: {
      description: {
        story:
          "Cada casilla expone su propio `aria-label` (\"Dígito X de N\"), de forma que un lector de pantalla anuncia la posición al navegar con Tab.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const first = canvas.getByRole("textbox", { name: /Dígito 1 de 6/i });
    const last = canvas.getByRole("textbox", { name: /Dígito 6 de 6/i });

    await expect(first).toBeInTheDocument();
    await expect(last).toBeInTheDocument();
  },
};

export const NonDigitClearsSlot: Story = {
  name: "Interacción: carácter no numérico vacía la casilla",
  args: {
    value: "1",
  },
  parameters: {
    docs: {
      description: {
        story:
          "El foco selecciona el contenido de la casilla; escribir un carácter no numérico lo reemplaza por nada, vaciando esa casilla en vez de dejar un dígito inválido.",
      },
    },
  },
  render: (args) => <ControlledOtpInput {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.type(slots[0] as HTMLElement, "a");

    await expect(args.onChange).toHaveBeenCalledWith("");
    await expect(slots[0] as HTMLElement).toHaveValue("");
  },
};

export const MultiDigitInSingleSlotStopsAtEnd: Story = {
  name: "Interacción: varios dígitos de golpe en la última casilla",
  parameters: {
    docs: {
      description: {
        story:
          "Simula el autocompletado del teclado móvil: si llegan más dígitos de los que caben desde la casilla actual, los sobrantes se descartan sin desbordar el array de casillas.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");
    const lastSlot = slots[slots.length - 1] as HTMLElement;

    fireEvent.change(lastSlot, { target: { value: "23" } });

    await expect(args.onChange).toHaveBeenCalledWith("2");
  },
};

export const BackspaceClearsFilledSlot: Story = {
  name: "Interacción: borrar en una casilla rellena solo la vacía",
  args: {
    value: "123",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Con la casilla actual rellena, Retroceso solo borra su contenido y mantiene el foco en ella (a diferencia de una casilla ya vacía, que mueve el foco hacia atrás).",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.click(slots[1] as HTMLElement);
    await userEvent.keyboard("{Backspace}");

    await expect(slots[1] as HTMLElement).toHaveFocus();
    await expect(args.onChange).toHaveBeenCalledWith("13");
  },
};

export const BackspaceOnEmptyFirstSlotDoesNothing: Story = {
  name: "Interacción: borrar en la primera casilla vacía no hace nada",
  parameters: {
    docs: {
      description: {
        story:
          "Al no haber casilla anterior a la que mover el foco, Retroceso sobre la primera casilla ya vacía no tiene ningún efecto.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.click(slots[0] as HTMLElement);
    await userEvent.keyboard("{Backspace}");

    await expect(slots[0] as HTMLElement).toHaveFocus();
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ArrowKeysNavigation: Story = {
  name: "Interacción: navegación con flechas",
  args: {
    value: "123",
  },
  parameters: {
    docs: {
      description: {
        story:
          "ArrowLeft/ArrowRight mueven el foco entre casillas adyacentes; en el primer o último dígito no hay casilla anterior/siguiente y no ocurre nada.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    // Sin casilla anterior: ArrowLeft en la primera no mueve el foco
    await userEvent.click(slots[0] as HTMLElement);
    await userEvent.keyboard("{ArrowLeft}");
    await expect(slots[0] as HTMLElement).toHaveFocus();

    // ArrowRight avanza a la siguiente casilla
    await userEvent.keyboard("{ArrowRight}");
    await expect(slots[1] as HTMLElement).toHaveFocus();

    // ArrowLeft vuelve a la anterior
    await userEvent.keyboard("{ArrowLeft}");
    await expect(slots[0] as HTMLElement).toHaveFocus();

    // Sin casilla siguiente: ArrowRight en la última no mueve el foco
    await userEvent.click(slots[slots.length - 1] as HTMLElement);
    await userEvent.keyboard("{ArrowRight}");
    await expect(slots[slots.length - 1] as HTMLElement).toHaveFocus();
  },
};

export const PasteWithoutDigitsIsIgnored: Story = {
  name: "Interacción: pegar texto sin dígitos no cambia nada",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.click(slots[0] as HTMLElement);
    await userEvent.paste("abc");

    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const PasteOverflowStopsAtLastSlot: Story = {
  name: "Interacción: pegar más dígitos de los que caben",
  parameters: {
    docs: {
      description: {
        story:
          "Si el texto pegado tiene más dígitos que casillas disponibles desde el punto de pegado, los dígitos sobrantes se descartan.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slots = canvas.getAllByRole("textbox");

    await userEvent.click(slots[0] as HTMLElement);
    await userEvent.paste("1234567890");

    await expect(args.onChange).toHaveBeenCalledWith("123456");
  },
};
