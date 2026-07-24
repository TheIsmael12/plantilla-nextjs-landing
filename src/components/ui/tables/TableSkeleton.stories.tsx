import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import TableSkeleton from "./TableSkeleton";

const meta = {
  title: "UI/Tables/TableSkeleton",
  component: TableSkeleton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Placeholder de carga con la misma estructura visual que `Table` (barra de herramientas, cabecera y filas), pensado para los `fallback` de `Suspense` de las vistas de listado mientras `use()` resuelve la promesa de datos, en vez de un simple bloque rectangular sin relación con la forma real de la tabla.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    rows: {
      control: "number",
      description: "Número de filas de placeholder.",
    },
    columns: {
      control: "number",
      description: "Número de columnas de placeholder.",
    },
    showToolbar: {
      control: "boolean",
      description:
        "Si se muestra el placeholder de la barra de búsqueda/filtros.",
    },
  },
  args: {
    rows: 5,
    columns: 4,
    showToolbar: true,
  },
} satisfies Meta<typeof TableSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewRows: Story = {
  name: "Pocas filas",
  args: { rows: 2 },
};

export const ManyRows: Story = {
  name: "Muchas filas",
  args: { rows: 10 },
};

export const FewColumns: Story = {
  name: "Pocas columnas",
  args: { columns: 2 },
};

export const ManyColumns: Story = {
  name: "Muchas columnas",
  args: { columns: 8 },
};

export const WithoutToolbar: Story = {
  name: "Sin barra de herramientas",
  args: { showToolbar: false },
};
