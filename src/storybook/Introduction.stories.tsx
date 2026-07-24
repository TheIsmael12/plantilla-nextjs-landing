import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Introduction",
  parameters: {
    layout: "padded",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Punto de entrada a la librería de componentes de la plantilla: qué hay, cómo está organizado y qué reglas sigue todo lo que se añada.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface StackItemProps {
  label: string;
  value: string;
}

function StackItem({ label, value }: StackItemProps) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "0.875rem 1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "var(--neutral-color-active)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.9375rem", fontWeight: 600 }}>{value}</div>
    </div>
  );
}

interface CategoryCardProps {
  folder: string;
  description: string;
  components: string[];
}

function CategoryCard({ folder, description, components }: CategoryCardProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "10px",
        padding: "1.25rem",
        background: "var(--light-color)",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.8125rem",
          color: "var(--primary-color)",
          fontWeight: 700,
          marginBottom: "0.375rem",
        }}
      >
        components/ui/{folder}/
      </div>
      <p
        style={{
          margin: "0 0 0.875rem",
          fontSize: "0.8125rem",
          color: "var(--neutral-color-active)",
        }}
      >
        {description}
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
        {components.map((name) => (
          <span
            key={name}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              padding: "0.25rem 0.625rem",
              borderRadius: "999px",
              background: "var(--neutral-color-light)",
              color: "var(--color)",
            }}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      style={{
        fontSize: "1.25rem",
        margin: "0 0 1rem",
        paddingBottom: "0.5rem",
        borderBottom: "2px solid var(--primary-color)",
      }}
    >
      {children}
    </h2>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const STACK: StackItemProps[] = [
  { label: "Framework", value: "Next.js (App Router) + React 19" },
  { label: "Lenguaje", value: "TypeScript strict + JSDoc" },
  { label: "Formularios", value: "Formik + Yup" },
  { label: "Estilos", value: "Sass (7-1), sin frameworks de utilidades" },
  { label: "i18n", value: "next-intl (rutas con locale)" },
  { label: "Tema", value: "next-themes (claro/oscuro)" },
  { label: "Tablas", value: "@tanstack/react-table" },
  { label: "Iconos", value: "lucide-react" },
];

const CATEGORIES: CategoryCardProps[] = [
  {
    folder: "buttons",
    description: "Botón base del sistema, con variantes semánticas y tamaños.",
    components: ["Button"],
  },
  {
    folder: "inputs",
    description: "Campos de formulario y selectores propios; ningún <input> nativo suelto en las vistas.",
    components: [
      "Input",
      "Select",
      "SelectSearch",
      "RadioGroup",
      "Toggle",
      "OtpInput",
      "DatePicker",
      "DateRangePicker",
      "ChangeLocale",
    ],
  },
  {
    folder: "alerts",
    description: "Mensajes de error, aviso y confirmación inline.",
    components: ["Alert"],
  },
  {
    folder: "modals",
    description: "Modal genérico (incl. confirmaciones destructivas) y el modal de verificación OTP.",
    components: ["ModalComponent", "OtpCodeModal"],
  },
  {
    folder: "tables",
    description: "Tabla de datos genérica sobre TanStack Table: orden, paginación y filtro siempre server-side.",
    components: ["Table", "TablePagination", "RowActionsMenu"],
  },
  {
    folder: "navigations",
    description: "El shell completo de la intranet: barra superior, menú lateral y navegación de perfil.",
    components: [
      "Navbar",
      "Sidebar",
      "MenuItems",
      "BreadCrumbs",
      "NotificationBell",
      "TitleComponent",
      "User",
    ],
  },
  {
    folder: "cards",
    description: "Tarjetas de contenido; hoy cubre la sesión activa del perfil.",
    components: ["SessionCard"],
  },
  {
    folder: "errors",
    description: "Estados vacíos, de error y la página 404.",
    components: ["EmptyState", "ErrorState", "NotFound"],
  },
  {
    folder: "loaders",
    description: "Estados de carga base, usados por los esqueletos de cada vista.",
    components: ["Skeleton", "Spinner"],
  },
  {
    folder: "sections",
    description: "Bloque base de una sección de ajustes/perfil (cabecera + contenido).",
    components: ["SettingsSection"],
  },
  {
    folder: "images",
    description: "Logo de la aplicación, resuelto automáticamente entre tema claro y oscuro.",
    components: ["ImageLogo"],
  },
];

const RULES = [
  {
    title: "Cero estilos inline",
    body: "Nada de style={{...}} en componentes de producto. Cada componente de components/ui/<categoria>/Componente.tsx tiene su parcial 1:1 en styles/04-components/ui/<categoria>/componente.scss.",
  },
  {
    title: "Cero texto hardcodeado",
    body: "Todo texto visible sale de next-intl (useTranslations/getTranslations), con la clave añadida en todos los locales soportados (i18n/locales/es y en).",
  },
  {
    title: "01-tools es solo mixins",
    body: "Nada de clases utilitarias tipo Tailwind (.p-4, .flex...). Se usa @include flex(...), @include py(...), @include rounded(...) desde 01-tools/. Si falta un mixin, se añade ahí — nunca se rodea con CSS a mano.",
  },
  {
    title: "Colores solo desde tokens",
    body: "Ningún hexadecimal suelto en un componente: siempre var(--primary-color), var(--error-color)... definidos en 00-settings/_colors.scss, con su variante para tema oscuro.",
  },
  {
    title: "JSDoc en todo export",
    body: "Toda interface/type/enum/función/componente/hook exportado lleva un bloque JSDoc (descripción + @param/@returns/@property), verificado por eslint-plugin-jsdoc.",
  },
  {
    title: "Story + estilos por componente nuevo",
    body: "Un componente de components/ui/ no se considera terminado sin su Componente.stories.tsx (variantes, estados disabled/error/loading, ambos temas) y su parcial SCSS correspondiente.",
  },
];

// ─── Story ────────────────────────────────────────────────────────────────────

export const Overview: Story = {
  name: "Bienvenida",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", maxWidth: "72rem" }}>
      <section>
        <h1 style={{ fontSize: "1.875rem", margin: "0 0 0.5rem" }}>
          Librería de componentes — Plantilla Next.js
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--neutral-color-active)",
            maxWidth: "48rem",
            margin: 0,
          }}
        >
          Sistema de diseño de la plantilla base para intranets de gestión de
          usuarios: login, MFA, perfil, ajustes y administración de usuarios.
          Cada pieza de <code style={{ fontFamily: "monospace" }}>components/ui/</code>{" "}
          vive aquí documentada — variantes, estados y comportamiento en ambos
          temas — antes de usarse en una vista real.
        </p>
      </section>

      <section>
        <SectionTitle>Stack</SectionTitle>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {STACK.map((item) => (
            <StackItem key={item.label} {...item} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Cómo navegar el catálogo</SectionTitle>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--neutral-color-active)",
            margin: "0 0 1.25rem",
          }}
        >
          El sidebar agrupa cada componente bajo{" "}
          <strong>UI/&lt;Categoría&gt;/&lt;Componente&gt;</strong>, en el mismo
          orden que su carpeta real en <code>src/components/ui/</code>. Los
          tokens compartidos (color, tipografía) están aparte, en{" "}
          <strong>Design System</strong>.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {CATEGORIES.map((category) => (
            <CategoryCard key={category.folder} {...category} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Convenciones no negociables</SectionTitle>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {RULES.map((rule) => (
            <div
              key={rule.title}
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                padding: "1rem",
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.375rem" }}>
                {rule.title}
              </div>
              <p style={{ margin: 0, fontSize: "0.8125rem", color: "var(--neutral-color-active)" }}>
                {rule.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Tema</SectionTitle>
        <p style={{ fontSize: "0.875rem", color: "var(--neutral-color-active)", margin: 0 }}>
          Usa el selector <strong>Tema</strong> de la barra superior de
          Storybook para comprobar cada componente en claro y oscuro — todos
          los tokens de color reaccionan solos, sin tocar el componente. Ver{" "}
          <strong>Design System / Colors</strong> y{" "}
          <strong>Design System / Typography</strong> para la paleta y la
          escala tipográfica completas.
        </p>
      </section>
    </div>
  ),
};
