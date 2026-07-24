import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import DateRangePicker from "./DateRangePicker";

const today = new Date();
const inTwoWeeks = new Date(today);
inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const dateSelector = (date: Date) =>
  `[data-date="${date.getFullYear()}-${date.getMonth()}-${date.getDate()}"]`;

// Ejemplo de fechas concretas deshabilitadas (festivos, huecos ya reservados, etc.)
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
  title: "UI/Inputs/DateRangePicker",
  component: DateRangePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Selector de rango de fechas (combobox que abre un panel con dos meses de calendario) para elegir inicio y fin en dos clics. Soporta restricciones de fechas (mínima/máxima, pasado/futuro/hoy, predicado de fechas concretas), límites de noches mínimas/máximas entre inicio y fin, e indicadores de color con leyenda. El panel se renderiza en un portal sobre `document.body` y es completamente operable por teclado (flechas para navegar entre días, Enter/Espacio para seleccionar, Escape para cerrar).",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ minWidth: 320, minHeight: 400 }}>
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
      description: "Texto mostrado cuando no hay rango seleccionado.",
    },
    value: {
      control: false,
      description:
        "Rango seleccionado actualmente (prop controlada). Cada fecha admite un `Date` o una cadena \"YYYY-MM-DD\".",
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
      description: "Muestra un botón para limpiar el rango seleccionado.",
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
      description: "Deshabilita también hoy.",
    },
    disabledDates: { control: false },
    indicators: { control: false },
    minNights: {
      control: "number",
      description: "Número mínimo de noches entre inicio y fin.",
    },
    maxNights: {
      control: "number",
      description: "Número máximo de noches entre inicio y fin.",
    },
    onChange: { action: "changed" },
    defaultOpen: {
      control: "boolean",
      description:
        "Estado inicial del calendario al montar. Solo pensado para demos/documentación.",
    },
  },
  args: {
    id: "date-range-picker-story",
    name: "date-range-picker-story",
    value: { startDate: null, endDate: null },
    onChange: fn(),
  },
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Fechas del viaje",
    placeholder: "Selecciona un rango de fechas",
    value: { startDate: null, endDate: null },
  },
};

export const WithValue: Story = {
  name: "Con valor",
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: inTwoWeeks },
  },
};

export const Required: Story = {
  name: "Obligatorio",
  args: {
    label: "Fechas de la reserva",
    value: { startDate: null, endDate: null },
    required: true,
  },
};

export const Clearable: Story = {
  name: "Con botón de limpiar",
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: inTwoWeeks },
    clearable: true,
  },
};

export const Disabled: Story = {
  name: "Deshabilitado",
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: inTwoWeeks },
    disabled: true,
    clearable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Aunque haya valor y `clearable`, un campo deshabilitado no muestra el botón de limpiar
    expect(canvas.queryByRole("button", { name: /borrar/i })).not.toBeInTheDocument();
  },
};

export const WithError: Story = {
  name: "Con error",
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
    error: "generic.required",
    touched: true,
  },
};

export const SmallSize: Story = {
  name: "Tamaño pequeño",
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: inTwoWeeks },
    size: "sm",
  },
};

