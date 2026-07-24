import { ComponentType, useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import type {
  SelectSearchMultipleProps,
  SelectSearchOption,
  SelectSearchSingleProps,
} from "@/types/ui/inputs/select-search";

import SelectSearch from "./SelectSearch";

// Storybook no infiere bien los args cuando el componente acepta una unión
// discriminada (single/multiple); las stories aquí cubren cada caso con su
// propio cast de tipo.
const SelectSearchSingle = SelectSearch as ComponentType<SelectSearchSingleProps>;
const SelectSearchMultiple =
  SelectSearch as ComponentType<SelectSearchMultipleProps>;

const COUNTRY_OPTIONS: SelectSearchOption[] = [
  { value: "es", label: "España" },
  { value: "fr", label: "Francia" },
  { value: "de", label: "Alemania" },
  { value: "it", label: "Italia" },
  { value: "pt", label: "Portugal" },
  { value: "uk", label: "Reino Unido" },
  { value: "us", label: "Estados Unidos" },
  { value: "jp", label: "Japón" },
];

const meta = {
  title: "UI/Inputs/SelectSearch",
  component: SelectSearchSingle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Select con buscador integrado: filtra las opciones a medida que se escribe y resalta las coincidencias con `<mark>`. Se renderiza en un portal a `document.body` (como `Select` o `ModalComponent`) para no quedar recortado por el overflow de contenedores padres, y calcula su posición (arriba/abajo del trigger) según el espacio disponible en el viewport. Sigue el patrón ARIA combobox + listbox con navegación completa por teclado (flechas, Home/End, Enter, Escape) y soporta selección simple o múltiple mediante una unión discriminada por la prop `multiple`.",
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
    label: {
      control: "text",
      description: "Etiqueta visible encima del selector.",
    },
    description: {
      control: "text",
      description: "Breve explicación de qué controla el campo, visible bajo el label.",
    },
    placeholder: {
      control: "text",
      description: "Texto mostrado cuando no hay opción seleccionada.",
    },
    ariaLabel: {
      control: "text",
      description:
        "`aria-label` del selector, usado como nombre accesible cuando no hay `label` visible.",
    },
    value: {
      control: "text",
      description: "Valor seleccionado actualmente (prop controlada).",
    },
    required: {
      control: "boolean",
      description: "Marca el campo como obligatorio con un asterisco (*).",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el selector impidiendo cualquier interacción.",
    },
    error: {
      control: "text",
      description:
        "Clave de traducción del error (namespace `Validations`). Requiere `touched=true` para mostrarse.",
    },
    touched: {
      control: "boolean",
      description:
        "Marca el campo como interactuado, habilitando la visualización del error.",
    },
    searchPlaceholder: {
      control: "text",
      description: "Placeholder del campo de búsqueda interno.",
    },
    noResultsText: {
      control: "text",
      description: "Texto mostrado cuando el filtro no arroja resultados.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales del contenedor.",
    },
    options: {
      control: false,
      description: "Array de opciones { value, label } disponibles.",
    },
    onChange: { action: "changed" },
    defaultOpen: {
      control: "boolean",
      description:
        "Estado inicial del desplegable al montar. Solo pensado para demos/documentación.",
    },
    defaultSearchTerm: {
      control: "text",
      description:
        "Texto de búsqueda inicial al montar. Solo pensado para demos/documentación.",
    },
    noTranslate: {
      control: "boolean",
      description:
        "Si es true, los valores de `label` y `placeholder` se usan directamente sin pasar por next-intl.",
    },
  },
  args: {
    id: "select-search-story",
    name: "select-search-story",
    value: "es",
    options: COUNTRY_OPTIONS,
    noTranslate: true,
    onChange: fn(),
  },
} satisfies Meta<typeof SelectSearchSingle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `label` visible, `ariaLabel` mantiene un nombre accesible correcto para lectores de pantalla; el listado tampoco se asocia con `aria-labelledby` al abrirse.",
      },
    },
  },
  args: {
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
    ariaLabel: "País",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "País" });

    await userEvent.click(trigger);

    await expect(
      within(document.body).getByRole("listbox"),
    ).not.toHaveAttribute("aria-labelledby");
  },
};

