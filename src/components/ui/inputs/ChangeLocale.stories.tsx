import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import { LANGUAGES } from "@/config/settings";

import ChangeLocale from "./ChangeLocale";

const meta = {
  title: "UI/Inputs/ChangeLocale",
  component: ChangeLocale,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Selector de idioma con bandera, implementado como combobox accesible (patrón ARIA `combobox` + `listbox` en portal a `document.body`, con navegación completa por teclado) en lugar de un `<select>` nativo, para poder mostrar la bandera de cada opción sin que el navegador recorte su propio menú nativo.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ minWidth: 260 }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    id: {
      control: "text",
      description: "Id del botón trigger; asocia la etiqueta y el listbox.",
    },
    name: {
      control: "text",
      description: "Nombre del campo oculto sincronizado, usado por formularios (Formik).",
    },
    label: {
      control: "text",
      description: "Etiqueta accesible del combobox (no se pinta visualmente).",
    },
    description: {
      control: "text",
      description: "Breve explicación visible bajo el selector (a diferencia de `label`, sí se pinta).",
    },
    value: {
      control: "select",
      options: LANGUAGES.map((lang) => lang.value),
      description: "Código de idioma seleccionado (prop controlada).",
    },
    options: {
      control: false,
      description: "Lista de idiomas disponibles { value, label, flag }.",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el selector e impide abrir el listbox.",
    },
    hideSelectedFromList: {
      control: "boolean",
      description:
        "Oculta el idioma ya seleccionado del listado desplegable (el trigger lo sigue mostrando). Pensado para selectores de tipo \"cambiar a otro idioma\" (p. ej. el footer), donde no tiene sentido ofrecer el idioma activo como destino.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales del contenedor.",
    },
    onChange: { action: "changed" },
  },
  args: {
    name: "locale",
    label: "Idioma",
    value: "es",
    options: LANGUAGES,
    onChange: fn(),
  },
} satisfies Meta<typeof ChangeLocale>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const English: Story = {
  name: "Inglés seleccionado",
  args: {
    value: "en",
  },
};

export const WithDescription: Story = {
  name: "Con descripción",
  args: {
    description: "Cambia el idioma de toda la aplicación.",
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `label`, el nombre accesible del combobox recae en el texto visible del botón (bandera + nombre del idioma seleccionado): `aria-labelledby` apunta al span `...-value` en lugar de a un `label` inexistente. El listbox no lleva `aria-labelledby` propio (en el patrón `aria-activedescendant` nunca recibe foco directo, así que duplicar ahí el mismo nombre accesible del trigger solo generaría dos controles con el mismo nombre, WCAG 2.4.6).",
      },
    },
  },
  args: {
    label: undefined,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await expect(trigger).toHaveAttribute("aria-labelledby", `${trigger.id}-value`);

    await userEvent.click(trigger);

    const listbox = within(document.body).getByRole("listbox");
    await expect(listbox).not.toHaveAttribute("aria-labelledby");
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    // Un clic no debe abrir el listbox estando deshabilitado
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument();

    // Tampoco debe abrirse con teclado. Un botón `disabled` no puede recibir
    // foco real en el navegador, así que se despacha el evento de teclado
    // directamente para ejercitar el guard `if (disabled) return` del handler.
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const WithoutOptions: Story = {
  name: "Sin opciones",
  parameters: {
    docs: {
      description: {
        story:
          "Con `options` vacío no hay idioma seleccionado que mostrar y el listbox no llega a abrirse (`openDropdown` lo ignora).",
      },
    },
  },
  args: {
    value: "es",
    options: [],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const SelectedValueNotInOptions: Story = {
  name: "Valor seleccionado fuera de las opciones",
  parameters: {
    docs: {
      description: {
        story:
          "Si el `value` actual no corresponde a ninguna de las `options` recibidas (p. ej. datos inconsistentes), no se resalta ningún idioma en el trigger y, al abrir, se resalta la primera opción por defecto.",
      },
    },
  },
  args: {
    value: "es",
    options: LANGUAGES.slice(1, 2),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      `${trigger.id}-option-0`,
    );
  },
};

export const WithClassName: Story = {
  name: "Con clase adicional",
  args: {
    className: "custom-change-locale",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await expect(trigger.closest(".change-locale")).toHaveClass(
      "custom-change-locale",
    );
  },
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el listbox con teclado, navega con flechas, selecciona con Enter y comprueba que Escape cierra sin disparar `onChange`.",
      },
    },
  },
  args: {
    label: "Idioma",
    value: "es",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Idioma/i });

    // Abrir con teclado (ArrowDown) y navegar hasta la siguiente opción
    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const listbox = within(document.body).getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options.length).toBeGreaterThan(1);

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    await expect(args.onChange).toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Reabrir con clic y cerrar con Escape sin volver a seleccionar
    await userEvent.click(trigger);
    expect(within(document.body).getByRole("listbox")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const KeyboardArrowUpHomeEnd: Story = {
  name: "Interacción: ArrowUp, Home y End",
  parameters: {
    docs: {
      description: {
        story:
          "Abrir con ArrowUp resalta la última opción; Home y End saltan directamente a la primera y última opción respectivamente.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    trigger.focus();
    await userEvent.keyboard("{ArrowUp}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      `${trigger.id}-option-1`,
    );

    await userEvent.keyboard("{Home}");
    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      `${trigger.id}-option-0`,
    );

    await userEvent.keyboard("{End}");
    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      `${trigger.id}-option-1`,
    );

    await userEvent.keyboard("{ArrowUp}");
    await expect(trigger).toHaveAttribute(
      "aria-activedescendant",
      `${trigger.id}-option-0`,
    );
  },
};

export const IrrelevantKeyWhileClosedDoesNothing: Story = {
  name: "Interacción: tecla ajena al combobox no abre el listbox",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    trigger.focus();
    await userEvent.keyboard("a");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(document.body).queryByRole("listbox")).not.toBeInTheDocument();
  },
};