export const OnlyFutureDates: Story = {
  name: "Solo fechas futuras",
  args: {
    label: "Fechas del vuelo",
    value: { startDate: null, endDate: null },
    disablePast: true,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const OnlyPastDates: Story = {
  name: "Solo fechas pasadas (<= hoy)",
  args: {
    label: "Fechas del histórico",
    value: { startDate: null, endDate: null },
    disableFuture: true,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const StrictlyAfterToday: Story = {
  name: "Estrictamente posterior a hoy",
  args: {
    label: "Fechas de la reserva",
    value: { startDate: null, endDate: null },
    disablePast: true,
    disableToday: true,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const MinMaxNights: Story = {
  name: "Con noches mín/máx",
  args: {
    label: "Fechas de la estancia",
    value: { startDate: null, endDate: null },
    disablePast: true,
    minNights: 2,
    maxNights: 14,
    defaultOpen: true,
  },
  parameters: { controls: { disable: true } },
};

export const WeekendsDisabled: Story = {
  name: "Fines de semana deshabilitados",
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
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
          "Los días 5, 12, 19 y 26 del mes actual están deshabilitados (por ejemplo, huecos ya reservados) mediante la prop `disabledDates`. No pueden elegirse ni como inicio ni como fin del rango.",
      },
    },
  },
  args: {
    label: "Fechas de la estancia",
    value: { startDate: null, endDate: null },
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
    label: "Fechas de la estancia",
    value: { startDate: null, endDate: null },
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
          '`value.startDate`/`value.endDate` admiten directamente cadenas "YYYY-MM-DD", sin necesidad de construir un `new Date(...)`.',
      },
    },
  },
  args: {
    label: "Fechas de la estancia",
    value: { startDate: "2026-07-10", endDate: "2026-07-18" },
    minDate: "2026-07-01",
    maxDate: "2026-07-31",
  },
};

export const RangeJumpsOverDisabledDate: Story = {
  name: "El rango salta una fecha deshabilitada (hueco visible)",
  parameters: {
    docs: {
      description: {
        story:
          "Si hay una fecha deshabilitada de por medio, el rango puede seleccionarse igualmente por encima de ella: el día deshabilitado se queda sin poder elegirse, pero se ve rayado dentro del tramo para dejar claro que es un hueco dentro del rango elegido.",
      },
    },
  },
  args: {
    label: "Fechas de la estancia",
    value: { startDate: null, endDate: null },
    disabledDates: (date) =>
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === 14,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", {
      name: /Fechas de la estancia/i,
    });
    await userEvent.click(trigger);

    const gapDate = new Date(today.getFullYear(), today.getMonth(), 14);
    const startDate = new Date(today.getFullYear(), today.getMonth(), 10);
    const endDate = new Date(today.getFullYear(), today.getMonth(), 18);

    const gapCell = document.body.querySelector(
      dateSelector(gapDate),
    ) as HTMLElement;
    await expect(gapCell).toBeDisabled();

    const startCell = document.body.querySelector(
      dateSelector(startDate),
    ) as HTMLElement;
    await userEvent.click(startCell);

    // El día posterior al hueco sigue eligible: el rango puede saltarlo
    const endCell = document.body.querySelector(
      dateSelector(endDate),
    ) as HTMLElement;
    await expect(endCell).not.toBeDisabled();
    await userEvent.hover(endCell);

    // Mientras se previsualiza el rango, el hueco se ve marcado dentro del tramo
    await expect(gapCell).toHaveClass("date-calendar__day--in-range");

    await userEvent.click(endCell);
    await expect(args.onChange).toHaveBeenCalledWith({ startDate, endDate });
  },
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el calendario, selecciona inicio y fin del rango.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog");
    const dayButtons = within(dialog)
      .getAllByRole("gridcell")
      .filter((btn) => !btn.hasAttribute("disabled"));

    const firstDay = dayButtons[10];
    const secondDay = dayButtons[15];
    expect(firstDay).toBeDefined();
    expect(secondDay).toBeDefined();

    await userEvent.click(firstDay as HTMLElement);
    await userEvent.click(secondDay as HTMLElement);

    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ClearInteraction: Story = {
  name: "Interacción: limpiar rango",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic en el botón de limpiar se invoca `onChange` con ambas fechas a `null` y el panel no se abre (el clic no debe propagarse al trigger).",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: inTwoWeeks },
    clearable: true,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const clearButton = canvas.getByRole("button", { name: /borrar/i });

    await userEvent.click(clearButton);

    await expect(args.onChange).toHaveBeenCalledWith({
      startDate: null,
      endDate: null,
    });

    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const DisabledNoInteraction: Story = {
  name: "Interacción: deshabilitado no abre el panel",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: un campo deshabilitado no responde al clic ni abre el panel de calendario.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: inTwoWeeks },
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });

    await expect(trigger).toBeDisabled();

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
  },
};