export const WithoutIdUsesGeneratedId: Story = {
  name: "Sin id explícito (usa React.useId)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `id`, el componente genera uno propio con `useId` para asociar el trigger, el listado y su label.",
      },
    },
  },
  args: {
    id: undefined,
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    await expect(trigger).toHaveAttribute("id");
    await expect(trigger.getAttribute("id")).not.toBe("");
  },
};

export const CustomClassName: Story = {
  name: "Clase CSS adicional",
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
    className: "select-search__custom-story",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    await expect(trigger.closest(".select-search__custom-story")).not.toBeNull();
  },
};

export const Required: Story = {
  name: "Obligatorio",
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
    required: true,
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "País",
    value: "es",
    options: COUNTRY_OPTIONS,
    disabled: true,
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
    error: "generic.required",
    touched: true,
  },
};

export const WithDescription: Story = {
  name: "Con descripción",
  args: {
    label: "País",
    description: "Se usará para formatear fechas, moneda e idioma por defecto.",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
};

export const CustomTexts: Story = {
  name: "Textos de búsqueda personalizados",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`searchPlaceholder` y `noResultsText` permiten sustituir los textos por defecto del buscador interno y del estado sin resultados.",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
    searchPlaceholder: "Escribe para filtrar...",
    noResultsText: "No se encontró ningún país",
    defaultOpen: true,
    defaultSearchTerm: "xyz-no-existe",
  },
  play: async () => {
    await expect(
      within(document.body).getByPlaceholderText("Escribe para filtrar..."),
    ).toBeInTheDocument();

    await expect(
      within(document.body).getByText("No se encontró ningún país"),
    ).toBeInTheDocument();
  },
};

export const WithSearch: Story = {
  name: "Con búsqueda",
  parameters: { controls: { disable: true } },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
    defaultOpen: true,
    defaultSearchTerm: "ale",
  },
};

export const NoResults: Story = {
  name: "Sin resultados",
  parameters: { controls: { disable: true } },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
    defaultOpen: true,
    defaultSearchTerm: "xyz-no-existe",
  },
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el desplegable, escribe en el buscador y valida el filtrado.",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);

    const searchbox = await within(document.body).findByRole("searchbox");
    await userEvent.type(searchbox, "ale");

    await expect(
      within(document.body).getByRole("option", { name: "Alemania" }),
    ).toBeInTheDocument();

    // El fragmento coincidente con la búsqueda se resalta en <mark>
    await expect(within(document.body).getByText("Ale")).toBeInTheDocument();

    await userEvent.clear(searchbox);
    await userEvent.type(searchbox, "xyz-no-existe");

    await expect(
      within(document.body).getByText("No hay resultados"),
    ).toBeInTheDocument();
  },
};

export const KeyboardInteraction: Story = {
  name: "Interacción: solo teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el desplegable con teclado (Enter sobre el trigger), navega las opciones con flechas y selecciona con Enter, sin usar el ratón en ningún momento.",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");

    trigger.focus();
    await userEvent.keyboard("{Enter}");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const searchbox = await within(document.body).findByRole("searchbox");
    await expect(searchbox).toHaveFocus();

    // España está resaltada por defecto (0); ArrowDown pasa a Francia (1).
    await userEvent.keyboard("{ArrowDown}{Enter}");

    await expect(args.onChange).toHaveBeenCalledWith("fr");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
  },
};

export const EscapeCloses: Story = {
  name: "Interacción: Escape cierra y devuelve el foco",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el desplegable abierto, Escape lo cierra y devuelve el foco al trigger, sin invocar `onChange`.",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);

    const searchbox = await within(document.body).findByRole("searchbox");
    await expect(searchbox).toHaveFocus();

    await userEvent.keyboard("{Escape}");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 280 }}
    >
      <SelectSearchSingle {...args} label="Normal" />
      <SelectSearchSingle {...args} label="Obligatorio" required value="" />
      <SelectSearchSingle
        {...args}
        label="Con error"
        value=""
        error="generic.required"
        touched
      />
      <SelectSearchSingle {...args} label="Deshabilitado" disabled />
    </div>
  ),
};

