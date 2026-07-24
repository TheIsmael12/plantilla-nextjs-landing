"use client";

import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Filter, FilterValues } from "@/types/ui/tables/table";

import Filters from "./Filters";

const selectFilter: Filter = {
  key: "role",
  type: "select",
  label: "Rol",
  placeholder: "Todos",
  options: [
    { value: "", label: "Todos" },
    { value: "admin", label: "Admin" },
    { value: "editor", label: "Editor" },
    { value: "viewer", label: "Viewer" },
  ],
};

const multiSelectFilter: Filter = {
  key: "status",
  type: "multi-select",
  label: "Estado",
  options: [
    { value: "active", label: "Activo" },
    { value: "inactive", label: "Inactivo" },
    { value: "pending", label: "Pendiente" },
  ],
};

const dateFilter: Filter = {
  key: "createdAt",
  type: "date",
  label: "Creado el",
};

const dateRangeFilter: Filter = {
  key: "period",
  type: "date-range",
  label: "Periodo",
};

/** Envoltorio con estado local: `Filters` siempre está controlado por el llamador, sin fallback interno. */
function FiltersStory({
  filters,
  initialValues,
  clearedValues,
  onClearAll,
}: {
  filters: Filter[];
  initialValues: FilterValues;
  clearedValues?: FilterValues;
  onClearAll?: () => void;
}) {
  const [values, setValues] = useState<FilterValues>(initialValues);

  return (
    <Filters
      filters={filters}
      values={values}
      onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
      onClearAll={
        onClearAll
          ? () => {
              onClearAll();
              setValues(clearedValues ?? initialValues);
            }
          : undefined
      }
    />
  );
}

const meta = {
  title: "UI/Tables/Filters",
  component: Filters,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Botón "Filtros" de la barra de herramientas de `Table` (a la izquierda del buscador): despliega un panel con un control por cada filtro (`Select`, `CheckboxGroup`, `DatePicker` o `DateRangePicker` según su `type`). Siempre controlado por el llamador. El panel usa `useFocusTrap` (Tab/Shift+Tab no se escapan del desplegable, Escape lo cierra) además del botón de cierre explícito.',
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    filters: { control: false },
    values: { control: false },
    onChange: { action: "change" },
    onClearAll: { action: "clearAll" },
  },
  args: {
    filters: [],
    values: {},
    onChange: fn(),
  },
} satisfies Meta<typeof Filters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoFilters: Story = {
  name: "Sin filtros",
  parameters: {
    docs: {
      description: {
        story:
          'Con `filters` vacío el botón se muestra igualmente (en la práctica, `Table` decide si monta `Filters` según si `filters` tiene elementos), pero el panel no muestra ningún control.',
      },
    },
  },
  args: { filters: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filtros" });
    await userEvent.click(trigger);

    const panel = within(canvasElement).getByRole("dialog");
    expect(within(panel).queryByRole("combobox")).not.toBeInTheDocument();
    expect(within(panel).queryByRole("group")).not.toBeInTheDocument();
  },
};

export const SelectFilter: Story = {
  name: "Filtro select",
  render: () => <FiltersStory filters={[selectFilter]} initialValues={{ role: "" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filtros" });
    await userEvent.click(trigger);

    const panel = within(canvasElement).getByRole("dialog");
    const roleSelect = within(panel).getByRole("combobox", { name: "Rol" });
    await expect(roleSelect).toBeInTheDocument();

    // Elegir una opción invoca el `onChange` del filtro y actualiza el
    // contador de filtros activos del botón disparador.
    await userEvent.click(roleSelect);
    const listbox = within(document.body).getByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "Admin" }));

    await expect(roleSelect).toHaveTextContent("Admin");
    await expect(trigger).toHaveTextContent("1");
  },
};

export const MultiSelectFilter: Story = {
  name: "Filtro multi-select",
  render: () => <FiltersStory filters={[multiSelectFilter]} initialValues={{}} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filtros" });
    await userEvent.click(trigger);

    const panel = within(canvasElement).getByRole("dialog");
    const group = within(panel).getByRole("group", { name: "Estado" });
    await expect(group).toBeInTheDocument();

    // Sin valor inicial para "status" el filtro arranca sin nada marcado;
    // marcar una opción invoca el `onChange` del filtro con el nuevo array.
    const activeCheckbox = within(group).getByRole("checkbox", { name: "Activo" });
    await expect(activeCheckbox).not.toBeChecked();

    await userEvent.click(activeCheckbox);

    await expect(activeCheckbox).toBeChecked();
    await expect(trigger).toHaveTextContent("1");
  },
};