export const OpenWithKeyboard: Story = {
  name: "Interacción: abrir con teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: el trigger se puede abrir sin ratón, con Enter (también funcionan Espacio, ArrowDown y ArrowUp).",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    trigger.focus();

    // Una tecla sin significado especial no abre el panel
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

export const CloseOnEscape: Story = {
  name: "Interacción: Escape cierra el panel",
  parameters: {
    docs: {
      description: {
        story:
          "Escape cierra el panel y devuelve el foco al trigger sin importar qué control interno tenga el foco en ese momento (aquí, el botón de mes siguiente, no una celda de día).",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog");
    const nextMonthButton = within(dialog).getByRole("button", {
      name: /mes siguiente/i,
    });
    nextMonthButton.focus();

    await userEvent.keyboard("{Escape}");

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const MinMaxNightsInteraction: Story = {
  name: "Interacción: respeta noches mín/máx",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: tras elegir el inicio, los días demasiado cercanos (menos de `minNights`) o demasiado lejanos (más de `maxNights`) quedan deshabilitados y no pueden elegirse como fin.",
      },
    },
  },
  args: {
    label: "Fechas de la estancia",
    value: { startDate: null, endDate: null },
    minNights: 2,
    maxNights: 5,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", {
      name: /Fechas de la estancia/i,
    });
    await userEvent.click(trigger);

    const startDate = new Date(today.getFullYear(), today.getMonth(), 5);
    const tooClose = new Date(today.getFullYear(), today.getMonth(), 6); // 1 noche
    const validNear = new Date(today.getFullYear(), today.getMonth(), 7); // 2 noches
    const validFar = new Date(today.getFullYear(), today.getMonth(), 10); // 5 noches
    const tooFar = new Date(today.getFullYear(), today.getMonth(), 11); // 6 noches

    const startCell = document.body.querySelector(
      dateSelector(startDate),
    ) as HTMLElement;
    await userEvent.click(startCell);

    await waitFor(() =>
      expect(
        document.body.querySelector(dateSelector(tooClose)),
      ).toBeDisabled(),
    );
    expect(
      document.body.querySelector(dateSelector(validNear)),
    ).not.toBeDisabled();
    expect(
      document.body.querySelector(dateSelector(validFar)),
    ).not.toBeDisabled();
    expect(document.body.querySelector(dateSelector(tooFar))).toBeDisabled();

    const validNearCell = document.body.querySelector(
      dateSelector(validNear),
    ) as HTMLElement;
    await userEvent.click(validNearCell);

    await expect(args.onChange).toHaveBeenCalledWith({
      startDate,
      endDate: validNear,
    });
  },
};

export const RestartRangeOnEarlierClick: Story = {
  name: "Interacción: clic en fecha anterior reinicia el inicio",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: si tras elegir el inicio se hace clic en una fecha anterior a él, esa fecha pasa a ser el nuevo inicio en vez de interpretarse como fin del rango.",
      },
    },
  },
  args: {
    label: "Fechas de la estancia",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", {
      name: /Fechas de la estancia/i,
    });
    await userEvent.click(trigger);

    const firstClick = new Date(today.getFullYear(), today.getMonth(), 15);
    const earlierClick = new Date(today.getFullYear(), today.getMonth(), 10);
    const endClick = new Date(today.getFullYear(), today.getMonth(), 20);

    await userEvent.click(
      document.body.querySelector(dateSelector(firstClick)) as HTMLElement,
    );
    await userEvent.click(
      document.body.querySelector(dateSelector(earlierClick)) as HTMLElement,
    );
    await userEvent.click(
      document.body.querySelector(dateSelector(endClick)) as HTMLElement,
    );

    await expect(args.onChange).toHaveBeenCalledWith({
      startDate: earlierClick,
      endDate: endClick,
    });
  },
};

export const KeyboardNavigation: Story = {
  name: "Interacción: navegación y selección con teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: con el panel abierto, el día activo puede navegarse con las flechas, Inicio/Fin y RePág (que cambia de mes, permaneciendo visible mientras el foco esté en cualquiera de los dos meses mostrados), y seleccionarse con Enter.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await userEvent.click(trigger);

    const monthLabels = () =>
      Array.from(
        within(document.body)
          .getByRole("dialog")
          .querySelectorAll(".date-calendar__month-label"),
      ).map((el) => el.textContent);
    const initialLabels = monthLabels();

    // Una tecla sin navegación asociada no cambia nada
    await userEvent.keyboard("z");
    expect(monthLabels()).toEqual(initialLabels);

    await userEvent.keyboard("{ArrowRight}");
    await userEvent.keyboard("{ArrowLeft}");
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{ArrowUp}");
    await userEvent.keyboard("{Home}");
    await userEvent.keyboard("{End}");
    expect(monthLabels()).toEqual(initialLabels);

    // Un único RePág mueve el foco al mes siguiente, que ya es la segunda rejilla visible
    await userEvent.keyboard("{PageDown}");
    expect(monthLabels()).toEqual(initialLabels);

    // Un segundo RePág sale de ambos meses visibles: el panel se desplaza
    await userEvent.keyboard("{PageDown}");
    await waitFor(() => expect(monthLabels()).not.toEqual(initialLabels));

    // Enter selecciona el inicio del rango; el panel permanece abierto
    await userEvent.keyboard("{Enter}");
    within(document.body).getByRole("dialog");

    // Una segunda selección (fin del rango) sí cierra el panel e invoca onChange
    await userEvent.keyboard("{ArrowRight}");
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
          "Prueba de interacción: con el foco en una celda del calendario (no en los botones de mes), Escape también cierra el panel y devuelve el foco al campo.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
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
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
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
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await userEvent.click(trigger);
    within(document.body).getByRole("dialog");

    await userEvent.click(trigger);

    expect(
      within(document.body).queryByRole("dialog"),
    ).not.toBeInTheDocument();
  },
};

