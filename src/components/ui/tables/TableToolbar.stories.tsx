"use client";

import type { ComponentProps } from "react";
import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Filter, FilterValues, TableAction } from "@/types/ui/tables/table";

import { PencilIcon, Trash2Icon } from "lucide-react";

import TableToolbar from "./TableToolbar";

interface Person {
  id: string;
  name: string;
}

const selectedRows: Person[] = [
  { id: "1", name: "Ana García" },
  { id: "2", name: "Luis Pérez" },
];

const actions: TableAction<Person>[] = [
  { key: "edit", label: "Editar", icon: PencilIcon, onClick: fn() },
  {
    key: "delete",
    label: "Eliminar",
    icon: Trash2Icon,
    variant: "danger",
    onClick: fn(),
  },
];

const filters: Filter[] = [
  {
    key: "role",
    type: "select",
    label: "Rol",
    placeholder: "Todos",
    options: [
      { value: "", label: "Todos" },
      { value: "admin", label: "Admin" },
      { value: "editor", label: "Editor" },
    ],
  },
];

const PersonToolbar = TableToolbar<Person>;

/** Envoltorio con estado local para búsqueda y filtros: `TableToolbar` no gestiona ningún estado propio, todo llega controlado desde `Table`. */
function ToolbarDemo(props: ComponentProps<typeof PersonToolbar>) {
  const [globalFilter, setGlobalFilter] = useState(props.globalFilter);
  const [filterValues, setFilterValues] = useState<FilterValues>(
    props.filterValues ?? {},
  );

  return (
    <PersonToolbar
      {...props}
      globalFilter={globalFilter}
      onSearchChange={setGlobalFilter}
      filterValues={filterValues}
      onFilterChange={(key, value) =>
        setFilterValues((prev) => ({ ...prev, [key]: value }))
      }
      onClearAll={
        props.filters
          ? () => setFilterValues({ role: "" })
          : undefined
      }
    />
  );
}

const meta = {
  title: "UI/Tables/TableToolbar",
  component: PersonToolbar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Barra de herramientas de `Table`: búsqueda global y filtros (`Filters`) a la izquierda, acciones masivas (`TableBulkActions`) a la derecha. No se renderiza nada si ninguna de las tres partes aplica (ni `searchable`, ni `filters`, ni `actions`).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    filters: { control: false },
    filterValues: { control: false },
    actions: { control: false },
    selectedRows: { control: false },
    onSearchChange: { action: "searchChange" },
    onFilterChange: { action: "filterChange" },
    onClearAll: { action: "clearAll" },
    onClearSelection: { action: "clearSelection" },
  },
  args: {
    searchable: false,
    globalFilter: "",
    onSearchChange: fn(),
    selectedRows: [],
    selectedCount: 0,
    onClearSelection: fn(),
  },
  render: (args) => <ToolbarDemo {...args} />,
} satisfies Meta<typeof PersonToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchOnly: Story = {
  name: "Solo búsqueda",
  args: { searchable: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByRole("searchbox");

    await userEvent.type(search, "ana");
    await expect(search).toHaveValue("ana");

    // Sin `filters` ni `actions`, no se monta ni el botón de filtros ni el de acciones
    expect(canvas.queryByRole("button", { name: "Filtros" })).not.toBeInTheDocument();
    expect(canvas.queryByRole("button", { name: /Acciones/i })).not.toBeInTheDocument();
  },
};

export const WithFilters: Story = {
  name: "Con filtros",
  args: { searchable: true, filters },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const filtersButton = canvas.getByRole("button", { name: "Filtros" });

    await userEvent.click(filtersButton);
    const panel = within(canvasElement).getByRole("dialog");
    const roleSelect = within(panel).getByRole("combobox", { name: "Rol" });
    await expect(roleSelect).toBeInTheDocument();

    // Elegir una opción atraviesa el `onFilterChange` de `TableToolbar`
    // (delega en el `onFilterChange` de `Table`) hasta `Filters`.
    await userEvent.click(roleSelect);
    const listbox = within(document.body).getByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "Admin" }));

    await expect(roleSelect).toHaveTextContent("Admin");
    await expect(filtersButton).toHaveTextContent("1");
  },
};

export const FiltersWithoutHandler: Story = {
  name: "Con filtros mostrados pero sin `onFilterChange`",
  parameters: {
    docs: {
      description: {
        story:
          "Si el llamador no pasa `onFilterChange` (opcional), `TableToolbar` sigue delegando en `Filters` con seguridad (encadenamiento opcional): elegir una opción no revienta, simplemente no notifica ningún cambio.",
      },
    },
  },
  render: () => (
    <PersonToolbar
      searchable={false}
      globalFilter=""
      onSearchChange={fn()}
      filters={filters}
      selectedRows={[]}
      selectedCount={0}
      onClearSelection={fn()}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const filtersButton = canvas.getByRole("button", { name: "Filtros" });

    await userEvent.click(filtersButton);
    const panel = within(canvasElement).getByRole("dialog");
    const roleSelect = within(panel).getByRole("combobox", { name: "Rol" });

    await userEvent.click(roleSelect);
    const listbox = within(document.body).getByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "Admin" }));

    // Sin `onFilterChange`, el valor no se propaga: el filtro se queda como estaba
    await expect(roleSelect).not.toHaveTextContent("Admin");
  },
};

export const WithBulkActions: Story = {
  name: "Con acciones masivas",
  args: {
    actions,
    selectedRows,
    selectedCount: selectedRows.length,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("2 seleccionadas")).toBeInTheDocument();

    const actionsTrigger = canvas.getByRole("button", { name: /Acciones/i });
    await userEvent.click(actionsTrigger);

    const menu = within(canvasElement).getByRole("menu");
    await expect(within(menu).getByRole("menuitem", { name: "Eliminar" })).toBeInTheDocument();
  },
};

export const AllCombined: Story = {
  name: "Búsqueda, filtros y acciones combinados",
  args: {
    searchable: true,
    filters,
    actions,
    selectedRows,
    selectedCount: selectedRows.length,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("searchbox")).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Filtros" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Acciones/i })).toBeInTheDocument();
    await expect(canvas.getByText("2 seleccionadas")).toBeInTheDocument();
  },
};

export const EmptyMinimal: Story = {
  name: "Vacío/mínimo (no renderiza nada)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `searchable`, `filters` ni `actions`, `TableToolbar` no renderiza ningún elemento: `Table` no monta la barra de herramientas en absoluto en ese caso.",
      },
    },
  },
  args: {
    searchable: false,
    filters: undefined,
    actions: undefined,
    selectedRows: [],
    selectedCount: 0,
  },
  play: async ({ canvasElement }) => {
    // `TableToolbar` devuelve `null`: no debe montarse ningún nodo `.table__toolbar`
    // (el canvas puede contener otros nodos globales ajenos al componente, p. ej.
    // el script de sincronización de tema de `next-themes`).
    expect(canvasElement.querySelector(".table__toolbar")).not.toBeInTheDocument();
  },
};