export const DateFilter: Story = {
  name: "Filtro de fecha",
  render: () => (
    <FiltersStory filters={[dateFilter]} initialValues={{ createdAt: null }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filtros" });
    await userEvent.click(trigger);

    const panel = within(canvasElement).getByRole("dialog");
    const dateCombobox = within(panel).getByRole("combobox", { name: "Creado el" });
    await expect(dateCombobox).toBeInTheDocument();

    // Elegir un día invoca el `onChange` del filtro con la fecha elegida y
    // actualiza el contador de filtros activos del botón disparador.
    await userEvent.click(dateCombobox);
    const calendar = within(document.body).getByRole("dialog", { name: "Creado el" });
    const dayButtons = within(calendar).getAllByRole("gridcell");
    const enabledDay = dayButtons.find((btn) => !btn.hasAttribute("disabled"));
    expect(enabledDay).toBeDefined();

    await userEvent.click(enabledDay as HTMLElement);

    await expect(trigger).toHaveTextContent("1");
  },
};

export const DateRangeFilter: Story = {
  name: "Filtro de rango de fechas",
  render: () => <FiltersStory filters={[dateRangeFilter]} initialValues={{}} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filtros" });
    await userEvent.click(trigger);

    const panel = within(canvasElement).getByRole("dialog");
    const rangeCombobox = within(panel).getByRole("combobox", { name: "Periodo" });
    await expect(rangeCombobox).toBeInTheDocument();

    // Sin valor inicial para "period" el rango arranca vacío; elegir inicio y
    // fin invoca el `onChange` del filtro con el rango completo.
    await userEvent.click(rangeCombobox);
    const calendar = within(document.body).getByRole("dialog", { name: "Periodo" });
    const dayButtons = within(calendar)
      .getAllByRole("gridcell")
      .filter((btn) => !btn.hasAttribute("disabled"));
    const startDay = dayButtons[0];
    const endDay = dayButtons[5];
    expect(startDay).toBeDefined();
    expect(endDay).toBeDefined();

    await userEvent.click(startDay as HTMLElement);
    await userEvent.click(endDay as HTMLElement);

    await expect(trigger).toHaveTextContent("1");
  },
};

export const MultipleFilters: Story = {
  name: "Varios filtros combinados",
  render: () => (
    <FiltersStory
      filters={[selectFilter, multiSelectFilter, dateFilter, dateRangeFilter]}
      initialValues={{
        role: "editor",
        status: ["active"],
        createdAt: null,
        period: { startDate: null, endDate: null },
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Filtros/ });
    await userEvent.click(trigger);

    // Con "role" y "status" ya activos, el contador del botón marca 2
    await expect(trigger).toHaveTextContent("2");

    const panel = within(canvasElement).getByRole("dialog");
    await expect(within(panel).getByRole("combobox", { name: "Rol" })).toBeInTheDocument();
    await expect(within(panel).getByRole("group", { name: "Estado" })).toBeInTheDocument();
    await expect(
      within(panel).getByRole("combobox", { name: "Creado el" }),
    ).toBeInTheDocument();
    await expect(
      within(panel).getByRole("combobox", { name: "Periodo" }),
    ).toBeInTheDocument();
  },
};

export const ClearAllInteraction: Story = {
  name: "Interacción: limpiar todos los filtros",
  render: () => {
    const onClearAll = fn();
    return (
      <FiltersStory
        filters={[selectFilter, multiSelectFilter]}
        initialValues={{ role: "editor", status: ["active"] }}
        clearedValues={{ role: "", status: [] }}
        onClearAll={onClearAll}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Filtros/ });
    await userEvent.click(trigger);

    const panel = within(canvasElement).getByRole("dialog");
    const clearButton = within(panel).getByRole("button", { name: /Limpiar filtros/i });
    await expect(clearButton).toBeInTheDocument();

    await userEvent.click(clearButton);

    // Tras limpiar, ya no quedan filtros activos: desaparece el botón de limpiar
    await expect(
      within(panel).queryByRole("button", { name: /Limpiar filtros/i }),
    ).not.toBeInTheDocument();
    await expect(trigger).not.toHaveTextContent("2");
  },
};

export const CloseButtonInteraction: Story = {
  name: "Interacción: cerrar el panel con el botón explícito",
  render: () => <FiltersStory filters={[selectFilter]} initialValues={{ role: "" }} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Filtros" });

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = within(canvasElement).getByRole("dialog");
    const closeButton = within(panel).getByRole("button", { name: "Cerrar filtros" });

    await userEvent.click(closeButton);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
