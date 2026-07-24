import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useTranslations } from "next-intl";

import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import TableHead from "./TableHead";

interface Person {
  id: string;
  name: string;
  email: string;
}

const DATA: Person[] = [
  { id: "1", name: "Ana García", email: "ana@example.com" },
  { id: "2", name: "Luis Pérez", email: "luis@example.com" },
];

/**
 * Envuelve `TableHead` con la instancia de TanStack Table que normalmente le
 * proporciona `Table`, para poder documentarlo de forma aislada. La columna
 * `email` deshabilita el orden (`enableSorting: false`) para poder mostrar,
 * en la misma tabla, una cabecera ordenable junto a una que no lo es.
 */
function TableHeadDemo({ initialSorting = [] }: { initialSorting?: SortingState }) {
  const t = useTranslations("Table");
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const columns: ColumnDef<Person>[] = [
    { accessorKey: "name", header: () => t("Columns.name") },
    {
      accessorKey: "email",
      header: () => t("Columns.email"),
      enableSorting: false,
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table's API intentionally returns non-memoizable functions; not memoizing here is expected.
  const table = useReactTable({
    data: DATA,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className="table">
      <TableHead table={table} />
    </table>
  );
}

const meta = {
  title: "UI/Tables/TableHead",
  component: TableHeadDemo,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Cabecera de `Table`: un `<th>` por columna visible, con botón de orden (flecha según `getIsSorted()`) cuando la columna lo permite. La columna `email` de esta demo tiene `enableSorting: false` para mostrar, a la vez, una cabecera ordenable (`name`) y una que no lo es.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    initialSorting: { control: false },
  },
} satisfies Meta<typeof TableHeadDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unsorted: Story = {
  name: "Sin ordenar",
};

export const SortedAscending: Story = {
  name: "Orden ascendente",
  args: { initialSorting: [{ id: "name", desc: false }] },
};

export const SortedDescending: Story = {
  name: "Orden descendente",
  args: { initialSorting: [{ id: "name", desc: true }] },
};
