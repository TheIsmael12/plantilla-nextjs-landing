import { ComponentType, useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import type {
  SelectMultipleProps,
  SelectOption,
  SelectSingleProps,
} from "@/types/ui/inputs/select";

import Select from "./Select";

// Storybook no infiere bien los args cuando el componente acepta una unión
// discriminada (single/multiple); las stories aquí cubren cada caso con su
// propio cast de tipo.
const SelectSingle = Select as ComponentType<SelectSingleProps>;
const SelectMultiple = Select as ComponentType<SelectMultipleProps>;

const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: "Europe/Madrid", label: "Europe/Madrid" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "Europe/Paris", label: "Europe/Paris" },
  { value: "America/New_York", label: "America/New_York" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
];

const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
];

const ROLE_OPTIONS: SelectOption[] = [
  { value: "USER", label: "Usuario" },
  { value: "PLATFORM_ADMIN", label: "Administrador de la plataforma" },
  { value: "SUPPORT", label: "Soporte" },
];

const meta = {
  title: "UI/Inputs/Select",
  component: SelectSingle,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Select accesible que implementa el patrón ARIA `combobox` + `listbox`, con el desplegable montado en un portal a `document.body` (para no quedar recortado por el `overflow` de contenedores) y reposicionado automáticamente arriba o abajo según el espacio disponible en el viewport. Soporta selección simple o múltiple mediante una unión discriminada por `multiple`, navegación completa por teclado (flechas, Inicio/Fin, Escape) y búsqueda por teclado (typeahead) tanto con el listado abierto como cerrado.",
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
    size: {
      control: "radio",
      options: ["sm", "md"],
      description: "Tamaño visual del selector.",
    },
    options: {
      control: false,
      description:
        "Array de opciones { value, label } disponibles en el selector.",
    },
    noTranslate: {
      control: "boolean",
      description:
        "Si es true, el valor de `label` se usa directamente sin pasar por next-intl.",
    },
    className: {
      control: "text",
      description:
        'Clases CSS adicionales. Por defecto el ancho es automático; pasa "select__full" (100%) o "select__md" (min-width: 18rem) para los otros dos anchos.',
    },
    onChange: { action: "changed" },
  },
  args: {
    id: "select-story",
    name: "select-story",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    noTranslate: true,
    onChange: fn(),
  },
} satisfies Meta<typeof SelectSingle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
};

export const FullWidth: Story = {
  name: "Ancho completo",
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto el ancho es automático (no se estira a ocupar toda la fila). Con `className=\"select__full\"` ocupa el 100% de su contenedor.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    className: "select__full",
  },
};

export const MediumWidth: Story = {
  name: "Ancho medio (select__md)",
  parameters: {
    docs: {
      description: {
        story:
          'Con `className="select__md"` el selector tiene un ancho mínimo de 18rem, útil para alinear varios campos en un formulario sin llegar a ocupar el 100% de la fila.',
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    className: "select__md",
  },
};

export const WithDescription: Story = {
  name: "Con descripción",
  args: {
    label: "Zona horaria",
    description: "Se usa para mostrarte siempre la hora correcta según tu ubicación.",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `label` visible, `ariaLabel` mantiene un nombre accesible correcto para lectores de pantalla.",
      },
    },
  },
  args: {
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    ariaLabel: "Zona horaria",
  },
};

export const WithPlaceholder: Story = {
  name: "Con placeholder",
  args: {
    label: "Zona horaria",
    value: "",
    options: TIMEZONE_OPTIONS,
    placeholder: "Selecciona una zona horaria",
  },
};

export const Required: Story = {
  name: "Obligatorio",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    required: true,
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await expect(trigger).toBeDisabled();

    await userEvent.click(trigger);

    expect(
      within(document.body).queryByRole("listbox"),
    ).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const DateFormats: Story = {
  name: "Formato de fecha",
  args: {
    label: "Formato de fecha",
    value: "DD/MM/YYYY",
    options: DATE_FORMAT_OPTIONS,
  },
};

export const Small: Story = {
  name: "Tamaño pequeño (sm)",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    size: "sm",
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    label: "Zona horaria",
    value: "",
    options: TIMEZONE_OPTIONS,
    required: true,
    error: "generic.required",
    touched: true,
  },
};

