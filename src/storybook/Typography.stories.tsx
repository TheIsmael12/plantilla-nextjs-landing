import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";

const meta = {
  title: "Design System/Typography",
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Sistema tipográfico del proyecto: familias tipográficas, headings, escala de tamaños y pesos. Dos fuentes distintas, cargadas vía `next/font/google` en `app/[locale]/layout.tsx` (nunca hardcodeadas en SCSS, ver §14 requisitos.md): **Poppins** para h1-h6 (`--font-heading`) y **Open Sans** para el resto del texto (`--font-body`).",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Font families ─────────────────────────────────────────────────────────────

interface FontFamilyShowcaseProps {
  cssVar: string;
  name: string;
  usage: string;
  weights: string;
  sampleStyle: CSSProperties;
}

function FontFamilyShowcase({
  cssVar,
  name,
  usage,
  weights,
  sampleStyle,
}: FontFamilyShowcaseProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "0.25rem",
        }}
      >
        <span style={{ fontSize: "1rem", fontWeight: 700 }}>{name}</span>
        <code
          style={{
            fontSize: "0.75rem",
            fontFamily: "monospace",
            color: "var(--neutral-color-active)",
            background: "var(--neutral-color-light)",
            padding: "0.125rem 0.5rem",
            borderRadius: "4px",
          }}
        >
          var({cssVar})
        </code>
      </div>
      <p
        style={{
          fontSize: "0.8125rem",
          color: "var(--neutral-color-active)",
          margin: "0 0 1.25rem",
        }}
      >
        {usage} · pesos cargados: {weights}
      </p>
      <p style={{ ...sampleStyle, margin: "0 0 0.5rem" }}>
        El veloz murciélago hindú comía feliz cardillo y kiwi
      </p>
      <p style={{ ...sampleStyle, fontSize: "1.25rem", margin: 0 }}>
        ABCDEFGHIJKLM abcdefghijklm 0123456789
      </p>
    </div>
  );
}

export const FontFamilies: Story = {
  name: "Familias tipográficas",
  parameters: {
    docs: {
      description: {
        story:
          "Si esta story se ve con la tipografía por defecto del sistema (Segoe UI/system-ui) en vez de con las formas redondeadas de Poppins y Open Sans, es que `--font-heading`/`--font-body` no se están resolviendo — revisa que `.storybook/preview.tsx` cargue las mismas fuentes que `app/[locale]/layout.tsx` vía `next/font/google`.",
      },
    },
  },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      <FontFamilyShowcase
        cssVar="--font-heading"
        name="Poppins — Headings (h1–h6)"
        usage="$font-family-heading"
        weights="500, 600, 700"
        sampleStyle={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.875rem",
          fontWeight: 700,
        }}
      />
      <FontFamilyShowcase
        cssVar="--font-body"
        name="Open Sans — Texto general"
        usage="$font-family-base"
        weights="400 (normal), 500, 600, 700"
        sampleStyle={{
          fontFamily: "var(--font-body)",
          fontSize: "1.125rem",
          fontWeight: 400,
        }}
      />
    </div>
  ),
};

// ─── Headings ────────────────────────────────────────────────────────────────

export const Headings: Story = {
  name: "Headings H1–H6",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {[
        { tag: "h1", label: "H1", size: "1.875rem / 30px — text-3xl" },
        { tag: "h2", label: "H2", size: "1.5rem / 24px — text-2xl" },
        { tag: "h3", label: "H3", size: "1.25rem / 20px — text-xl" },
        { tag: "h4", label: "H4", size: "1.125rem / 18px — text-lg" },
        { tag: "h5", label: "H5", size: "0.875rem / 14px — text-sm" },
        { tag: "h6", label: "H6", size: "0.75rem / 12px — text-xs" },
      ].map(({ tag: Tag, label, size }) => (
        <div
          key={Tag}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "1.5rem",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "1rem",
          }}
        >
          <span
            style={{
              minWidth: "3rem",
              fontSize: "0.75rem",
              color: "var(--neutral-color-active)",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {label}
          </span>
          {/* @ts-expect-error dynamic tag */}
          <Tag style={{ margin: 0 }}>El veloz murciélago hindú</Tag>
          <span
            style={{
              marginLeft: "auto",
              fontSize: "0.75rem",
              color: "var(--neutral-color-active)",
              whiteSpace: "nowrap",
            }}
          >
            {size}
          </span>
        </div>
      ))}
    </div>
  ),
};

// ─── Text size scale ──────────────────────────────────────────────────────────

const TEXT_SCALE = [
  { token: "$text-xxs", rem: "0.625rem", px: "10px" },
  { token: "$text-xs", rem: "0.75rem", px: "12px" },
  { token: "$text-sm", rem: "0.875rem", px: "14px" },
  { token: "$text-base", rem: "1rem", px: "16px" },
  { token: "$text-lg", rem: "1.125rem", px: "18px" },
  { token: "$text-xl", rem: "1.25rem", px: "20px" },
  { token: "$text-2xl", rem: "1.5rem", px: "24px" },
  { token: "$text-3xl", rem: "1.875rem", px: "30px" },
  { token: "$text-4xl", rem: "2.25rem", px: "36px" },
  { token: "$text-5xl", rem: "3rem", px: "48px" },
  { token: "$text-6xl", rem: "3.75rem", px: "60px" },
  { token: "$text-7xl", rem: "4.5rem", px: "72px" },
  { token: "$text-8xl", rem: "6rem", px: "96px" },
  { token: "$text-9xl", rem: "8rem", px: "128px" },
];

