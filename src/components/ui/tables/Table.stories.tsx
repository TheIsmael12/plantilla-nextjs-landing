import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import type {
  ColumnDef,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

import type { FilterValues, TableAction } from "@/types/ui/tables/table";

import { PencilIcon, Trash2Icon } from "lucide-react";

import Table from "./Table";

interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
}

const DATA: Person[] = [
  { id: "1", name: "Ana García", email: "ana@example.com", role: "Admin", status: "active" },
  { id: "2", name: "Luis Pérez", email: "luis@example.com", role: "Editor", status: "active" },
  { id: "3", name: "Marta Ruiz", email: "marta@example.com", role: "Viewer", status: "inactive" },
  { id: "4", name: "Carlos Díaz", email: "carlos@example.com", role: "Editor", status: "active" },
  { id: "5", name: "Elena Soto", email: "elena@example.com", role: "Viewer", status: "inactive" },
  { id: "6", name: "Jorge Vidal", email: "jorge@example.com", role: "Admin", status: "active" },
  { id: "7", name: "Nuria Campos", email: "nuria@example.com", role: "Editor", status: "active" },
];

// Los headers son claves resueltas por `Table` vía `t(`Columns.${header}`)`
// contra el namespace `Table.Columns` (ver src/i18n/locales/{es,en}/table.json),
// no texto ya traducido: así se ejercita el mismo camino que un llamador real
// que pase headers como string en vez de una función `header: () => t(...)`.
const columns: ColumnDef<Person>[] = [
  { accessorKey: "name", header: "name" },
  { accessorKey: "email", header: "email" },
  { accessorKey: "role", header: "role" },
  {
    accessorKey: "status",
    header: "status",
    cell: ({ getValue }) =>
      getValue<Person["status"]>() === "active" ? "Activo" : "Inactivo",
  },
];

const MANY_DATA: Person[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  name: `Persona ${i + 1}`,
  email: `persona${i + 1}@example.com`,
  role: i % 3 === 0 ? "Admin" : i % 3 === 1 ? "Editor" : "Viewer",
  status: i % 2 === 0 ? "active" : "inactive",
}));