export const SelectingCurrentValueClosesWithoutOnChange: Story = {
  name: "Interacción: reseleccionar el valor actual no dispara onChange",
  parameters: {
    docs: {
      description: {
        story:
          "Elegir la opción ya seleccionada cierra el listbox pero no invoca `onChange`, ya que el valor no cambia.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    const listbox = within(document.body).getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await userEvent.click(options[0] as HTMLElement);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const TabClosesWithoutSelecting: Story = {
  name: "Interacción: Tab cierra sin seleccionar",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Tab}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const MouseSelection: Story = {
  name: "Interacción: selección con ratón",
  parameters: {
    docs: {
      description: {
        story:
          "Pasar el ratón por una opción la resalta y un clic sobre ella la selecciona, cerrando el listbox.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    const listbox = within(document.body).getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    await userEvent.hover(options[1] as HTMLElement);
    await expect(options[1] as HTMLElement).toHaveClass(
      "change-locale__option--highlighted",
    );

    await userEvent.click(options[1] as HTMLElement);
    await expect(args.onChange).toHaveBeenCalledWith("en");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const ClickTogglesOpenClosed: Story = {
  name: "Interacción: clic abre y vuelve a cerrar",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const ClosesOnOutsideClick: Story = {
  name: "Interacción: clic fuera cierra el listbox",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(document.body);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const RepositionsOnScrollAndResize: Story = {
  name: "Interacción: reposiciona en scroll y resize",
  parameters: {
    docs: {
      description: {
        story:
          "Mientras el listbox está abierto, hacer scroll o redimensionar la ventana recalcula su posición sin cerrarlo.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(document.body).getByRole("listbox")).toBeInTheDocument();
  },
};

export const OpensUpwardWhenNoSpaceBelow: Story = {
  name: "Interacción: se abre hacia arriba sin espacio debajo",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando no hay hueco suficiente debajo del trigger pero sí encima, el listbox se posiciona hacia arriba (`placement: \"top\"`).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    const originalGetBoundingClientRect =
      trigger.getBoundingClientRect.bind(trigger);
    trigger.getBoundingClientRect = () => ({
      ...originalGetBoundingClientRect(),
      top: window.innerHeight - 10,
      bottom: window.innerHeight + 30,
      left: 0,
      right: 200,
      width: 200,
      height: 40,
      x: 0,
      y: window.innerHeight - 10,
      toJSON: () => ({}),
    });

    await userEvent.click(trigger);

    const listbox = within(document.body).getByRole("listbox") as HTMLElement;
    await expect(listbox.style.bottom).not.toBe("");
    await expect(listbox.style.top).toBe("");

    trigger.getBoundingClientRect = originalGetBoundingClientRect;
  },
};

export const HidesSelectedFromList: Story = {
  name: "Oculta el idioma activo del listado",
  parameters: {
    docs: {
      description: {
        story:
          "Con `hideSelectedFromList`, el trigger sigue mostrando el idioma activo, pero el listbox solo ofrece los demás — útil para un selector \"cambiar a\" como el del footer, donde reseleccionar el idioma actual no tiene sentido.",
      },
    },
  },
  args: {
    value: "es",
    hideSelectedFromList: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    await userEvent.click(trigger);

    const listbox = within(document.body).getByRole("listbox");
    const options = within(listbox).getAllByRole("option");

    // Solo "en" está en el listado: "es" (el valor actual) queda fuera.
    await expect(options).toHaveLength(1);
    await expect(options[0]).toHaveTextContent("English");

    await userEvent.click(options[0] as HTMLElement);
    await expect(args.onChange).toHaveBeenCalledWith("en");
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 260 }}
    >
      <ChangeLocale {...args} label="Normal" value="es" />
      <ChangeLocale {...args} label="Con descripción" description="Cambia el idioma de toda la aplicación." value="es" />
      <ChangeLocale {...args} label="Deshabilitado" value="es" disabled />
    </div>
  ),
};
