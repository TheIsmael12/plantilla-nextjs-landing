import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { dateKey, isSameDay, isWithinRange } from "@/utils/dateUtils";

import DateCalendarMonth from "./DateCalendarMonth";

const today = new Date();
const YEAR = today.getFullYear();
const MONTH = today.getMonth();

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

// Ejemplo de fechas concretas deshabilitadas (festivos ya reservados, etc.)
const disabledDatesList = [5, 12, 19, 26].map((day) => new Date(YEAR, MONTH, day));
const isSpecificDateDisabled = (date: Date) =>
  disabledDatesList.some((disabledDate) => isSameDay(disabledDate, date));

const selectedDate = new Date(YEAR, MONTH, 15);
const rangeStart = new Date(YEAR, MONTH, 10);
const rangeEnd = new Date(YEAR, MONTH, 18);

const minDate = new Date(YEAR, MONTH, 10);
const maxDate = new Date(YEAR, MONTH, 20);

const noop = () => {};

const meta = {
  title: "UI/Inputs/DateCalendarMonth",
  component: DateCalendarMonth,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Rejilla de un único mes del calendario, subcomponente interno reutilizado por `DatePicker` (una rejilla) y `DateRangePicker` (dos rejillas, apoyándose en `isRangeStart`/`isRangeEnd`/`isInRange` para el resaltado de rango). No gestiona estado propio: toda la lógica de selección, foco y restricciones se recibe como props desde el componente que lo usa.",
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
    year: { control: "number", description: "Año del mes representado en la rejilla." },
    month: { control: "number", description: "Mes representado en la rejilla (0 = enero)." },
    locale: {
      control: "radio",
      options: ["es", "en"],
      description:
        "Locale usado para formatear el nombre del mes, los días de la semana y los aria-label de cada día.",
    },
    firstDayOfWeek: {
      control: "radio",
      options: [0, 1],
      description: "Primer día de la semana (0 = domingo, 1 = lunes).",
    },
    focusedDate: {
      control: false,
      description: "Fecha con foco de teclado actual, si la hay.",
    },
    gridLabelId: { control: false },
    isDisabled: {
      control: false,
      description: "Predicado que indica si un día está deshabilitado.",
    },
    isSelected: {
      control: false,
      description: "Predicado que indica si un día es la fecha seleccionada (DatePicker).",
    },
    isRangeStart: {
      control: false,
      description: "Predicado que indica si un día es el inicio de un rango (DateRangePicker).",
    },
    isRangeEnd: {
      control: false,
      description: "Predicado que indica si un día es el fin de un rango (DateRangePicker).",
    },
    isInRange: {
      control: false,
      description: "Predicado que indica si un día está dentro de un rango (DateRangePicker).",
    },
    getDayIndicatorColors: {
      control: false,
      description: "Devuelve los colores de los indicadores activos en un día.",
    },
    onSelectDay: { action: "selectDay" },
    onHoverDay: { action: "hoverDay" },
    onFocusDay: { action: "focusDay" },
    onKeyDownDay: { action: "keyDownDay" },
    registerDayRef: { control: false },
  },
  args: {
    year: YEAR,
    month: MONTH,
    locale: "es",
    firstDayOfWeek: 1,
    focusedDate: null,
    gridLabelId: "date-calendar-month-story-grid-label",
    isDisabled: (_date: Date): boolean => false,
    isSelected: (_date: Date): boolean => false,
    onSelectDay: fn(),
    onFocusDay: fn(),
    onKeyDownDay: fn(),
    registerDayRef: noop,
  },
} satisfies Meta<typeof DateCalendarMonth>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Mes simple",
};

export const WithSelectedDate: Story = {
  name: "Con fecha seleccionada",
  args: {
    isSelected: (date) => isSameDay(date, selectedDate),
    focusedDate: selectedDate,
  },
};

export const WithSelectedRange: Story = {
  name: "Con rango seleccionado",
  parameters: {
    docs: {
      description: {
        story:
          "Usa `isRangeStart`, `isRangeEnd` e `isInRange` (las mismas props que emplea `DateRangePicker`) para resaltar un rango de fechas dentro del mes.",
      },
    },
  },
  args: {
    isRangeStart: (date) => isSameDay(date, rangeStart),
    isRangeEnd: (date) => isSameDay(date, rangeEnd),
    isInRange: (date) => isWithinRange(date, rangeStart, rangeEnd),
    focusedDate: rangeStart,
  },
};

export const WithDisabledDates: Story = {
  name: "Con fechas deshabilitadas",
  parameters: {
    docs: {
      description: {
        story:
          "Combina fechas puntuales deshabilitadas (por ejemplo, huecos ya reservados: los días 5, 12, 19 y 26) con los fines de semana, mediante el predicado `isDisabled`.",
      },
    },
  },
  args: {
    isDisabled: (date) => isSpecificDateDisabled(date) || isWeekend(date),
  },
};

export const MinMaxBoundaries: Story = {
  name: "En los límites de un rango min/max",
  parameters: {
    docs: {
      description: {
        story:
          "Solo son seleccionables los días entre el 10 y el 20 del mes; el resto queda deshabilitado mediante `isDisabled`, igual que hacen `DatePicker`/`DateRangePicker` al combinar `minDate`/`maxDate`.",
      },
    },
  },
  args: {
    isDisabled: (date) => date.getTime() < minDate.getTime() || date.getTime() > maxDate.getTime(),
  },
};

export const SelectDayInteraction: Story = {
  name: "Interacción: seleccionar un día",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al hacer clic en un día habilitado se invoca `onSelectDay` con su fecha.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dayButtons = canvas.getAllByRole("gridcell");
    const enabledDay = dayButtons.find((btn) => !btn.hasAttribute("disabled"));
    expect(enabledDay).toBeDefined();

    await userEvent.click(enabledDay as HTMLElement);

    await expect(args.onSelectDay).toHaveBeenCalled();
  },
};

export const KeyDownOnDayInteraction: Story = {
  name: "Interacción: pulsar una tecla sobre un día",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al enfocar un día y pulsar una tecla (por ejemplo, una flecha) se invoca `onKeyDownDay` con el evento y su fecha; el componente delega toda la navegación por teclado en quien lo usa (`DatePicker`/`DateRangePicker`).",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const dayButtons = canvas.getAllByRole("gridcell");
    const enabledDay = dayButtons.find((btn) => !btn.hasAttribute("disabled"));
    expect(enabledDay).toBeDefined();

    (enabledDay as HTMLElement).focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect(args.onKeyDownDay).toHaveBeenCalled();
  },
};

export const DisabledDayNoInteraction: Story = {
  name: "Interacción: día deshabilitado no dispara onSelectDay",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: un día deshabilitado (aquí, el 12 del mes, parte de las fechas puntuales deshabilitadas) no responde al clic y `onSelectDay` nunca se invoca para él.",
      },
    },
  },
  args: {
    isDisabled: (date) => isSpecificDateDisabled(date) || isWeekend(date),
  },
  play: async ({ canvasElement, args }) => {
    const disabledDate = new Date(YEAR, MONTH, 12);
    const button = canvasElement.querySelector(
      `[data-date="${dateKey(disabledDate)}"]`,
    ) as HTMLButtonElement | null;
    expect(button).not.toBeNull();
    await expect(button).toBeDisabled();

    await userEvent.click(button as HTMLElement);

    await expect(args.onSelectDay).not.toHaveBeenCalled();
  },
};