/**
 * Historia interactiva de selección múltiple: necesita estado propio (el
 * componente no es controlado desde `args`), así que vive en un componente
 * con nombre en mayúscula en vez de una función anónima en `render`, para
 * que `react-hooks/rules-of-hooks` reconozca el `useState` de dentro.
 */
function MultipleSelectSearchStory() {
  const [value, setValue] = useState<string[]>(["es", "fr"]);
  return (
    <SelectSearchMultiple
      id="select-search-multiple-story"
      name="select-search-multiple-story"
      label="Países"
      placeholder="Selecciona países"
      noTranslate
      multiple
      value={value}
      options={COUNTRY_OPTIONS}
      onChange={setValue}
    />
  );
}

export const Multiple: Story = {
  name: "Selección múltiple",
  parameters: { controls: { disable: true } },
  render: () => <MultipleSelectSearchStory />,
};

// Spy compartido por `MultipleInteractionStory`: al no ser controlada desde
// `args` (ver nota de `MultipleSelectSearchStory`), la única forma de
// observar las llamadas a `onChange` en el `play` es capturarlas aquí.
const multipleOnChangeSpy = fn();

function MultipleInteractionStory() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <SelectSearchMultiple
      id="select-search-multiple-interaction"
      name="select-search-multiple-interaction"
      label="Países"
      placeholder="Selecciona países"
      noTranslate
      multiple
      value={value}
      options={COUNTRY_OPTIONS}
      onChange={(next) => {
        multipleOnChangeSpy(next);
        setValue(next);
      }}
    />
  );
}

export const MultipleInteraction: Story = {
  name: "Interacción: alternar varias opciones",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Prueba de interacción: en modo múltiple, cada clic sobre una opción alterna su selección (la añade o la quita) y `onChange` recibe siempre la lista completa actualizada, sin cerrar el desplegable.",
      },
    },
  },
  render: () => <MultipleInteractionStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox");
    await userEvent.click(trigger);

    const spainOption = await within(document.body).findByRole("option", {
      name: "España",
    });
    await userEvent.click(spainOption);
    await expect(multipleOnChangeSpy).toHaveBeenCalledWith(["es"]);

    const franceOption = within(document.body).getByRole("option", {
      name: "Francia",
    });
    await userEvent.click(franceOption);
    await expect(multipleOnChangeSpy).toHaveBeenCalledWith(["es", "fr"]);

    // El desplegable permanece abierto tras seleccionar en modo múltiple.
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Volver a hacer clic en España la deselecciona.
    await userEvent.click(spainOption);
    await expect(multipleOnChangeSpy).toHaveBeenCalledWith(["fr"]);
  },
};

export const TranslatedLabel: Story = {
  name: "Label traducido (Labels)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `noTranslate`, el `label` se resuelve como clave del namespace `Labels` de next-intl (aquí, `roles`).",
      },
    },
  },
  args: {
    label: "roles",
    noTranslate: false,
    value: "es",
    options: COUNTRY_OPTIONS,
  },
};

export const TranslatedPlaceholderAndAriaLabel: Story = {
  name: "Placeholder y aria-label traducidos (i18n)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `noTranslate`, tanto `placeholder` como `ariaLabel` se resuelven como claves de sus respectivos namespaces de next-intl (`Placeholders`/`Labels`) en vez de mostrarse tal cual.",
      },
    },
  },
  args: {
    value: "",
    options: COUNTRY_OPTIONS,
    placeholder: "email",
    ariaLabel: "email",
    noTranslate: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", {
      name: "Correo electrónico",
    });

    await expect(trigger).toHaveTextContent("tu@correo.com");
  },
};

