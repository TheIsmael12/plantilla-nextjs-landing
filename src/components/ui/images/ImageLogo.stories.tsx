import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import ImageLogo from "./ImageLogo";

const meta = {
  title: "UI/Images/ImageLogo",
  component: ImageLogo,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Logo de la aplicación, resuelto automáticamente entre las variantes clara y oscura según el tema activo (`next-themes`), salvo que `style` fuerce una variante concreta (`light`/`dark`). No recibe `width`/`height`: ocupa el 100% de su contenedor (`fill` + `object-fit: contain`), así que el tamaño real lo decide siempre el CSS del sitio de uso. Antes de montar en cliente muestra un placeholder vacío (`aria-hidden`) para evitar parpadeos de hidratación, ya que el tema resuelto solo se conoce en el navegador; ese estado transitorio no se puede fijar de forma estable en una story estática, por lo que no tiene un export propio.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["default", "small"],
      description:
        'Tamaño predefinido del logo: "default" estándar o "small" reducido.',
    },
    style: {
      control: "select",
      options: ["default", "light", "dark"],
      description:
        'Variante visual. "default" sigue el tema activo, "light" fuerza la versión clara, "dark" fuerza la versión oscura.',
    },
    alt: {
      control: "text",
      description: "Texto alternativo para accesibilidad.",
    },
    priority: {
      control: "boolean",
      description: "Si la imagen debe precargarse con prioridad (next/image).",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales aplicadas al contenedor del logo.",
    },
  },
  args: {
    alt: "App Logo",
    priority: true,
    size: "default",
    style: "default",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 120, height: 60 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ForceLight: Story = {
  name: "Forzar claro",
  args: {
    style: "light",
  },
};

export const ForceDark: Story = {
  name: "Forzar oscuro",
  args: {
    style: "dark",
  },
};

export const Small: Story = {
  name: "Pequeño",
  args: {
    size: "small",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 50, height: 50 }}>
        <Story />
      </div>
    ),
  ],
};

export const SmallForceLight: Story = {
  name: "Pequeño claro",
  args: {
    size: "small",
    style: "light",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 50, height: 50 }}>
        <Story />
      </div>
    ),
  ],
};

export const SmallForceDark: Story = {
  name: "Pequeño oscuro",
  args: {
    size: "small",
    style: "dark",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 50, height: 50 }}>
        <Story />
      </div>
    ),
  ],
};

export const AllVariants: Story = {
  name: "Todas las variantes",
  parameters: { controls: { disable: true } },
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ fontSize: 12, color: "var(--neutral-color)", marginBottom: 8 }}>
          Default (sigue tema)
        </p>
        <div style={{ width: 120, height: 60 }}>
          <ImageLogo size="default" style="default" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--neutral-color)", marginBottom: 8 }}>
          Forzar claro
        </p>
        <div style={{ width: 120, height: 60 }}>
          <ImageLogo size="default" style="light" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--neutral-color)", marginBottom: 8 }}>
          Forzar oscuro
        </p>
        <div style={{ width: 120, height: 60 }}>
          <ImageLogo size="default" style="dark" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--neutral-color)", marginBottom: 8 }}>
          Pequeño (sigue tema)
        </p>
        <div style={{ width: 50, height: 50 }}>
          <ImageLogo size="small" style="default" />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, color: "var(--neutral-color)", marginBottom: 8 }}>
          Pequeño oscuro
        </p>
        <div style={{ width: 50, height: 50 }}>
          <ImageLogo size="small" style="dark" />
        </div>
      </div>
    </div>
  ),
};
