import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Avatar from "./Avatar";

const meta = {
  title: "UI/Avatars/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Avatar de usuario: muestra la imagen si se recibe `src`/`image`, o en su defecto las iniciales del nombre.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Nombre del usuario, usado para las iniciales de respaldo y como `alt` por defecto.",
    },
    image: {
      control: "text",
      description: "URL de la imagen (alias de `src`).",
    },
    src: {
      control: "text",
      description: "URL de la imagen; tiene prioridad sobre `image`.",
    },
    alt: {
      control: "text",
      description: "Texto alternativo de la imagen.",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Tamaño del avatar.",
    },
    bordered: {
      control: "boolean",
      description: "Añade un borde alrededor del avatar.",
    },
  },
  args: {
    name: "Ismael Madrid",
    size: "md",
    bordered: false,
  },
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {
  name: "Con iniciales",
  args: {
    name: "Ismael Madrid",
  },
};

export const WithImage: Story = {
  name: "Con imagen",
  args: {
    name: "Ismael Madrid",
    src: "https://i.pravatar.cc/150?img=12",
  },
};

export const Bordered: Story = {
  name: "Con borde",
  args: {
    name: "Ismael Madrid",
    src: "https://i.pravatar.cc/150?img=12",
    bordered: true,
  },
};

export const Small: Story = {
  name: "Tamaño pequeño",
  args: { size: "sm" },
};

export const Large: Story = {
  name: "Tamaño grande",
  args: { size: "lg" },
};

export const AllSizes: Story = {
  name: "Todos los tamaños",
  parameters: { controls: { disable: true } },
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
};
