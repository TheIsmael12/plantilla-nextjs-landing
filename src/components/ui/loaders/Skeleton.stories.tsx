import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Loader2Icon } from "lucide-react";

import Skeleton from "./Skeleton";

const meta = {
  title: "UI/Loaders/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Placeholder de carga que ocupa el hueco del contenido real mientras este no está disponible, evitando saltos de layout (CLS) y comunicando visualmente que hay una petición en curso. Es puramente decorativo: se marca con `aria-hidden=\"true\"` para que los lectores de pantalla lo ignoren (el estado de carga real debe anunciarse aparte, por ejemplo con un `aria-live` en el contenedor, como en el ejemplo de tabla de usuarios).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["text", "circular", "rectangular"],
      description: "Forma del placeholder.",
    },
    width: {
      control: "text",
      description: "Ancho del placeholder (px si es number, cualquier unidad CSS si es string).",
    },
    height: {
      control: "text",
      description: "Alto del placeholder (px si es number, cualquier unidad CSS si es string).",
    },
    count: {
      control: "number",
      description: "Número de líneas repetidas, agrupadas con espaciado vertical.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales aplicadas al elemento raíz.",
    },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Línea de texto",
  args: { variant: "text", width: 240 },
};

export const MultipleLines: Story = {
  name: "Párrafo (varias líneas)",
  args: { variant: "text", count: 3 },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const Circular: Story = {
  name: "Circular (avatar)",
  args: { variant: "circular" },
};

export const Rectangular: Story = {
  name: "Rectangular (imagen o bloque)",
  args: { variant: "rectangular" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithCustomClassName: Story = {
  name: "Con clase CSS adicional",
  parameters: {
    docs: {
      description: {
        story:
          "`className` se añade a la clase base (`skeleton skeleton--<variant>`) para permitir ajustes puntuales (por ejemplo, márgenes) sin tocar el componente.",
      },
    },
  },
  args: { variant: "text", width: 200, className: "custom-margin-class" },
};

export const UserRow: Story = {
  name: "Fila de usuario (avatar + texto)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", maxWidth: 320 }}>
      <Skeleton variant="circular" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" count={2} />
      </div>
    </div>
  ),
};

export const ListItems: Story = {
  name: "Lista de elementos (avatar + texto, repetida)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        maxWidth: 360,
      }}
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" count={2} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const ContentCard: Story = {
  name: "Tarjeta de contenido (imagen + texto)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: 320,
      }}
    >
      <Skeleton variant="rectangular" height={160} />
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="text" width="60%" />
      </div>
      <Skeleton variant="text" count={2} />
    </div>
  ),
};

export const ProfileCard: Story = {
  name: "Tarjeta de perfil (avatar centrado)",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.75rem",
        maxWidth: 240,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <Skeleton variant="circular" width={72} height={72} />
      <Skeleton variant="text" width="70%" height={14} />
      <Skeleton variant="text" width="45%" height={11} />
    </div>
  ),
};

const USERS_COLUMNS = [
  "EMAIL",
  "NOMBRE",
  "APELLIDOS",
  "ESTADO",
  "ADMIN",
  "ÚLTIMO ACCESO",
  "CREADO",
  "ACCIONES",
];

export const UsersTableLoading: Story = {
  name: "Ejemplo: tabla de usuarios cargando",
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="table__container">
      <div className="table__state table__state--loading" style={{ padding: "0 0 0.5rem" }}>
        <Loader2Icon />
        Cargando usuarios...
      </div>

      <div className="table__scroll">
        <table className="table">
          <thead className="table__head">
            <tr>
              {USERS_COLUMNS.map((column) => (
                <th key={column}>
                  <div className="table__header">{column}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }, (_, row) => (
              <tr key={row}>
                {USERS_COLUMNS.map((column) => (
                  <td key={column}>
                    <Skeleton
                      variant="text"
                      width={column === "ADMIN" ? 48 : column === "ACCIONES" ? 24 : "80%"}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
