import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Skeleton from "@/components/ui/loaders/Skeleton";

import Spinner from "./Spinner";

const meta = {
  title: "UI/Loaders/Spinner",
  component: Spinner,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Spinners con temática de satélites/planetas orbitando, a juego con el dominio de la aplicación (inspirados en la técnica de animación de cssloaders.github.io, reimplementados con los tokens de color y las unidades del proyecto).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: [
        "orbit",
        "twin-orbit",
        "planet",
        "ring",
        "eclipse",
        "gyro",
        "track",
      ],
      description: "Estilo de la animación de carga.",
    },
    size: {
      control: "text",
      description: "Tamaño del spinner (font-size, admite cualquier unidad CSS).",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales aplicadas al elemento `<span>`.",
    },
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Orbit: Story = {
  name: "Órbita (satélite)",
  args: { variant: "orbit" },
};

export const TwinOrbit: Story = {
  name: "Órbita doble (dos satélites)",
  args: { variant: "twin-orbit" },
};

export const Planet: Story = {
  name: "Planeta girando",
  args: { variant: "planet" },
};

export const Ring: Story = {
  name: "Anillo orbital",
  args: { variant: "ring" },
};

export const Eclipse: Story = {
  name: "Eclipse (satélite + giro)",
  args: { variant: "eclipse" },
};

export const Gyro: Story = {
  name: "Giroscopio (anillos 3D)",
  args: { variant: "gyro" },
};

export const Track: Story = {
  name: "Satélite en el borde",
  args: { variant: "track" },
};

export const Large: Story = {
  name: "Tamaño grande",
  args: { variant: "orbit", size: "4rem" },
};

export const AllVariants: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: () => (
    // `eclipse` y `gyro` orbitan fuera de su propia caja (por diseño, igual
    // que el loader original): dejamos hueco de sobra entre columnas para
    // que no se solapen visualmente con la vecina.
    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
      {(
        [
          "orbit",
          "twin-orbit",
          "planet",
          "ring",
          "eclipse",
          "gyro",
          "track",
        ] as const
      ).map((variant) => (
        <div
          key={variant}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            minWidth: "6rem",
          }}
        >
          <Spinner variant={variant} size="2.5rem" />
          <span style={{ fontSize: "0.75rem", color: "var(--neutral-color-active)" }}>
            {variant}
          </span>
        </div>
      ))}
    </div>
  ),
};

export const WithSkeleton: Story = {
  name: "Combinado con Skeleton",
  parameters: { controls: { disable: true } },
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", maxWidth: 360 }}>
      <Spinner variant="orbit" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" count={2} />
      </div>
    </div>
  ),
};
