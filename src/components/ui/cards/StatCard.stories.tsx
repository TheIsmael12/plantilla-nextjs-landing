import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AlertTriangleIcon, BanknoteIcon, FileTextIcon, WalletIcon } from "lucide-react";

import StatCard from "./StatCard";

const meta = {
  title: "UI/Cards/StatCard",
  component: StatCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Tarjeta de una única métrica (cuadros de estadísticas/reporting, p. ej. el informe de facturación): etiqueta, valor grande y descripción secundaria opcional, con una franja lateral que codifica la variante semántica — misma paleta que `Badge`. El componente no formatea números ni divisas: `value` llega ya formateado por el llamador.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 280 }}>
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Etiqueta corta de la métrica.",
    },
    value: {
      control: "text",
      description: "Valor ya formateado a mostrar en grande.",
    },
    description: {
      control: "text",
      description: "Texto secundario opcional bajo el valor.",
    },
    icon: {
      control: false,
      description: "Icono opcional mostrado junto a `label`.",
    },
    variant: {
      control: "select",
      options: ["neutral", "info", "success", "warning", "danger"],
      description: "Variante visual: colorea la franja lateral, misma paleta que `Badge`.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales para la raíz.",
    },
  },
  args: {
    label: "Total facturado",
    value: "12.450,00 €",
    description: "24 facturas",
    icon: FileTextIcon,
    variant: "neutral",
  },
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collected: Story = {
  name: "Cobrado (success)",
  args: {
    label: "Total cobrado",
    value: "9.230,00 €",
    description: "18 facturas pagadas",
    icon: WalletIcon,
    variant: "success",
  },
};

export const Overdue: Story = {
  name: "Vencido (danger)",
  args: {
    label: "Importe vencido",
    value: "1.120,00 €",
    description: "3 facturas",
    icon: AlertTriangleIcon,
    variant: "danger",
  },
};

export const Pending: Story = {
  name: "Pendiente (warning)",
  args: {
    label: "Pendiente de cobro",
    value: "3.220,00 €",
    description: "6 facturas",
    icon: BanknoteIcon,
    variant: "warning",
  },
};

export const WithoutDescription: Story = {
  name: "Sin descripción",
  args: {
    description: undefined,
  },
};

export const Grid: Story = {
  name: "Cuadro de estadísticas (varias tarjetas)",
  parameters: {
    docs: {
      description: {
        story:
          "Caso de uso real: varias `StatCard` en una grid, cada una con su propia variante semántica, formando el cuadro de estadísticas de un informe.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
      }}
    >
      <StatCard label="Total facturado" value="12.450,00 €" description="24 facturas" icon={FileTextIcon} />
      <StatCard
        label="Total cobrado"
        value="9.230,00 €"
        description="18 facturas pagadas"
        icon={WalletIcon}
        variant="success"
      />
      <StatCard
        label="Pendiente de cobro"
        value="3.220,00 €"
        description="6 facturas"
        icon={BanknoteIcon}
        variant="warning"
      />
      <StatCard
        label="Importe vencido"
        value="1.120,00 €"
        description="3 facturas"
        icon={AlertTriangleIcon}
        variant="danger"
      />
    </div>
  ),
};