export const FontSizes: Story = {
  name: "Escala de tamaños",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", overflowX: "auto" }}>
      {TEXT_SCALE.map(({ token, rem, px }) => (
        <div
          key={token}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "1rem",
          }}
        >
          <span
            style={{
              minWidth: "9rem",
              fontSize: "0.75rem",
              color: "var(--neutral-color-active)",
              fontFamily: "monospace",
              flexShrink: 0,
            }}
          >
            {token}
          </span>
          <span
            style={{
              minWidth: "5rem",
              fontSize: "0.75rem",
              color: "var(--neutral-color-active)",
              flexShrink: 0,
            }}
          >
            {rem} / {px}
          </span>
          <span style={{ fontSize: rem, lineHeight: 1.2, whiteSpace: "nowrap" }}>
            Aa
          </span>
        </div>
      ))}
    </div>
  ),
};

// ─── Font weights ─────────────────────────────────────────────────────────────

const WEIGHTS = [
  { label: "Light", token: "300", scss: "$font-normal — no definido" },
  { label: "Normal", token: "400", scss: "$font-normal" },
  { label: "Medium", token: "500", scss: "$font-medium" },
  { label: "Semibold", token: "600", scss: "$font-semibold" },
  { label: "Bold", token: "700", scss: "$font-bold" },
];

export const FontWeights: Story = {
  name: "Pesos tipográficos",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {WEIGHTS.map(({ label, token, scss }) => (
        <div
          key={token}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "1.5rem",
            borderBottom: "1px solid var(--border-color)",
            paddingBottom: "1rem",
          }}
        >
          <span
            style={{
              minWidth: "6rem",
              fontSize: "0.75rem",
              color: "var(--neutral-color-active)",
              flexShrink: 0,
            }}
          >
            {label} ({token})
          </span>
          <span
            style={{
              fontWeight: Number(token),
              fontSize: "1.5rem",
              flex: 1,
            }}
          >
            El veloz murciélago hindú comía feliz cardillo y kiwi
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--neutral-color-active)",
              fontFamily: "monospace",
              flexShrink: 0,
            }}
          >
            {scss}
          </span>
        </div>
      ))}
    </div>
  ),
};

// ─── Responsive breakpoints ───────────────────────────────────────────────────

const BREAKPOINTS = [
  { name: "sm", px: "640px", description: "Móvil landscape / tablet pequeña" },
  { name: "md", px: "768px", description: "Tablet" },
  { name: "lg", px: "1024px", description: "Desktop pequeño" },
  { name: "xl", px: "1280px", description: "Desktop" },
  { name: "2xl", px: "1536px", description: "Desktop grande" },
];

export const Breakpoints: Story = {
  name: "Breakpoints responsivos",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ fontSize: "0.875rem", color: "var(--neutral-color-active)", margin: "0 0 0.5rem" }}>
        Uso en SCSS: <code style={{ fontFamily: "monospace", background: "var(--neutral-color-light)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>@include screen(md)</code> / <code style={{ fontFamily: "monospace", background: "var(--neutral-color-light)", padding: "0.125rem 0.375rem", borderRadius: "4px" }}>@include screen(md, max)</code>
      </p>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {BREAKPOINTS.map(({ name, px, description }) => (
          <div
            key={name}
            style={{
              flex: "1 1 160px",
              padding: "1.25rem",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              background: "var(--neutral-color-light)",
            }}
          >
            <div
              style={{
                fontFamily: "monospace",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--primary-color)",
                marginBottom: "0.25rem",
              }}
            >
              {name}
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.25rem" }}>
              {px}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--neutral-color-active)" }}>
              {description}
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

// ─── All together ─────────────────────────────────────────────────────────────

export const Overview: Story = {
  name: "Vista general",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      <section>
        <h2 style={{ marginBottom: "1.5rem", paddingBottom: "0.5rem", borderBottom: "2px solid var(--primary-color)" }}>
          Headings
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {["h1", "h2", "h3", "h4", "h5", "h6"].map((Tag) => (
            // @ts-expect-error dynamic tag
            <Tag key={Tag} style={{ margin: 0 }}>
              {Tag.toUpperCase()} — El veloz murciélago hindú
            </Tag>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: "1.5rem", paddingBottom: "0.5rem", borderBottom: "2px solid var(--primary-color)" }}>
          Pesos tipográficos
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {WEIGHTS.map(({ label, token }) => (
            <p key={token} style={{ margin: 0, fontWeight: Number(token), fontSize: "1.125rem" }}>
              {label} ({token}) — Open Sans
            </p>
          ))}
        </div>
      </section>
    </div>
  ),
};
