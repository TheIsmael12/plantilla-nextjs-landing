import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fireEvent, fn, userEvent, within } from "storybook/test";

import type { RowAction } from "@/types/ui/tables/table";

import { CopyIcon, PencilIcon, Trash2Icon } from "lucide-react";

import RowActionsMenu from "./RowActionsMenu";

const actions: RowAction[] = [
  { key: "edit", label: "Editar", icon: PencilIcon, onClick: fn() },
  { key: "duplicate", label: "Duplicar", icon: CopyIcon, onClick: fn() },
  {
    key: "delete",
    label: "Eliminar",
    icon: Trash2Icon,
    variant: "danger",
    onClick: fn(),
  },
];

const meta = {
  title: "UI/Tables/RowActionsMenu",
  component: RowActionsMenu,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Desplegable de acciones sobre una única fila de tabla (editar, duplicar, eliminar...), pensado para tablas sin selección (§3.4 requisitos.md); cuando la tabla sí tiene selección, las acciones masivas se gestionan con `TableAction`/`Table`, no con este componente. El menú se renderiza en un portal a `document.body`, posicionado con coordenadas fijas calculadas a partir del botón disparador, para no quedar recortado por el `overflow-x: auto` de `.table__scroll`. Sigue el patrón ARIA `menu`/`menuitem` completo: foco atrapado dentro del menú, navegación con flechas/Home/End que salta las acciones deshabilitadas, cierre con Escape (devolviendo el foco al disparador), y cierre al hacer clic fuera o al hacer scroll/resize. Reutiliza las clases `table__actions__menu`/`__item` que también usa la barra de acciones masivas de `Table`.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    actions: {
      control: false,
      description:
        "Acciones disponibles para la fila. Cada `RowAction` tiene `key`, `label`, `icon` opcional, `variant: \"danger\"` opcional y `onClick`. Las que llevan `disabled` se muestran pero no reciben foco ni disparan `onClick`.",
    },
    ariaLabel: {
      control: "text",
      description:
        "Nombre accesible del botón disparador (icono sin texto visible); obligatorio para que sea utilizable con lectores de pantalla.",
    },
  },
  args: {
    actions,
    ariaLabel: "Acciones de la fila",
  },
} satisfies Meta<typeof RowActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutIcons: Story = {
  name: "Sin iconos",
  parameters: {
    docs: {
      description: {
        story:
          "El icono de cada acción es opcional: sin `icon`, el ítem del menú solo muestra su `label`.",
      },
    },
  },
  args: {
    actions: [
      { key: "edit", label: "Editar", onClick: fn() },
      { key: "duplicate", label: "Duplicar", onClick: fn() },
      { key: "delete", label: "Eliminar", variant: "danger", onClick: fn() },
    ],
  },
};