export const NoOptions: Story = {
  name: "Sin opciones disponibles",
  parameters: {
    docs: {
      description: {
        story:
          "Si `options` está vacío, el selector no abre el listado ni al hacer clic ni con teclado; se muestra el `placeholder` de forma permanente.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "",
    options: [],
    placeholder: "No hay zonas disponibles",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await userEvent.click(trigger);

    expect(
      within(document.body).queryByRole("listbox"),
    ).not.toBeInTheDocument();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

/**
 * Historia interactiva de selección múltiple: necesita estado propio (el
 * componente no es controlado desde `args`), así que vive en un componente
 * con nombre en mayúscula en vez de una función anónima en `render`, para
 * que `react-hooks/rules-of-hooks` reconozca el `useState` de dentro.
 */
function MultipleSelectStory() {
  const [value, setValue] = useState<string[]>(["USER"]);
  return (
    <SelectMultiple
      id="select-multiple-story"
      name="select-multiple-story"
      label="Roles"
      noTranslate
      multiple
      value={value}
      options={ROLE_OPTIONS}
      onChange={setValue}
    />
  );
}

export const Multiple: Story = {
  name: "Selección múltiple",
  parameters: { controls: { disable: true } },
  render: () => <MultipleSelectStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Roles/i });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const listbox = within(document.body).getByRole("listbox");
    const supportOption = within(listbox).getByRole("option", {
      name: "Soporte",
    });
    await expect(supportOption).toHaveAttribute("aria-selected", "false");

    await userEvent.click(supportOption);

    // En selección múltiple el listado permanece abierto tras elegir una opción.
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(document.body).getByRole("option", { name: "Soporte" }),
    ).toHaveAttribute("aria-selected", "true");

    await userEvent.click(
      within(document.body).getByRole("option", { name: "Soporte" }),
    );
    await expect(
      within(document.body).getByRole("option", { name: "Soporte" }),
    ).toHaveAttribute("aria-selected", "false");

    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
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
    value: "USER",
    options: ROLE_OPTIONS,
  },
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el listado con clic, selecciona una opción y comprueba que `onChange` recibe el valor elegido y el listado se cierra.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const listbox = within(document.body).getByRole("listbox");
    const option = within(listbox).getByRole("option", {
      name: "Europe/Paris",
    });
    await userEvent.click(option);

    await expect(args.onChange).toHaveBeenCalledWith("Europe/Paris");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const KeyboardNavigation: Story = {
  name: "Interacción por teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el listado con `ArrowDown`, navega entre opciones con las flechas, selecciona con `Enter` y cierra con `Escape`.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");

    await expect(args.onChange).toHaveBeenCalledWith("Europe/London");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 280 }}
    >
      <SelectSingle {...args} label="Normal" />
      <SelectSingle {...args} label="Obligatorio" required />
      <SelectSingle {...args} label="Deshabilitado" disabled />
    </div>
  ),
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
    options: TIMEZONE_OPTIONS,
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

export const TopPlacement: Story = {
  name: "Interacción: se abre hacia arriba sin espacio abajo",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Cuando no hay suficiente espacio debajo del selector en el viewport (y sí lo hay arriba), el listado se despliega hacia arriba (`bottom` en vez de `top` en el estilo del listbox).",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

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

    const listbox = within(document.body).getByRole("listbox");
    const style = listbox.getAttribute("style") ?? "";
    await expect(style).toMatch(/bottom:/);
    await expect(style).not.toMatch(/top:/);
  },
};

export const ClickOutsideCloses: Story = {
  name: "Interacción: clic fuera cierra el listado",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

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

export const RepositionOnScrollAndResize: Story = {
  name: "Interacción: reposiciona en scroll/resize",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));

    // Sigue abierto y recalculado sin errores tras los eventos.
    await expect(
      within(document.body).getByRole("listbox"),
    ).toBeInTheDocument();
  },
};

export const ArrowUpOpensAtLastOption: Story = {
  name: "Interacción: ArrowUp abre resaltando la última opción",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    trigger.focus();
    await userEvent.keyboard("{ArrowUp}");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(document.body).getByRole("option", { name: "Asia/Tokyo" }),
    ).toHaveClass("select__option--highlighted");
  },
};

