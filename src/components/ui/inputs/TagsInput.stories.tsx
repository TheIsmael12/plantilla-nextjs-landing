import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { TagsInputProps } from "@/types/ui/inputs/tags-input";

import TagsInput from "./TagsInput";

/**
 * Envoltorio con estado propio.
 *
 * `TagsInput` es controlado: sin alguien que guarde lo que devuelve `onChange`, añadir una etiqueta no la pinta y
 * las interacciones no se podrían comprobar. El `onChange` de los args se sigue llamando, para que la pestaña de
 * acciones registre lo mismo que en el uso real.
 * @param {TagsInputProps} args - Props de la historia
 * @returns {JSX.Element} El campo con su estado
 */
function ControlledTagsInput(args: TagsInputProps) {
  const [value, setValue] = useState<string[]>(args.value);

  return (
    <TagsInput
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
  title: "UI/Inputs/TagsInput",
  component: TagsInput,
  parameters: {
    docs: {
      description: {
        component:
          "Campo de lista de valores: se escribe uno y se añade con Enter o con el botón de más. Cada valor añadido se puede quitar.\n\nDos disposiciones: `tags` (por defecto) pinta píldoras en línea, y `rows` una lista numerada — pensada para valores largos, como líneas de dirección, donde las píldoras se romperían.\n\n**Rechaza duplicados por sí mismo** y admite un `validate` propio; en los dos casos el error se pinta bajo el campo con la clave del namespace `Validations`. Con `max`, al llegar al tope **el campo de alta desaparece** y queda solo el contador: avisar antes en vez de dejar escribir y rechazarlo después.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    id: "tags",
    value: [],
    onChange: fn(),
    noTranslate: true,
    label: "Correos de aviso",
    placeholder: "Escribe y pulsa Enter",
  },
  render: (args) => <ControlledTagsInput {...args} />,
} satisfies Meta<typeof TagsInput>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Vacío, que es como empieza siempre. */
export const Empty: Story = {};

/** Con valores ya añadidos, en píldoras. */
export const WithTags: Story = {
  args: { value: ["aviso@imora.es", "soporte@imora.es"] },
};

/** En filas numeradas, para valores largos que como píldora se romperían. */
export const RowsLayout: Story = {
  args: {
    layout: "rows",
    value: ["Calle Serrano 145, 28006 Madrid", "Avenida del Puerto 45, 46023 Valencia"],
  },
};

/** Deshabilitado: ni se añade ni se quita. */
export const Disabled: Story = {
  args: { disabled: true, value: ["aviso@imora.es"] },
};

/** Obligatorio: el asterisco lo pinta el propio campo junto al label. */
export const Required: Story = {
  args: { required: true },
};

export const AddsOnEnter: Story = {
  name: "Interacción — añade con Enter",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox");

    await userEvent.type(input, "aviso@imora.es{Enter}");

    await expect(args.onChange).toHaveBeenCalledWith(["aviso@imora.es"]);
    await expect(canvas.getByText("aviso@imora.es")).toBeInTheDocument();

    // El campo se vacía tras añadir: si no, hay que borrarlo a mano antes del siguiente.
    await expect(input).toHaveValue("");
  },
};

export const TrimsWhitespace: Story = {
  name: "Interacción — recorta los espacios",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole("textbox"), "   aviso@imora.es   {Enter}");

    await expect(args.onChange).toHaveBeenCalledWith(["aviso@imora.es"]);
  },
};

/** Un valor en blanco no añade nada: pulsar Enter sin escribir no debe crear una píldora vacía. */
export const IgnoresEmpty: Story = {
  name: "Interacción — no añade valores vacíos",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole("textbox"), "   {Enter}");

    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Los duplicados se rechazan con un aviso, no en silencio.
 *
 * Añadir dos veces el mismo correo no rompe nada, pero dejarlo pasar hace pensar que el campo no responde; y
 * quitarlo sin avisar, que se ha perdido lo escrito.
 */
export const RejectsDuplicates: Story = {
  name: "Interacción — rechaza duplicados",
  args: { value: ["aviso@imora.es"] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole("textbox"), "aviso@imora.es{Enter}");

    await expect(args.onChange).not.toHaveBeenCalled();
    // El mensaje se pinta con un «* » delante, así que se busca por coincidencia parcial.
    await expect(canvas.getByText(/Este valor ya se ha añadido/)).toBeInTheDocument();
  },
};

/** Con `validate` propio, el mensaje sale del mismo sitio que el de duplicado. */
export const CustomValidation: Story = {
  name: "Interacción — validación propia",
  args: {
    validate: (value: string) => (value.includes("@") ? undefined : "tagsInputInvalidEmail"),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByRole("textbox"), "no-es-un-correo{Enter}");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(canvas.getByText(/Introduce un correo electrónico válido/)).toBeInTheDocument();

    await userEvent.clear(canvas.getByRole("textbox"));
    await userEvent.type(canvas.getByRole("textbox"), "valido@imora.es{Enter}");
    await expect(args.onChange).toHaveBeenCalledWith(["valido@imora.es"]);
  },
};

export const RemovesTag: Story = {
  name: "Interacción — quita una etiqueta",
  args: { value: ["aviso@imora.es", "soporte@imora.es"] },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // El botón de quitar lleva el valor en su nombre accesible: con dos píldoras hay que poder elegir cuál.
    const [firstRemove] = canvas.getAllByRole("button", { name: /^Quitar / });
    await userEvent.click(firstRemove!);

    await expect(args.onChange).toHaveBeenCalledWith(["soporte@imora.es"]);
  },
};

/**
 * Al llegar al tope, el campo de alta desaparece y deja el contador.
 *
 * Es la diferencia entre avisar antes y avisar después: dejar escribir para luego rechazarlo obliga a borrar lo
 * tecleado, y no explica por qué.
 */
export const ReachesMax: Story = {
  name: "Interacción — al llegar al máximo se bloquea",
  args: { max: 2, value: ["uno@imora.es", "dos@imora.es"] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    /*
     * Al llegar al tope **el campo desaparece**, no se queda deshabilitado.
     *
     * El componente no renderiza el compositor entero cuando está lleno, así que lo correcto es comprobar la
     * ausencia: un `toBeDisabled` sobre algo que no existe fallaría por el motivo equivocado.
     */
    await expect(canvas.queryByRole("textbox")).toBeNull();

    // Y el contador dice en qué punto está, que es lo que sustituye al campo.
    await expect(canvas.getByText(/2 de 2/)).toBeInTheDocument();
  },
};