// A diferencia de `columns` (headers como string, resueltos por `Table` vía
// `t(`Columns.${header}`)`), esta columna adicional usa un `header` función:
// es el otro camino soportado por `Table` (el llamador ya renderiza/resuelve
// el contenido él mismo, sin pasar por el namespace de traducción).
const columnsWithFunctionHeader: ColumnDef<Person>[] = [
  ...columns,
  { id: "extra", header: () => "Extra", cell: () => null },
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

const PersonTable = Table<Person>;

const meta = {
  title: "UI/Tables/Table",
  component: PersonTable,
  parameters: {
    layout: "padded",
    // `Table` siempre monta sus hooks de estado interno (`usePagination`,
    // `useSorting`, `useFilters`), que a su vez usan el `useRouter` de
    // next-intl, aunque la story controle el estado por fuera: sin este mock
    // del app router de Next.js todas las stories fallan con "invariant
    // expected app router to be mounted".
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    data: { control: false },
    columns: { control: false },
    actions: { control: false },
  },
  args: {
    data: DATA,
    columns,
    getRowId: (row) => row.id,
  },
} satisfies Meta<typeof PersonTable>;

export default meta;
type Story = StoryObj<typeof meta>;

// `ManualServerDrivenDemo`/`PartiallyControlledSearchDemo` no son `PersonTable`:
// añaden props propias (los spies `on*ChangeSpy`, `controlGlobalFilter`,
// `controlPagination`) que no existen en `TableProps<Person>`, así que sus
// stories necesitan un `StoryObj` tipado contra el componente de `render`,
// no contra `meta` (ligado a `PersonTable`).
type ManualServerDrivenStory = StoryObj<Meta<typeof ManualServerDrivenDemo>>;
type PartiallyControlledSearchStory = StoryObj<
  Meta<typeof PartiallyControlledSearchDemo>
>;

export const Default: Story = {};

export const Selectable: Story = {
  name: "Con selección de filas",
  args: { selectable: true, className: "table--demo" },
};

export const WithActions: Story = {
  name: "Con selección y acciones",
  args: { selectable: true, actions },
};

export const SingleSelect: Story = {
  name: "Selección única (multiSelect: false)",
  args: { selectable: true, multiSelect: false, actions },
};

export const SmallPageSize: Story = {
  name: "Paginación (2 filas por página)",
  args: { initialPageSize: 2 },
};

export const Searchable: Story = {
  name: "Con buscador",
  args: { searchable: true, selectable: true, actions, onSearchChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const searchInput = canvas.getByRole("searchbox", { name: /buscar/i });

    await userEvent.type(searchInput, "a");
    await expect(args.onSearchChange).toHaveBeenCalledWith("a");

    const rowCheckboxes = canvas.getAllByRole("checkbox", {
      name: /seleccionar fila/i,
    });
    await userEvent.click(rowCheckboxes[0] as HTMLElement);
    await expect(canvas.getByText(/1 seleccionada/i)).toBeInTheDocument();

    await userEvent.click(
      canvas.getByRole("button", { name: /limpiar selección/i }),
    );
    await expect(
      canvas.queryByText(/1 seleccionada/i),
    ).not.toBeInTheDocument();
  },
};

export const SearchClearInteraction: Story = {
  name: "Interacción: limpiar la búsqueda",
  parameters: {
    docs: {
      description: {
        story:
          "Arranca con `q=ana` ya en la URL (`parameters.nextjs.navigation.query`) para que el campo tenga un valor inicial real: como el mock del router de Storybook no refleja `router.replace` en `useSearchParams()`, es la única forma fiable de observar la transición \"con texto → vacío\" y ejercitar la rama de `handleSearchChange` que borra el parámetro de búsqueda.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/", query: { q: "ana" } },
    },
  },
  args: { searchable: true, onSearchChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole("searchbox", { name: /buscar/i });

    await expect(searchInput).toHaveValue("ana");

    fireEvent.change(searchInput, { target: { value: "" } });

    await expect(args.onSearchChange).toHaveBeenCalledWith("");
  },
};

export const SortingInteraction: Story = {
  name: "Interacción: ordenar por columna",
  args: { onSortingChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const nameHeader = canvas.getByRole("button", { name: /nombre/i });

    await userEvent.click(nameHeader);

    await expect(args.onSortingChange).toHaveBeenCalledWith([
      { id: "name", desc: false },
    ]);
  },
};

export const ManyPages: Story = {
  name: "Paginación numerada (muchas páginas)",
  args: {
    data: MANY_DATA,
    initialPageSize: 3,
    searchable: true,
    onPaginationChange: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const nextButton = canvas.getByRole("button", {
      name: /página siguiente/i,
    });

    await userEvent.click(nextButton);

    await expect(args.onPaginationChange).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 3,
    });
  },
};

export const ManualPaginationWithoutRowCount: Story = {
  name: "Paginación manual sin `rowCount` (fallback defensivo)",
  parameters: {
    docs: {
      description: {
        story:
          "`rowCount` es obligatorio en la práctica cuando `manualPagination` es `true` (para calcular el número de páginas), pero si el llamador lo omite `Table` no rompe: usa 0 como total de registros en vez de `undefined`.",
      },
    },
  },
  args: { manualPagination: true },
};

export const CustomHeaderRenderer: Story = {
  name: "Columna con header como función",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando `column.header` no es un string, `Table` lo deja tal cual (el llamador ya lo resuelve/renderiza él mismo) en vez de buscarlo en el namespace `Table.Columns`.",
      },
    },
  },
  args: { columns: columnsWithFunctionHeader },
};

/** Envoltorio con estado local: `filters` siempre está controlado por el llamador, sin fallback interno. */
function FiltersDemo(args: React.ComponentProps<typeof PersonTable>) {
  const [filterValues, setFilterValues] = useState<FilterValues>({
    role: "",
    status: [],
  });

  return (
    <PersonTable
      {...args}
      filters={[
        {
          key: "role",
          type: "select",
          label: "Rol",
          options: [
            { value: "", label: "Todos" },
            { value: "Admin", label: "Admin" },
            { value: "Editor", label: "Editor" },
            { value: "Viewer", label: "Viewer" },
          ],
        },
        {
          key: "status",
          type: "multi-select",
          label: "Estado",
          options: [
            { value: "active", label: "Activo" },
            { value: "inactive", label: "Inactivo" },
          ],
        },
      ]}
      filterValues={filterValues}
      onFilterChange={(key, value) =>
        setFilterValues((prev) => ({ ...prev, [key]: value }))
      }
      onClearAll={() => setFilterValues({ role: "", status: [] })}
    />
  );
}