export const KeyboardHomeEndSpaceTab: Story = {
  name: "Interacción: Home, End, espacio y Tab",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el listado abierto, `Home`/`End` saltan a la primera/última opción, la barra espaciadora selecciona la opción resaltada (igual que `Enter`) y `Tab` cierra el listado sin devolver el foco al trigger.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await userEvent.click(trigger);

    // ArrowDown avanza y ArrowUp retrocede una posición (switch del listado abierto).
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      within(document.body).getByRole("option", { name: "Europe/London" }),
    ).toHaveClass("select__option--highlighted");
    await userEvent.keyboard("{ArrowUp}");
    await expect(
      within(document.body).getByRole("option", { name: "Europe/Madrid" }),
    ).toHaveClass("select__option--highlighted");

    await userEvent.keyboard("{Home}");
    await expect(
      within(document.body).getByRole("option", { name: "Europe/Madrid" }),
    ).toHaveClass("select__option--highlighted");

    await userEvent.keyboard("{End}");
    await expect(
      within(document.body).getByRole("option", { name: "Asia/Tokyo" }),
    ).toHaveClass("select__option--highlighted");

    await userEvent.keyboard(" ");
    await expect(args.onChange).toHaveBeenCalledWith("Asia/Tokyo");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.tab();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const DisabledKeyDownNoop: Story = {
  name: "Interacción: teclado no hace nada si está deshabilitado",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    fireEvent.keyDown(trigger, { key: "Enter" });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const SelectAlreadySelectedOptionNoop: Story = {
  name: "Interacción: clic sobre la opción ya seleccionada",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic sobre la opción que ya está seleccionada, el listado se cierra igualmente pero `onChange` no se invoca (el valor no cambia).",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await userEvent.click(trigger);
    const listbox = within(document.body).getByRole("listbox");
    const currentOption = within(listbox).getByRole("option", {
      name: "Europe/Madrid",
    });

    await userEvent.click(currentOption);

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const TypeaheadClosedSingleSelect: Story = {
  name: "Interacción: typeahead con listado cerrado (simple)",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el listado cerrado y selección simple, escribir una letra busca la primera opción cuyo texto empieza por ella e invoca `onChange` directamente, sin abrir el listado.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    trigger.focus();
    await userEvent.keyboard("a");

    await expect(args.onChange).toHaveBeenCalledWith("America/New_York");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const TypeaheadClosedMultipleSelect: Story = {
  name: "Interacción: typeahead con listado cerrado (múltiple)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Prueba de interacción: en selección múltiple, escribir con el listado cerrado lo abre resaltando la primera coincidencia, en vez de seleccionarla directamente.",
      },
    },
  },
  render: () => <MultipleSelectStory />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Roles/i });

    trigger.focus();
    await userEvent.keyboard("s");

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      within(document.body).getByRole("option", { name: "Soporte" }),
    ).toHaveClass("select__option--highlighted");
  },
};

export const TypeaheadOpenJumpsToMatch: Story = {
  name: "Interacción: typeahead con listado abierto",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await userEvent.click(trigger);
    await expect(
      within(document.body).getByRole("option", { name: "Europe/Madrid" }),
    ).toHaveClass("select__option--highlighted");

    // Busca desde la opción siguiente a la resaltada.
    await userEvent.keyboard("a");

    await expect(
      within(document.body).getByRole("option", { name: "America/New_York" }),
    ).toHaveClass("select__option--highlighted");
  },
};

export const TypeaheadNoMatchNoop: Story = {
  name: "Interacción: typeahead sin coincidencias no hace nada",
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    trigger.focus();
    await userEvent.keyboard("z");

    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Con el listado cerrado, teclas de más de un carácter que no abren
    // el desplegable (fuera de OPEN_KEYS) tampoco disparan el typeahead.
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const OpenKeyboardIgnoresLongKeyNames: Story = {
  name: "Interacción: teclas especiales con el listado abierto",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el listado abierto, teclas que no coinciden con ningún caso del switch y cuyo nombre tiene más de un carácter (p. ej. `Shift`) no disparan el typeahead ni cambian la opción resaltada.",
      },
    },
  },
  args: {
    label: "Zona horaria",
    value: "Europe/Madrid",
    options: TIMEZONE_OPTIONS,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Zona horaria/i });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(trigger, { key: "Shift" });

    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(args.onChange).not.toHaveBeenCalled();
    await expect(
      within(document.body).getByRole("option", { name: "Europe/Madrid" }),
    ).toHaveClass("select__option--highlighted");
  },
};
