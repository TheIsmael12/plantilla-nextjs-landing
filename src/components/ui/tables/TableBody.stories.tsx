import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";
import { useTranslations } from "next-intl";

import { type ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import TableBody from "./TableBody";
import TableHead from "./TableHead";

interface Person {
  id: string;
  name: string;
  email: string;
}

const DATA: Person[] = [
  { id: "1", name: "Ana García", email: "ana@example.com" },
  { id: "2", name: "Luis Pérez", email: "luis@example.com" },
  { id: "3", name: "Marta Ruiz", email: "marta@example.com" },
];

/**
 * Envuelve `TableBody` (junto con `TableHead`, para tener una tabla completa
 * y con sentido semántico) con la instancia de TanStack Table que
 * normalmente le proporciona `Table`, para poder documentarlo de forma
 * aislada.
 */
function TableBodyDemo({
  data = DATA,
  isLoading = false,
  emptyMessage,
  rowSelection,
}: {
  data?: Person[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowSelection?: Record<string, boolean>;
}) {
  const t = useTranslations("Table");

  const columns: ColumnDef<Person>[] = [
    { accessorKey: "name", header: () => t("Columns.name") },
    { accessorKey: "email", header: () => t("Columns.email") },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's API intentionally returns non-memoizable functions; not memoizing here is expected.
  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    state: rowSelection ? { rowSelection } : undefined,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="table">
      <TableHead table={table} />
      <TableBody
        table={table}
        columnCount={columns.length}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />
    </table>
  );
}

const meta = {
  title: "UI/Tables/TableBody",
  component: TableBodyDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Cuerpo de `Table`: estado de carga, estado vacío, o las filas reales con sus celdas renderizadas vía `flexRender`. `isLoading` y la ausencia de filas los resuelve el propio `TableBody`, no `Table`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: { control: false },
    isLoading: { control: "boolean" },
    emptyMessage: { control: false },
    rowSelection: { control: false },
  },
} satisfies Meta<typeof TableBodyDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Filas normales",
};

export const Loading: Story = {
  name: "Cargando",
  args: { isLoading: true },
};

export const Empty: Story = {
  name: "Sin resultados",
  args: { data: [] },
};

export const WithSelectedRow: Story = {
  name: "Con una fila seleccionada",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando la instancia de TanStack Table marca una fila como seleccionada, `TableBody` le añade la clase `table__row--selected`; el resto de filas la mantienen sin esa clase.",
      },
    },
  },
  args: { rowSelection: { "0": true } },
  play: async ({ canvasElement }) => {
    const rows = canvasElement.querySelectorAll("tbody tr");
    expect(rows[0]).toHaveClass("table__row--selected");
    expect(rows[1]).not.toHaveClass("table__row--selected");
  },
};
