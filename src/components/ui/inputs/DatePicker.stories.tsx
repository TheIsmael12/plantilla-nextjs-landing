import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import DatePicker from "./DatePicker";

const today = new Date();
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

// Ejemplo de fechas concretas deshabilitadas (festivos ya reservados, etc.)
const disabledDatesList = [5, 12, 19, 26].map(
  (day) => new Date(today.getFullYear(), today.getMonth(), day),
);
const isDisabledDate = (date: Date) =>
  disabledDatesList.some(
    (disabledDate) =>
      disabledDate.getFullYear() === date.getFullYear() &&
      disabledDate.getMonth() === date.getMonth() &&
      disabledDate.getDate() === date.getDate(),
  );

// Ejemplo de indicadores: 4 días seguidos con descuento + un día con alta demanda
const discountDates = [8, 9, 10, 11].map(
  (day) => new Date(today.getFullYear(), today.getMonth(), day),
);
const highDemandDates = [20].map(
  (day) => new Date(today.getFullYear(), today.getMonth(), day),
);

const meta = {
  title: "UI/Inputs/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Selector de fecha accesible que combina un campo tipo `combobox` con un panel de calendario emergente (portal a `document.body`). Soporta navegación completa por teclado (flechas, Inicio/Fin, RePág/AvPág, Escape), restricciones configurables (rango min/max, pasado/futuro/hoy, fechas puntuales) e indicadores visuales por día con su leyenda.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 280, minHeight: 360 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    label: {
      control: "text",
      description: "Etiqueta visible encima del campo.",
    },
    placeholder: {
      control: "text",
      description: "Texto mostrado cuando no hay fecha seleccionada.",
    },
    ariaLabel: {
      control: "text",
      description:
        "`aria-label` del campo, usado cuando no hay `label` visible.",
    },
    value: {
      control: false,
      description:
        "Fecha seleccionada actualmente (prop controlada). Admite un `Date` o una cadena \"YYYY-MM-DD\".",
    },
    required: {
      control: "boolean",
      description: "Marca el campo como obligatorio con un asterisco (*).",
    },
    disabled: {
      control: "boolean",
      description: "Deshabilita el campo impidiendo cualquier interacción.",
    },
    clearable: {
      control: "boolean",
      description: "Muestra un botón para limpiar la fecha seleccionada.",
    },
    error: {
      control: "text",
      description:
        "Mensaje de error. Requiere `touched=true` para mostrarse.",
    },
    touched: {
      control: "boolean",
      description:
        "Marca el campo como interactuado, habilitando la visualización del error.",
    },
    size: {
      control: "radio",
      options: ["sm", "md"],
      description: "Tamaño visual del campo.",
    },
    firstDayOfWeek: {
      control: "radio",
      options: [0, 1],
      description: "Primer día de la semana (0 = domingo, 1 = lunes).",
    },
    minDate: { control: false },
    maxDate: { control: false },
    disablePast: {
      control: "boolean",
      description: "Deshabilita fechas anteriores a hoy.",
    },
    disableFuture: {
      control: "boolean",
      description: "Deshabilita fechas posteriores a hoy.",
    },
    disableToday: {
      control: "boolean",
      description:
        "Deshabilita también hoy (combinado con disablePast exige fecha estrictamente posterior).",
    },
    disabledDates: { control: false },
    indicators: { control: false },
    onChange: { action: "changed" },
    defaultOpen: {
      control: "boolean",
      description:
        "Estado inicial del calendario al montar. Solo pensado para demos/documentación.",
    },
  },
  args: {
    id: "date-picker-story",
    name: "date-picker-story",
    value: null,
    onChange: fn(),
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Fecha de nacimiento",
    placeholder: "Selecciona una fecha",
    value: null,
  },
};

export const WithValue: Story = {
  name: "Con valor",
  args: {
    label: "Fecha de nacimiento",
    value: today,
  },
};

