import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { TableAction } from "@/types/ui/tables/table";

import { ArchiveIcon, CheckIcon, PencilIcon, Trash2Icon } from "lucide-react";

import TableBulkActions from "./TableBulkActions";

interface Person {
  id: string;
  name: string;
}

const selectedRows: Person[] = [
  { id: "1", name: "Ana García" },
  { id: "2", name: "Luis Pérez" },
];

const actions: TableAction<Person>[] = [
  { key: "activate", label: "Activar", icon: CheckIcon, onClick: fn() },
  { key: "edit", label: "Editar", icon: PencilIcon, onClick: fn() },
  {
    key: "delete",
    label: "Eliminar",
    icon: Trash2Icon,
    variant: "danger",
    onClick: fn(),
  },
];

const PersonBulkActions = TableBulkActions<Person>;

const meta = {
  title: "UI/Tables/TableBulkActions",
  component: PersonBulkActions,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Contador de filas seleccionadas + menú desplegable de acciones masivas de `Table` (a la derecha de la barra de herramientas), montado solo cuando `Table` recibe `actions`. Gestiona su propio estado de apertura del menú: nada fuera de este componente depende de si está abierto.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    actions: {
      control: false,
      description:
        "Acciones masivas disponibles. Cada `TableAction` tiene `key`, `label`, `icon` opcional, `variant: \"danger\"` opcional, `disabled` opcional y `onClick(rows)`.",
    },
    selectedRows: { control: false },
    selectedCount: { control: "number" },
    onClearSelection: { action: "clearSelection" },
  },
  args: {
    actions,
    selectedRows,
    selectedCount: selectedRows.length,
    onClearSelection: fn(),
  },
} satisfies Meta<typeof PersonBulkActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoSelection: Story = {
  name: "Sin selección",
  parameters: {
    docs: {
      description: {
        story:
          "Con `selectedCount: 0` no se muestra el contador de selección y el disparador de acciones queda deshabilitado (aunque el menú siga pudiendo montarse).",
      },
    },
  },
  args: {
    selectedRows: [],
    selectedCount: 0,
  },
};

export const WithSelection: Story = {
  name: "Con filas seleccionadas y varias acciones",
  args: {
    selectedRows,
    selectedCount: selectedRows.length,
  },
};

export const DangerAction: Story = {
  name: "Con una acción de peligro",
  parameters: {
    docs: {
      description: {
        story:
          "La acción con `variant: \"danger\"` (aquí \"Eliminar\") se pinta con el color semántico de peligro dentro del menú de acciones masivas.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Acciones/i });
    await userEvent.click(trigger);

    const menu = within(canvasElement).getByRole("menu");
    const deleteItem = within(menu).getByRole("menuitem", { name: "Eliminar" });
    await expect(deleteItem).toHaveClass("table__actions__item--danger");
  },
};

export const DisabledAction: Story = {
  name: "Con una acción deshabilitada",
  parameters: {
    docs: {
      description: {
        story:
          "Una acción con `disabled: true` se muestra en el menú pero no puede activarse.",
      },
    },
  },
  args: {
    actions: [
      { key: "activate", label: "Activar", icon: CheckIcon, onClick: fn() },
      {
        key: "archive",
        label: "Archivar",
        icon: ArchiveIcon,
        disabled: true,
        onClick: fn(),
      },
      {
        key: "delete",
        label: "Eliminar",
        icon: Trash2Icon,
        variant: "danger",
        onClick: fn(),
      },
    ],
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Acciones/i });
    await userEvent.click(trigger);

    const menu = within(canvasElement).getByRole("menu");
    const archiveItem = within(menu).getByRole("menuitem", { name: "Archivar" });
    await expect(archiveItem).toBeDisabled();

    await userEvent.click(archiveItem);
    await expect(args.actions[1]?.onClick).not.toHaveBeenCalled();
  },
};

export const ClearSelectionInteraction: Story = {
  name: "Interacción: limpiar selección",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const clearButton = canvas.getByRole("button", { name: "Limpiar selección" });

    await userEvent.click(clearButton);
    await expect(args.onClearSelection).toHaveBeenCalled();
  },
};

export const OutsideClickInteraction: Story = {
  name: "Interacción: clic fuera cierra el menú de acciones",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Acciones/i });

    await userEvent.click(trigger);
    await expect(within(canvasElement).getByRole("menu")).toBeInTheDocument();

    await userEvent.click(document.body);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(canvasElement).queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const ActionClickInteraction: Story = {
  name: "Interacción: pulsar una acción la invoca con las filas seleccionadas",
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /Acciones/i });
    await userEvent.click(trigger);

    const menu = within(canvasElement).getByRole("menu");
    const editItem = within(menu).getByRole("menuitem", { name: "Editar" });

    await userEvent.click(editItem);

    await expect(args.actions[1]?.onClick).toHaveBeenCalledWith(selectedRows);
    // Tras pulsar una acción el menú se cierra
    expect(within(canvasElement).queryByRole("menu")).not.toBeInTheDocument();
  },
};