export const WithFilters: Story = {
  name: "Con filtros (select + multi-select)",
  args: { searchable: true },
  render: (args) => <FiltersDemo {...args} />,
};

/**
 * Envoltorio "modo servidor": paginación, orden y búsqueda quedan
 * controlados por el llamador (un `useState` local hace de API real), como
 * cuando `Table` delega en refetch vía `manualPagination`/`manualSorting`/
 * `manualFiltering`. A diferencia de las stories no controladas (donde el
 * estado interno depende del mock de `next/navigation`, que no refleja
 * cambios reales de una interacción a la siguiente), aquí cada callback
 * actualiza estado de verdad, así que las interacciones se pueden encadenar
 * (avanzar página y después volver atrás, ordenar y volver a ordenar...).
 */
function ManualServerDrivenDemo({
  onPaginationChangeSpy,
  onSortingChangeSpy,
  onSearchChangeSpy,
  ...args
}: React.ComponentProps<typeof PersonTable> & {
  onPaginationChangeSpy?: (pagination: PaginationState) => void;
  onSortingChangeSpy?: (sorting: SortingState) => void;
  onSearchChangeSpy?: (value: string) => void;
}) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 3,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  return (
    <PersonTable
      {...args}
      manualPagination
      manualSorting
      manualFiltering
      rowCount={MANY_DATA.length}
      data={MANY_DATA.slice(
        pagination.pageIndex * pagination.pageSize,
        pagination.pageIndex * pagination.pageSize + pagination.pageSize,
      )}
      pagination={pagination}
      onPaginationChange={(next) => {
        onPaginationChangeSpy?.(next);
        setPagination(next);
      }}
      sorting={sorting}
      onSortingChange={(next) => {
        onSortingChangeSpy?.(next);
        setSorting(next);
      }}
      searchable
      globalFilter={globalFilter}
      onSearchChange={(value) => {
        onSearchChangeSpy?.(value);
        setGlobalFilter(value);
      }}
    />
  );
}

export const ManualServerDriven: ManualServerDrivenStory = {
  name: "Interacción: modo servidor (paginación + orden + búsqueda controlados)",
  parameters: {
    docs: {
      description: {
        story:
          "Con `manualPagination`/`manualSorting`/`manualFiltering` y todo el estado controlado por el llamador, `Table` nunca ordena/pagina/filtra `data`: solo refleja el estado recibido y notifica cada cambio vía `onPaginationChange`/`onSortingChange`/`onSearchChange`.",
      },
    },
  },
  args: {
    onPaginationChangeSpy: fn(),
    onSortingChangeSpy: fn(),
    onSearchChangeSpy: fn(),
  },
  render: (args) => <ManualServerDrivenDemo {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const nameHeader = canvas.getByRole("button", { name: /nombre/i });

    await userEvent.click(nameHeader);
    await expect(args.onSortingChangeSpy).toHaveBeenCalledWith([
      { id: "name", desc: false },
    ]);

    await userEvent.click(nameHeader);
    await expect(args.onSortingChangeSpy).toHaveBeenCalledWith([
      { id: "name", desc: true },
    ]);

    const nextButton = canvas.getByRole("button", {
      name: /página siguiente/i,
    });
    const previousButton = canvas.getByRole("button", {
      name: /página anterior/i,
    });
    const firstButton = canvas.getByRole("button", { name: /primera página/i });
    const lastButton = canvas.getByRole("button", { name: /última página/i });

    await userEvent.click(nextButton);
    await expect(args.onPaginationChangeSpy).toHaveBeenCalledWith({
      pageIndex: 1,
      pageSize: 3,
    });

    await userEvent.click(previousButton);
    await expect(args.onPaginationChangeSpy).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 3,
    });

    await userEvent.click(lastButton);
    const lastPageIndex = Math.ceil(MANY_DATA.length / 3) - 1;
    await expect(args.onPaginationChangeSpy).toHaveBeenCalledWith({
      pageIndex: lastPageIndex,
      pageSize: 3,
    });

    await userEvent.click(firstButton);
    await expect(args.onPaginationChangeSpy).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 3,
    });

    await userEvent.click(
      canvas.getByRole("button", { name: "Ir a la página 3" }),
    );
    await expect(args.onPaginationChangeSpy).toHaveBeenCalledWith({
      pageIndex: 2,
      pageSize: 3,
    });

    const pageSizeSelect = canvas.getByRole("combobox", {
      name: /filas por página/i,
    });
    await userEvent.click(pageSizeSelect);
    const listbox = within(document.body).getByRole("listbox");
    await userEvent.click(within(listbox).getByRole("option", { name: "10" }));
    await expect(args.onPaginationChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ pageSize: 10 }),
    );

    const searchInput = canvas.getByRole("searchbox", { name: /buscar/i });
    await userEvent.type(searchInput, "persona 1");
    await expect(args.onSearchChangeSpy).toHaveBeenLastCalledWith("persona 1");
  },
};

