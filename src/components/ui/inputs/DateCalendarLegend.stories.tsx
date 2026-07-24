import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import type { DateIndicator } from "@/types/ui/inputs/date-picker";

import DateCalendarLegend from "./DateCalendarLegend";

const DISCOUNT_INDICATOR: DateIndicator = {
  label: "Días con descuento",
  dates: [],
  color: "var(--success-color)",
};

const HIGH_DEMAND_INDICATOR: DateIndicator = {
  label: "Alta demanda",
  dates: [],
};

const meta = {
  title: "UI/Inputs/DateCalendarLegend",
  component: DateCalendarLegend,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Leyenda con el significado de cada color usado en `DateCalendarMonth` (hoy, seleccionado, no disponible), más opcionalmente los indicadores de color personalizados de `DatePicker`/`DateRangePicker` (`indicators`). Con `isRange` los textos se adaptan al modo rango (inicio/fin, dentro del rango) usado por `DateRangePicker`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    indicators: {
      control: false,
      description:
        "Indicadores de color a documentar en la leyenda, además de los estados base (hoy, seleccionado, deshabilitado); por defecto [].",
    },
    isRange: {
      control: "boolean",
      description:
        'Si es true, adapta los textos de la leyenda al modo rango (inicio/fin, dentro del rango) usado por DateRangePicker.',
    },
  },
  args: {},
} satisfies Meta<typeof DateCalendarLegend>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Estados base",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `indicators` ni `isRange`, la leyenda solo documenta los tres estados base del calendario de fecha única: hoy, seleccionado y no disponible.",
      },
    },
  },
};

export const WithIndicators: Story = {
  name: "Con indicadores personalizados",
  parameters: {
    docs: {
      description: {
        story:
          "Cada elemento de `indicators` añade una fila adicional con su color (o uno asignado por defecto según su posición, si no se indica `color`) y su etiqueta.",
      },
    },
  },
  args: {
    indicators: [DISCOUNT_INDICATOR, HIGH_DEMAND_INDICATOR],
  },
};

export const RangeMode: Story = {
  name: "Modo rango",
  parameters: {
    docs: {
      description: {
        story:
          'Con `isRange`, el segundo elemento pasa de "Seleccionado" a "Fecha de inicio/fin" y se añade un elemento adicional para "Rango seleccionado", como usa DateRangePicker.',
      },
    },
  },
  args: {
    isRange: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Fecha de inicio/fin")).toBeInTheDocument();
    await expect(canvas.getByText("Rango seleccionado")).toBeInTheDocument();
  },
};

export const RangeModeWithIndicators: Story = {
  name: "Modo rango con indicadores",
  args: {
    isRange: true,
    indicators: [DISCOUNT_INDICATOR],
  },
};
