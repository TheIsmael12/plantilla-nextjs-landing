import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { SearchXIcon } from "lucide-react";
import EmptyState from "./EmptyState";

const meta = {
  title: "UI/Errors/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Estado vacío genérico para listas o secciones sin contenido (por ejemplo, un listado filtrado sin resultados o una sección recién creada). Muestra un icono (por defecto `InboxIcon`), un título y una descripción opcionales, y un hueco para una acción (p. ej. un botón de creación). Todo el contenido es opcional: sin `title`, `description` ni `action` solo se muestra el icono.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Título breve del estado vacío.",
    },
    description: {
      control: "text",
      description:
        "Explicación adicional de por qué no hay contenido que mostrar.",
    },
    icon: {
      control: false,
      description:
        "Icono (componente `LucideIcon`) mostrado sobre el título; por defecto `InboxIcon`.",
    },
    action: {
      control: false,
      description:
        "Contenido opcional bajo la descripción, típicamente un botón de creación.",
    },
  },
  args: {
    title: "Sin resultados",
    description: "Todavía no hay nada que mostrar aquí.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  name: "Solo título",
  args: { description: undefined },
};

export const DescriptionOnly: Story = {
  name: "Solo descripción",
  args: { title: undefined },
};

export const IconOnly: Story = {
  name: "Solo icono",
  args: { title: undefined, description: undefined },
};

export const CustomIcon: Story = {
  name: "Con icono personalizado",
  args: {
    icon: SearchXIcon,
    title: "Sin coincidencias",
    description: "Prueba a cambiar los filtros de búsqueda.",
  },
};

const onCreateFirst = fn();

export const WithAction: Story = {
  name: "Con acción",
  args: {
    action: (
      <button
        type="button"
        className="btn btn--primary btn--md"
        onClick={onCreateFirst}
      >
        Crear el primero
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole("button", { name: "Crear el primero" });

    // La acción es un elemento operable por teclado dentro del estado vacío.
    await userEvent.tab();
    await expect(button).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await expect(onCreateFirst).toHaveBeenCalledTimes(1);
  },
};

export const AllVariants: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <EmptyState {...args} title="Con título y descripción" />
      <EmptyState {...args} title="Solo título" description={undefined} />
      <EmptyState
        {...args}
        title={undefined}
        description="Solo descripción"
      />
      <EmptyState
        {...args}
        icon={SearchXIcon}
        title="Con icono personalizado"
      />
      <EmptyState
        {...args}
        title="Con acción"
        action={
          <button type="button" className="btn btn--primary btn--md">
            Crear el primero
          </button>
        }
      />
    </div>
  ),
};