export const WithoutLabel: Story = {
  name: "Sin etiqueta",
  args: {
    placeholder: "Selecciona una fecha",
    ariaLabel: "Fecha de nacimiento",
    value: null,
  },
};

export const WithAriaLabel: Story = {
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
    placeholder: "Selecciona una fecha",
    ariaLabel: "Fecha de nacimiento",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", {
      name: "Fecha de nacimiento",
    });
    await expect(trigger).toBeInTheDocument();
  },
};

export const SmallSize: Story = {
  name: "Tamaño pequeño",
  args: {
    label: "Fecha de inicio",
    value: today,
    size: "sm",
  },
};

export const SundayFirst: Story = {
  name: "Semana empieza en domingo",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Con `firstDayOfWeek={0}` la primera columna del calendario es domingo en vez de lunes.",
      },
    },
  },
  args: {
    label: "Fecha de la reserva",
    value: null,
    firstDayOfWeek: 0,
    defaultOpen: true,
  },
};

export const Required: Story = {
  name: "Obligatorio",
  args: {
    label: "Fecha de inicio",
    value: null,
    required: true,
  },
};

export const Clearable: Story = {
  name: "Con botón de limpiar",
  args: {
    label: "Fecha de inicio",
    value: today,
    clearable: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const clearButton = canvas.getByRole("button", { name: /borrar fecha/i });

    await userEvent.click(clearButton);

    await expect(args.onChange).toHaveBeenCalledWith(null);
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "Fecha de inicio",
    value: today,
    disabled: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });

    await expect(trigger).toBeDisabled();

    await userEvent.click(trigger);

    expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    label: "Fecha de inicio",
    value: null,
    error: "generic.required",
    touched: true,
  },
};

export const OnlyFutureDates: Story = {
  name: "Solo fechas futuras (>= hoy)",
  args: {
    label: "Fecha de la reserva",
    value: null,
    disablePast: true,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const StrictlyAfterToday: Story = {
  name: "Estrictamente posterior a hoy",
  args: {
    label: "Fecha de la reserva",
    value: null,
    disablePast: true,
    disableToday: true,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const OnlyPastDates: Story = {
  name: "Solo fechas pasadas (<= hoy)",
  args: {
    label: "Fecha del incidente",
    value: null,
    disableFuture: true,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const WeekendsDisabled: Story = {
  name: "Fines de semana deshabilitados",
  args: {
    label: "Fecha de la cita",
    value: null,
    disabledDates: isWeekend,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const SpecificDatesDisabled: Story = {
  name: "Fechas concretas deshabilitadas",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Los días 5, 12, 19 y 26 del mes actual están deshabilitados (por ejemplo, huecos ya reservados) mediante la prop `disabledDates`.",
      },
    },
  },
  args: {
    label: "Fecha de la cita",
    value: null,
    disabledDates: isDisabledDate,
    defaultOpen: true,
  },
};

export const WithIndicators: Story = {
  name: "Con indicadores y leyenda",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "La prop `indicators` marca días concretos con un punto de color y añade automáticamente su significado a la leyenda del calendario (por ejemplo, días con descuento o con alta demanda).",
      },
    },
  },
  args: {
    label: "Fecha de la reserva",
    value: null,
    defaultOpen: true,
    indicators: [
      { label: "Días con descuento", dates: discountDates, color: "var(--success-color)" },
      { label: "Alta demanda", dates: highDemandDates },
    ],
  },
};

export const WithIsoStrings: Story = {
  name: "Con fechas en texto (sin new Date)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          '`value`, `minDate`, `maxDate` y las fechas de `indicators` admiten directamente cadenas "YYYY-MM-DD", sin necesidad de construir un `new Date(...)`.',
      },
    },
  },
  args: {
    label: "Fecha del evento",
    value: "2026-07-15",
    minDate: "2026-07-01",
    maxDate: "2026-07-31",
    indicators: [
      { label: "Días con descuento", dates: ["2026-07-08", "2026-07-09", "2026-07-10", "2026-07-11"] },
    ],
    defaultOpen: true,
  },
};