export const OutsideClickCloses: Story = {
  name: "Interacción: clic fuera cierra el panel",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic fuera del campo y del panel, este se cierra sin devolver el foco al campo.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
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
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
    defaultOpen: true,
  },
  play: async () => {
    within(document.body).getByRole("dialog");

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));

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
          "Prueba de interacción: los botones de mes anterior/siguiente cambian los dos meses visibles. Si el día enfocado no existe en el nuevo mes (aquí, 31 de enero), se recorta al último día disponible.",
      },
    },
  },
  args: {
    label: "Fechas de la estancia",
    value: { startDate: new Date(2024, 0, 31), endDate: null },
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

export const PanelOverflowRepositionsLeft: Story = {
  name: "El panel se reposiciona si se sale del viewport por la derecha",
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Cuando el campo está cerca del borde derecho de la pantalla, el panel (más ancho que el trigger, con dos meses) se desplaza hacia la izquierda para no salirse del viewport.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ display: "flex", justifyContent: "flex-end", padding: 16 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog") as HTMLElement;
    await waitFor(() => {
      const rect = dialog.getBoundingClientRect();
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth - 7);
    });
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
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    await userEvent.click(trigger);

    const dialog = within(document.body).getByRole("dialog") as HTMLElement;
    expect(dialog.style.top).toBe("");
    expect(dialog.style.bottom).not.toBe("");
  },
};

export const WithOnlyStartDate: Story = {
  name: "Con solo fecha de inicio elegida",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Mientras solo hay fecha de inicio (sin fin todavía), el valor mostrado usa puntos suspensivos en vez del rango completo.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: today, endDate: null },
  },
};

export const ClearableWithoutValue: Story = {
  name: "Con botón de limpiar sin valor (no se muestra)",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "Con `clearable` pero sin ninguna fecha elegida todavía (ni inicio ni fin), el botón de limpiar no se muestra.",
      },
    },
  },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
    clearable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(
      canvas.queryByRole("button", { name: /borrar/i }),
    ).not.toBeInTheDocument();
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
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    expect(trigger.id).not.toBe("");
  },
};

export const WithClassName: Story = {
  name: "Con clase CSS adicional",
  parameters: { controls: { disable: true } },
  args: {
    label: "Fechas del viaje",
    value: { startDate: null, endDate: null },
    className: "custom-date-range-picker",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: /Fechas del viaje/i });
    expect(trigger.closest(".custom-date-range-picker")).not.toBeNull();
  },
};

export const AllStates: Story = {
  name: "Todos los estados",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 24, width: 320 }}
    >
      <DateRangePicker
        {...args}
        label="Normal"
        value={{ startDate: null, endDate: null }}
      />
      <DateRangePicker
        {...args}
        label="Con valor"
        value={{ startDate: today, endDate: inTwoWeeks }}
      />
      <DateRangePicker
        {...args}
        label="Obligatorio"
        required
        value={{ startDate: null, endDate: null }}
      />
      <DateRangePicker
        {...args}
        label="Con error"
        value={{ startDate: null, endDate: null }}
        error="generic.required"
        touched
      />
      <DateRangePicker
        {...args}
        label="Deshabilitado"
        value={{ startDate: today, endDate: inTwoWeeks }}
        disabled
      />
    </div>
  ),
};