export const WithDisabledAction: Story = {
  name: "Con una acción deshabilitada",
  args: {
    actions: [
      { key: "edit", label: "Editar", icon: PencilIcon, onClick: fn() },
      {
        key: "duplicate",
        label: "Duplicar",
        icon: CopyIcon,
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
};

export const AllDisabled: Story = {
  name: "Todas las acciones deshabilitadas",
  parameters: {
    docs: {
      description: {
        story:
          "Con todas las acciones deshabilitadas el menú sigue pudiendo abrirse, pero no hay ninguna acción habilitada a la que llevar el foco automáticamente.",
      },
    },
  },
  args: {
    actions: [
      { key: "edit", label: "Editar", icon: PencilIcon, disabled: true, onClick: fn() },
      { key: "duplicate", label: "Duplicar", icon: CopyIcon, disabled: true, onClick: fn() },
      {
        key: "delete",
        label: "Eliminar",
        icon: Trash2Icon,
        variant: "danger",
        disabled: true,
        onClick: fn(),
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Acciones de la fila",
    });

    await userEvent.click(trigger);

    const menu = within(document.body).getByRole("menu");
    await expect(menu).toBeInTheDocument();

    // Sin ninguna acción habilitada no hay ítem al que llevar el foco
    // automáticamente; las flechas de navegación tampoco hacen nada (no
    // revientan sobre una lista vacía de índices habilitados).
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
};

export const NoActions: Story = {
  name: "Sin acciones",
  parameters: {
    docs: {
      description: {
        story:
          "Con `actions` vacío el menú se abre igualmente, pero como una lista sin ítems (caso límite; en la práctica no debería mostrarse el disparador si no hay ninguna acción).",
      },
    },
  },
  args: {
    actions: [],
  },
};

export const InTableRow: Story = {
  name: "Contexto real (fila de tabla)",
  parameters: {
    docs: {
      description: {
        story:
          "Ejemplo de cómo se ve dentro de una fila real: alineado a la derecha, junto al resto de columnas.",
      },
    },
  },
  render: (args) => (
    <table className="table" style={{ width: "100%", maxWidth: "32rem" }}>
      <tbody>
        <tr>
          <td>Ana García</td>
          <td>ana@example.com</td>
          <td style={{ textAlign: "right" }}>
            <RowActionsMenu {...args} />
          </td>
        </tr>
      </tbody>
    </table>
  ),
};

export const Interactive: Story = {
  name: "Interacción real",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: abre el menú con clic, selecciona una acción (se invoca su `onClick` y el menú se cierra) y comprueba que Escape también cierra el menú devolviendo el foco al disparador.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Acciones de la fila",
    });

    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    const menu = within(document.body).getByRole("menu");
    const editItem = within(menu).getByRole("menuitem", { name: "Editar" });

    await userEvent.click(editItem);

    await expect(args.actions[0]?.onClick).toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(document.body).queryByRole("menu")).not.toBeInTheDocument();

    // Reabrir y cerrar con Escape, devolviendo el foco al disparador
    await userEvent.click(trigger);
    expect(within(document.body).getByRole("menu")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toHaveFocus();
    expect(within(document.body).queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const KeyboardNavigation: Story = {
  name: "Interacción: navegación con teclado salta las deshabilitadas",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: al abrir el menú el foco recae en la primera acción habilitada; las flechas y `Home`/`End` navegan saltando directamente la acción deshabilitada, y `Enter` activa el ítem enfocado.",
      },
    },
  },
  args: {
    actions: [
      { key: "edit", label: "Editar", icon: PencilIcon, onClick: fn() },
      {
        key: "duplicate",
        label: "Duplicar",
        icon: CopyIcon,
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
    const trigger = canvas.getByRole("button", {
      name: "Acciones de la fila",
    });

    await userEvent.click(trigger);

    const menu = within(document.body).getByRole("menu");
    const editItem = within(menu).getByRole("menuitem", { name: "Editar" });
    const deleteItem = within(menu).getByRole("menuitem", { name: "Eliminar" });

    await expect(editItem).toHaveFocus();

    await userEvent.keyboard("{ArrowDown}");
    await expect(deleteItem).toHaveFocus();

    await userEvent.keyboard("{ArrowUp}");
    await expect(editItem).toHaveFocus();

    await userEvent.keyboard("{End}");
    await expect(deleteItem).toHaveFocus();

    await userEvent.keyboard("{Home}");
    await expect(editItem).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(args.actions[0]?.onClick).toHaveBeenCalled();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const TabTrapInteraction: Story = {
  name: "Interacción: Tab atrapa el foco dentro del menú",
  parameters: {
    docs: {
      description: {
        story:
          "Prueba de interacción: dentro del menú, `Tab`/`Shift+Tab` no escapan al resto de la página (donde vive el portal), sino que recorren los ítems en bucle.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Acciones de la fila",
    });

    await userEvent.click(trigger);

    const menu = within(document.body).getByRole("menu");
    const editItem = within(menu).getByRole("menuitem", { name: "Editar" });
    const duplicateItem = within(menu).getByRole("menuitem", {
      name: "Duplicar",
    });
    const deleteItem = within(menu).getByRole("menuitem", { name: "Eliminar" });

    await expect(editItem).toHaveFocus();

    await userEvent.keyboard("{Tab}");
    await expect(duplicateItem).toHaveFocus();

    await userEvent.keyboard("{Tab}");
    await expect(deleteItem).toHaveFocus();

    // Tab en el último ítem vuelve al primero (bucle) en vez de escapar del menú
    await userEvent.keyboard("{Tab}");
    await expect(editItem).toHaveFocus();

    // Shift+Tab en el primero retrocede hasta el último
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect(deleteItem).toHaveFocus();
  },
};

export const OutsideClickInteraction: Story = {
  name: "Interacción: clic fuera cierra el menú",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Acciones de la fila",
    });

    await userEvent.click(trigger);
    await expect(within(document.body).getByRole("menu")).toBeInTheDocument();

    await userEvent.click(document.body);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(document.body).queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const ViewportChangeInteraction: Story = {
  name: "Interacción: scroll o resize cierran el menú",
  parameters: {
    docs: {
      description: {
        story:
          "El menú se cierra en cuanto se hace scroll o se redimensiona la ventana, en vez de reposicionarse: más simple y evita jank.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: "Acciones de la fila",
    });

    await userEvent.click(trigger);
    await expect(within(document.body).getByRole("menu")).toBeInTheDocument();

    fireEvent.scroll(window);

    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(within(document.body).queryByRole("menu")).not.toBeInTheDocument();
  },
};