export const MinMaxRange: Story = {
  name: "Con rango min/max",
  args: {
    label: "Fecha del evento",
    value: null,
    minDate: today,
    maxDate: new Date(today.getFullYear(), today.getMonth() + 1, 15),
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el calendario y selecciona un día habilitado.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog");
    const dayButtons = within(dialog).getAllByRole("gridcell");
    const enabledDay = dayButtons.find((btn) => !btn.hasAttribute("disabled"));
    expect(enabledDay).toBeDefined();

    await userEvent.click(enabledDay as HTMLElement);

    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const CloseOnEscape: Story = {
  name: "Escape cierra el calendario",
  parameters: {
    docs: {
      description: {
        story:
          "Escape cierra el calendario y devuelve el foco al campo sin importar qué control interno tenga el foco en ese momento (aquí, el botón de mes siguiente).",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog");
    const nextMonthButton = within(dialog).getByRole("button", {
      name: /mes siguiente/i,
    });
    nextMonthButton.focus();

    await userEvent.keyboard("{Escape}");

    expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const OpenWithKeyboard: Story = {
  name: "Interacción: abrir con teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: el trigger se puede abrir sin ratón con Enter (también funcionan Espacio, ArrowDown y ArrowUp). Una tecla sin significado especial no hace nada, y repetir la tecla mientras ya está abierto tampoco tiene efecto.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    trigger.focus();

    // Una tecla sin significado especial no abre el calendario
    await userEvent.keyboard("a");
    expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.keyboard("{Enter}");
    within(document.body).getByRole("dialog");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Ya abierto: handleTriggerKeyDown corta antes de nada (no duplica el panel);
    // el cierre que sigue proviene de la activación nativa del <button>, no de él.
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(within(document.body).queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const KeyboardNavigation: Story = {
  name: "Interacción: navegación y selección con teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el calendario abierto, el día activo puede navegarse con las flechas, Inicio/Fin y RePág/AvPág (que cambia de mes), y seleccionarse con Enter.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: new Date(today.getFullYear(), today.getMonth(), 15),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);

    const monthLabel = () =>
      within(document.body)
        .getByRole("dialog")
        .querySelector(".date-calendar__month-label") as HTMLElement;
    const initialMonthText = monthLabel().textContent;

    // Una tecla sin navegación asociada no provoca ningún cambio
    await userEvent.keyboard("z");

    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.keyboard("{Home}");
    await userEvent.keyboard("{End}");
    expect(monthLabel().textContent).toBe(initialMonthText);

    // RePág/AvPág cambian de mes mantieniendo el foco activo
    await userEvent.keyboard("{PageUp}");
    await waitFor(() =>
      expect(monthLabel().textContent).not.toBe(initialMonthText),
    );

    await userEvent.keyboard("{PageDown}");
    await waitFor(() =>
      expect(monthLabel().textContent).toBe(initialMonthText),
    );

    await userEvent.keyboard("{Enter}");

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const EscapeFromDayCell: Story = {
  name: "Interacción: Escape desde una celda del día",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el foco en una celda del calendario (no en los botones de mes), Escape también cierra el calendario y devuelve el foco al campo.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: today,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);
    within(document.body).getByRole("dialog");

    await userEvent.keyboard("{Escape}");

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const TabFromDayCell: Story = {
  name: "Interacción: Tab desde una celda del día",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: pulsar Tab con el foco en una celda del calendario cierra el panel sin devolver el foco al campo.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: today,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);
    within(document.body).getByRole("dialog");

    await userEvent.keyboard("{Tab}");

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
    await expect(trigger).not.toHaveFocus();
  },
};

export const ClickTriggerTogglesClosed: Story = {
  name: "Interacción: clic en el trigger abierto lo cierra",
  args: {
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);
    within(document.body).getByRole("dialog");

    await userEvent.click(trigger);

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
  },
};

export const OutsideClickCloses: Story = {
  name: "Interacción: clic fuera cierra el calendario",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic fuera del campo y del panel, el calendario se cierra sin devolver el foco al campo.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);
    within(document.body).getByRole("dialog");

    await userEvent.click(document.body);

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
    await expect(trigger).not.toHaveFocus();
  },
};

export const RepositionOnScrollResize: Story = {
  name: "Interacción: reposiciona en scroll/resize",
  parameters: { controls: { disable: true } },
  args: {
    label: "Fecha de inicio",
    value: null,
    defaultOpen: true,
  },
  play: async () => {
    within(document.body).getByRole("dialog");

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));

    // El panel sigue abierto tras recalcular su posición
    await expect(within(document.body).getByRole("dialog")).toBeInTheDocument();
  },
};

export const MonthNavigationClicks: Story = {
  name: "Interacción: navegar entre meses con las flechas del panel",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Prueba de interacción: los botones de mes anterior/siguiente cambian el mes visible. Si el día enfocado no existe en el nuevo mes (aquí, 31 de enero), se recorta al último día disponible.",
      },
    },
  },
  args: {
    label: "Fecha de inicio",
    value: new Date(2024, 0, 31),
    defaultOpen: true,
  },
  play: async () => {
    const monthLabel = () =>
      within(document.body)
        .getByRole("dialog")
        .querySelector(".date-calendar__month-label") as HTMLElement;
    const initialMonthText = monthLabel().textContent;

    const nextButton = within(document.body).getByRole("button", {
      name: /mes siguiente/i,
    });
    await userEvent.click(nextButton);
    await waitFor(() =>
      expect(monthLabel().textContent).not.toBe(initialMonthText),
    );

    const prevButton = within(document.body).getByRole("button", {
      name: /mes anterior/i,
    });
    await userEvent.click(prevButton);
    await waitFor(() => expect(monthLabel().textContent).toBe(initialMonthText));
  },
};

