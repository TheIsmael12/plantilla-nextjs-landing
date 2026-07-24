import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { TextareaProps } from "@/types/ui/inputs/textarea";

import Textarea from "./Textarea";

/**
 * Envoltorio con estado propio: mantiene `value` sincronizado con lo que
 * escribe el usuario para que las pruebas de interacción reflejen el uso
 * real del componente controlado, a la vez que sigue delegando en el
 * `onChange` de los args (fn de acciones).
 */
function ControlledTextarea(args: TextareaProps) {
  const [value, setValue] = useState(args.value ?? "");

  return (
    <Textarea
      {...args}
      value={value}
      onChange={(event) => {
        setValue(event.target.value);
        args.onChange(event);
      }}
    />
  );
}

const meta = {
  title: "UI/Inputs/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Campo de texto multilínea del sistema de diseño: misma resolución de `label`/`placeholder`/`error` que `Input` (namespaces `Labels`/`Placeholders`/`Validations`, salvo que `noTranslate` sea `true`), pensado para mensajes largos.",
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
    label: {
      control: "text",
      description:
        "Clave de traducción del namespace `Labels`, o texto literal si `noTranslate` es `true`.",
    },
    placeholder: {
      control: "text",
      description:
        "Clave de traducción del namespace `Placeholders`, o texto literal si `noTranslate` es `true`.",
    },
    ariaLabel: {
      control: "text",
      description: "`aria-label` del textarea nativo.",
    },
    value: {
      control: "text",
      description: "Valor controlado del campo; por defecto una cadena vacía.",
    },
    error: {
      control: "text",
      description:
        "Clave de traducción del namespace `Validations`. Requiere `touched=true` para mostrarse.",
    },
    touched: {
      control: "boolean",
      description:
        "Marca el campo como interactuado, habilitando la visualización del error.",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el campo impidiendo cualquier interacción.",
    },
    readonly: {
      control: "boolean",
      description: "Muestra el valor pero impide su edición.",
    },
    required: {
      control: "boolean",
      description:
        "Marca el campo como obligatorio con un asterisco (*) junto al label.",
    },
    noTranslate: {
      control: "boolean",
      description:
        "Si es true, los valores de `label` y `placeholder` se usan directamente sin pasar por next-intl.",
    },
    rows: {
      control: "number",
      description: "Número de filas visibles; por defecto 5.",
    },
    minLength: {
      control: "number",
      description: "Longitud mínima del texto.",
    },
    maxLength: {
      control: "number",
      description: "Longitud máxima del texto.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales del propio `<textarea>`.",
    },
    onChange: { action: "changed" },
    onBlur: { action: "blurred" },
    onKeyDown: { action: "keydown" },
  },
  args: {
    id: "textarea-story",
    name: "textarea-story",
    label: "Mensaje",
    noTranslate: true,
    onChange: fn(),
    onBlur: fn(),
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Mensaje",
    placeholder: "Escribe tu mensaje",
  },
};

export const Required: Story = {
  name: "Obligatorio",
  args: {
    label: "Mensaje",
    placeholder: "Este campo es requerido",
    required: true,
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    label: "Mensaje",
    value: "",
    error: "required",
    touched: true,
  },
};

export const WithoutLabelWithAriaLabel: Story = {
  name: "Sin etiqueta visible (con aria-label)",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando no hay `label` visible, `ariaLabel` mantiene un nombre accesible correcto para lectores de pantalla.",
      },
    },
  },
  args: {
    label: undefined,
    ariaLabel: "Mensaje de contacto",
    placeholder: "Escribe tu mensaje...",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole("textbox", { name: "Mensaje de contacto" });
    await expect(textarea).toBeInTheDocument();
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "Campo deshabilitado",
    value: "Este campo no se puede editar",
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText("Campo deshabilitado");

    await expect(textarea).toBeDisabled();

    await userEvent.type(textarea, "más texto");

    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const Readonly: Story = {
  name: "Solo lectura",
  args: {
    label: "Campo de solo lectura",
    value: "Este valor no se puede modificar",
    readonly: true,
  },
};

export const WithLengthLimits: Story = {
  name: "Con límites de longitud",
  args: {
    label: "Descripción",
    placeholder: "Entre 10 y 200 caracteres",
    minLength: 10,
    maxLength: 200,
  },
};

export const CustomRows: Story = {
  name: "Número de filas personalizado",
  args: {
    label: "Comentarios extensos",
    placeholder: "Campo más alto (10 filas)",
    rows: 10,
  },
};

export const TypingInteraction: Story = {
  name: "Interacción: escritura",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al escribir en el campo se invocan `onChange` y `onKeyDown`, y el valor mostrado se actualiza.",
      },
    },
  },
  render: (args) => <ControlledTextarea {...args} />,
  args: {
    label: "Mensaje",
    value: "",
    onKeyDown: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText("Mensaje") as HTMLTextAreaElement;

    await userEvent.type(textarea, "Hola, tengo una consulta");

    await expect(args.onChange).toHaveBeenCalled();
    await expect(args.onKeyDown).toHaveBeenCalled();
    await expect(textarea).toHaveValue("Hola, tengo una consulta");
  },
};

export const BlurInteraction: Story = {
  name: "Interacción: blur",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al salir del campo (blur) se invoca `onBlur`, usado por Formik para marcar `touched`.",
      },
    },
  },
  args: {
    label: "Mensaje",
    placeholder: "Escribe y sal del campo",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText("Mensaje");

    await userEvent.click(textarea);
    await userEvent.tab();

    await expect(args.onBlur).toHaveBeenCalled();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, width: 320 }}>
      <Textarea {...args} id="normal" name="normal" label="Normal" placeholder="Estado normal" />
      <Textarea
        {...args}
        id="required"
        name="required"
        label="Obligatorio"
        placeholder="Campo requerido"
        required
      />
      <Textarea
        {...args}
        id="error"
        name="error"
        label="Con error"
        value=""
        error="required"
        touched
      />
      <Textarea
        {...args}
        id="disabled"
        name="disabled"
        label="Deshabilitado"
        value="No editable"
        disabled
      />
      <Textarea
        {...args}
        id="readonly"
        name="readonly"
        label="Solo lectura"
        value="No modificable"
        readonly
      />
    </div>
  ),
};