export const NoOptions: Story = {
  name: "Sin opciones disponibles",
  parameters: {
    docs: {
      description: {
        story:
          "Si `options` está vacío, el selector no abre el desplegable ni al hacer clic ni con teclado; se muestra el `placeholder` de forma permanente.",
      },
    },
  },
  args: {
    label: "País",
    value: "",
    options: [],
    placeholder: "No hay países disponibles",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      within(document.body).queryByRole("listbox"),
    ).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const TopPlacement: Story = {
  name: "Interacción: se abre hacia arriba sin espacio abajo",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Cuando no hay suficiente espacio debajo del selector en el viewport (y sí lo hay arriba), el desplegable se abre hacia arriba (`bottom` en vez de `top` en su estilo).",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    // Simula que el trigger está pegado al borde inferior del viewport, sin
    // apenas espacio debajo pero con mucho espacio disponible arriba.
    trigger.getBoundingClientRect = () =>
      ({
        top: window.innerHeight - 50,
        bottom: window.innerHeight - 20,
        left: 0,
        right: 200,
        width: 200,
        height: 30,
        x: 0,
        y: window.innerHeight - 50,
        toJSON: () => {},
      }) as DOMRect;

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const dropdown = document.querySelector(".select-search__dropdown");
    const style = dropdown?.getAttribute("style") ?? "";
    await expect(style).toMatch(/bottom:/);
    await expect(style).not.toMatch(/top:/);
  },
};

export const TriggerKeyDownIgnoresOtherKeys: Story = {
  name: "Interacción: teclas ajenas no abren el desplegable",
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    trigger.focus();
    await userEvent.keyboard("a");

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const NoResultsEnterNoop: Story = {
  name: "Interacción: Enter sin resultados no hace nada",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: si el filtro no arroja resultados, pulsar `Enter` en el buscador no invoca `onChange` (no hay ninguna opción resaltada que seleccionar).",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });
    await userEvent.click(trigger);

    const searchbox = await within(document.body).findByRole("searchbox");
    await userEvent.type(searchbox, "xyz-no-existe");

    await expect(
      within(document.body).getByText("No hay resultados"),
    ).toBeInTheDocument();

    await userEvent.keyboard("{Enter}");

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const ClickOutsideCloses: Story = {
  name: "Interacción: clic fuera cierra el desplegable",
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(document.body);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onChange).not.toHaveBeenCalled();

    // Clicar de nuevo sobre el propio trigger, ya abierto, lo cierra también.
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const AlreadySelectedOptionNoop: Story = {
  name: "Interacción: clic sobre la opción ya seleccionada",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic sobre la opción que ya está seleccionada, el desplegable se cierra igualmente pero `onChange` no se invoca.",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    await userEvent.click(trigger);
    const currentOption = await within(document.body).findByRole("option", {
      name: "España",
    });

    await userEvent.click(currentOption);

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const TriggerKeyDownNoopWhileOpen: Story = {
  name: "Interacción: teclado en el trigger no hace nada si ya está abierto",
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "es",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(trigger, { key: "Enter" });

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const KeyboardHomeEndArrowUpAndTab: Story = {
  name: "Interacción: Home, End, ArrowUp y Tab",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el desplegable abierto, `Home`/`End` saltan a la primera/última opción, `ArrowUp` retrocede una posición y `Tab` cierra el desplegable sin invocar `onChange`.",
      },
    },
  },
  args: {
    label: "País",
    placeholder: "Selecciona un país",
    value: "",
    options: COUNTRY_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /País/i });
    await userEvent.click(trigger);

    const searchbox = await within(document.body).findByRole("searchbox");
    await expect(searchbox).toHaveFocus();

    await userEvent.keyboard("{End}");
    await expect(
      within(document.body).getByRole("option", { name: "Japón" }),
    ).toHaveClass("select__option--highlighted");

    await userEvent.keyboard("{ArrowUp}");
    await expect(
      within(document.body).getByRole("option", {
        name: "Estados Unidos",
      }),
    ).toHaveClass("select__option--highlighted");

    await userEvent.keyboard("{Home}");
    await expect(
      within(document.body).getByRole("option", { name: "España" }),
    ).toHaveClass("select__option--highlighted");

    await userEvent.tab();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};