export const OpensUpwardWhenNoSpaceBelow: Story = {
  name: "Se abre hacia arriba cuando no hay espacio abajo",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Cuando el campo está cerca del borde inferior de la pantalla, el panel se abre hacia arriba en lugar de hacia abajo.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "flex-end",
          padding: 16,
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog") as HTMLElement;
    expect(dialog.style.top).toBe("");
    expect(dialog.style.bottom).not.toBe("");
  },
};

export const PanelUsesAriaLabelFallback: Story = {
  name: "Sin etiqueta visible: el panel usa el aria-label",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Cuando no hay `label` visible, el panel del calendario también usa `ariaLabel` como nombre accesible (igual que el trigger).",
      },
    },
  },
  args: {
    placeholder: "Selecciona una fecha",
    ariaLabel: "Fecha de nacimiento",
    value: null,
    defaultOpen: true,
  },
  play: async () => {
    const dialog = within(document.body).getByRole("dialog");
    await expect(dialog).toHaveAttribute("aria-label", "Fecha de nacimiento");
  },
};

export const WithoutExplicitId: Story = {
  name: "Sin id explícito (usa useId)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Sin `id`, el campo genera el suyo propio con `useId()` en vez de quedarse sin identificador.",
      },
    },
  },
  args: {
    id: undefined,
    label: "Fecha de inicio",
    value: null,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    expect(trigger.id).not.toBe("");
  },
};

export const WithClassName: Story = {
  name: "Con clase CSS adicional",
  parameters: { controls: { disable: true } },
  args: {
    label: "Fecha de inicio",
    value: null,
    className: "custom-date-picker",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fecha de inicio/i });
    expect(trigger.closest(".custom-date-picker")).not.toBeNull();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 280 }}
    >
      <DatePicker {...args} label="Normal" value={null} />
      <DatePicker {...args} label="Con valor" value={today} />
      <DatePicker {...args} label="Obligatorio" required value={null} />
      <DatePicker
        {...args}
        label="Con error"
        value={null}
        error="generic.required"
        touched
      />
      <DatePicker {...args} label="Deshabilitado" value={today} disabled />
    </div>
  ),
};