/**
 * Combina búsqueda y paginación con solo UNA de las dos controlada
 * externamente (la otra queda gestionada por los hooks internos de
 * `Table`), para ejercitar las dos ramas de `handleSearchChange` que
 * comprueban cada prop por separado.
 */
function PartiallyControlledSearchDemo({
  controlGlobalFilter,
  controlPagination,
  onSearchChangeSpy,
  ...args
}: React.ComponentProps<typeof PersonTable> & {
  controlGlobalFilter: boolean;
  controlPagination: boolean;
  onSearchChangeSpy: (value: string) => void;
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  return (
    <PersonTable
      {...args}
      searchable
      globalFilter={controlGlobalFilter ? globalFilter : undefined}
      pagination={controlPagination ? pagination : undefined}
      onSearchChange={(value) => {
        onSearchChangeSpy(value);
        if (controlGlobalFilter) setGlobalFilter(value);
      }}
      onPaginationChange={(next) => {
        if (controlPagination) setPagination(next);
      }}
    />
  );
}

export const SearchWithControlledPaginationOnly: PartiallyControlledSearchStory = {
  name: "Interacción: búsqueda interna + paginación controlada",
  parameters: {
    docs: {
      description: {
        story:
          "Solo la paginación está controlada externamente; la búsqueda sigue gestionada por el hook interno de `Table` (rama `else` de `handleSearchChange`, con el lado de la paginación ya controlado pero el de la búsqueda no).",
      },
    },
  },
  args: { onSearchChangeSpy: fn() },
  render: (args) => (
    <PartiallyControlledSearchDemo
      {...args}
      controlGlobalFilter={false}
      controlPagination={true}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole("searchbox", { name: /buscar/i });

    await userEvent.type(searchInput, "a");

    await expect(args.onSearchChangeSpy).toHaveBeenCalled();
  },
};

export const SearchWithControlledFilterOnly: PartiallyControlledSearchStory = {
  name: "Interacción: búsqueda controlada + paginación interna",
  parameters: {
    docs: {
      description: {
        story:
          "Solo la búsqueda está controlada externamente; la paginación sigue gestionada por el hook interno de `Table` (rama `else` de `handleSearchChange`, con el lado de la búsqueda ya controlado pero el de la paginación no).",
      },
    },
  },
  args: { onSearchChangeSpy: fn() },
  render: (args) => (
    <PartiallyControlledSearchDemo
      {...args}
      controlGlobalFilter={true}
      controlPagination={false}
    />
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole("searchbox", { name: /buscar/i });

    await userEvent.type(searchInput, "a");

    await expect(args.onSearchChangeSpy).toHaveBeenCalled();
  },
};

export const Empty: Story = {
  name: "Sin resultados",
  args: { data: [] },
};

export const Loading: Story = {
  name: "Cargando",
  args: { isLoading: true },
};
