import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Design System/Colors",
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Paleta de colores del sistema. Cambia entre tema Light y Dark con el selector de la barra superior.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface SwatchProps {
  cssVar: string;
  label: string;
  textColor?: string;
}

function Swatch({ cssVar, label, textColor }: SwatchProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
        minWidth: "120px",
        flex: "1 1 120px",
      }}
    >
      <div
        style={{
          height: "72px",
          borderRadius: "8px",
          background: `var(${cssVar})`,
          border: "1px solid rgba(0,0,0,0.08)",
        }}
      />
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          color: textColor ?? "var(--color)",
          fontFamily: "monospace",
          wordBreak: "break-all",
        }}
      >
        {cssVar}
      </span>
      <span
        style={{
          fontSize: "0.6875rem",
          color: "var(--neutral-color-active)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

interface GroupProps {
  title: string;
  swatches: SwatchProps[];
}

function ColorGroup({ title, swatches }: GroupProps) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3
        style={{
          margin: "0 0 1rem",
          fontSize: "0.875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--neutral-color-active)",
          paddingBottom: "0.5rem",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        {title}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {swatches.map((s) => (
          <Swatch key={s.cssVar} {...s} />
        ))}
      </div>
    </section>
  );
}

// ─── Color groups ─────────────────────────────────────────────────────────────

const COLOR_GROUPS: GroupProps[] = [
  {
    title: "Primary — Navy",
    swatches: [
      { cssVar: "--primary-color", label: "Base" },
      { cssVar: "--primary-color-hover", label: "Hover" },
      { cssVar: "--primary-color-active", label: "Active" },
    ],
  },
  {
    title: "Secondary",
    swatches: [
      { cssVar: "--secondary-color", label: "Base" },
      { cssVar: "--secondary-color-hover", label: "Hover" },
      { cssVar: "--secondary-color-active", label: "Active" },
    ],
  },
  {
    title: "Ternary — Rojo de marca",
    swatches: [
      { cssVar: "--ternary-color", label: "Base" },
      { cssVar: "--ternary-color-hover", label: "Hover" },
      { cssVar: "--ternary-color-active", label: "Active" },
      { cssVar: "--ternary-color-light", label: "Light" },
    ],
  },
  {
    title: "Foreground / Background",
    swatches: [
      { cssVar: "--color", label: "Color (texto)" },
      { cssVar: "--light-color", label: "Light" },
      { cssVar: "--dark-color", label: "Dark" },
      { cssVar: "--background-color", label: "Background" },
    ],
  },
  {
    title: "Border",
    swatches: [
      { cssVar: "--border-color", label: "Base" },
      { cssVar: "--border-color-active", label: "Active" },
    ],
  },
  {
    title: "Fill — Lime",
    swatches: [
      { cssVar: "--fill-color", label: "Base" },
      { cssVar: "--fill-color-hover", label: "Hover" },
      { cssVar: "--fill-color-active", label: "Active" },
    ],
  },
  {
    title: "Neutral",
    swatches: [
      { cssVar: "--neutral-color", label: "Base" },
      { cssVar: "--neutral-color", label: "Hover" },
      { cssVar: "--neutral-color-active", label: "Active" },
      { cssVar: "--neutral-color-light", label: "Light" },
    ],
  },
  {
    title: "Info",
    swatches: [
      { cssVar: "--info-color", label: "Base" },
      { cssVar: "--info-color-hover", label: "Hover" },
      { cssVar: "--info-color-active", label: "Active" },
      { cssVar: "--info-color-light", label: "Light" },
    ],
  },
  {
    title: "Success",
    swatches: [
      { cssVar: "--success-color", label: "Base" },
      { cssVar: "--success-color-hover", label: "Hover" },
      { cssVar: "--success-color-active", label: "Active" },
      { cssVar: "--success-color-light", label: "Light" },
    ],
  },
  {
    title: "Warning",
    swatches: [
      { cssVar: "--warning-color", label: "Base" },
      { cssVar: "--warning-color-hover", label: "Hover" },
      { cssVar: "--warning-color-active", label: "Active" },
      { cssVar: "--warning-color-light", label: "Light" },
    ],
  },
  {
    title: "Danger",
    swatches: [
      { cssVar: "--danger-color", label: "Base" },
      { cssVar: "--danger-color-hover", label: "Hover" },
      { cssVar: "--danger-color-active", label: "Active" },
      { cssVar: "--danger-color-light", label: "Light" },
    ],
  },
  {
    title: "Error",
    swatches: [
      { cssVar: "--error-color", label: "Base" },
      { cssVar: "--error-color-hover", label: "Hover" },
      { cssVar: "--error-color-active", label: "Active" },
      { cssVar: "--error-color-light", label: "Light" },
    ],
  },
];

// ─── Stories ──────────────────────────────────────────────────────────────────

export const Palette: Story = {
  name: "Paleta completa",
  render: () => (
    <div>
      {COLOR_GROUPS.map((group) => (
        <ColorGroup key={group.title} {...group} />
      ))}
    </div>
  ),
};

export const Primary: Story = {
  name: "Primary ",
  render: () => <ColorGroup {...COLOR_GROUPS[0]!} />,
};

export const Ternary: Story = {
  name: "Ternary — Rojo de marca",
  render: () => <ColorGroup {...COLOR_GROUPS[2]!} />,
};

export const Semantic: Story = {
  name: "Colores semánticos",
  render: () => (
    <div>
      {COLOR_GROUPS.slice(7).map((group) => (
        <ColorGroup key={group.title} {...group} />
      ))}
    </div>
  ),
};

export const ThemeComparison: Story = {
  name: "Tokens reactivos al tema",
  render: () => (
    <div>
      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--neutral-color-active)",
          marginBottom: "1.5rem",
        }}
      >
        Cambia entre Light y Dark en la barra superior para ver cómo reaccionan
        los tokens.
      </p>
      {[
        COLOR_GROUPS[0]!, // Primary
        COLOR_GROUPS[2]!, // Ternary
        COLOR_GROUPS[5]!, // Fill
        COLOR_GROUPS[6]!, // Neutral
        COLOR_GROUPS[7]!, // Info
      ].map((group) => (
        <ColorGroup key={group.title} {...group} />
      ))}
    </div>
  ),
};
