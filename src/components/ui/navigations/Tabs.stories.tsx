import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import type { Tab, TabsProps } from "@/types/ui/navigations/tabs";

import { BellIcon, SettingsIcon, ShieldIcon, UserIcon } from "lucide-react";

import TabsComponent from "./Tabs";

// ─── Datos de ejemplo ─────────────────────────────────────────────────────────

// Claves reales del catálogo de rutas (`config/pathnames.ts`) y del namespace
// `Tabs` (`src/i18n/locales/{es,en}/tabs.json`), reutilizadas también por
// `BreadCrumbs.stories.tsx`: así el modo no controlado (`href` + `pathname`)
// se ejercita contra rutas que existen de verdad en el catálogo.
const PROFILE_TABS: Tab[] = [
  { key: "sessions", label: "sessions", href: "/profile/sessions" },
  { key: "security", label: "security", href: "/profile/security" },
  { key: "notifications", label: "notifications", href: "/profile/notifications" },
  { key: "preferences", label: "preferences", href: "/profile/preferences" },
];

const PROFILE_TABS_WITH_ICONS: Tab[] = [
  { key: "sessions", label: "sessions", href: "/profile/sessions", icon: UserIcon },
  { key: "security", label: "security", href: "/profile/security", icon: ShieldIcon },
  {
    key: "notifications",
    label: "notifications",
    href: "/profile/notifications",
    icon: BellIcon,
  },
  { key: "preferences", label: "preferences", href: "/profile/preferences", icon: SettingsIcon },
];

// La pestaña "notifications" está deshabilitada a propósito: solo tiene
// efecto real en modo controlado (el modo no controlado, en `Tabs.tsx`,
// renderiza el enlace del desplegable/lista sin comprobar `tab.disabled`).
const CONTROLLED_TABS: Tab[] = [
  { key: "sessions", label: "sessions" },
  { key: "security", label: "security" },
  { key: "notifications", label: "notifications", disabled: true },
  { key: "preferences", label: "preferences" },
];

const CONTENT_BY_KEY: Record<string, string> = {
  sessions: "Aquí se listarían las sesiones activas del usuario.",
  security: "Aquí se gestionaría la configuración de seguridad (2FA, contraseña...).",
  notifications: "Aquí se gestionarían las preferencias de notificaciones.",
  preferences: "Aquí se gestionarían las preferencias generales del usuario.",
};

/**
 * Contenido de ejemplo asociado a una `key` de {@link CONTENT_BY_KEY},
 * siempre como `string` (nunca `undefined`): tanto para renderizarlo en
 * `ControlledTabsDemo` como para buscarlo con `getByText` en los `play`,
 * que no aceptan un matcher `undefined`.
 * @param {string} key - `key` de la pestaña activa
 * @returns {string} El contenido de ejemplo, o la propia `key` si no hay contenido asociado
 */
function contentFor(key: string): string {
  return CONTENT_BY_KEY[key] ?? key;
}

const MANY_TABS: Tab[] = Array.from({ length: 8 }, (_, i) => ({
  key: `tab-${i + 1}`,
  label: `Pestaña ${i + 1}`,
}));

// Espía a nivel de módulo (no de `args`) porque `Controlled` no renderiza
// `TabsComponent` directamente: pasa por `ControlledTabsDemo`, que necesita
// reenviar `onTabChange` para sincronizar su propio estado además de
// notificar al espía.
const controlledOnTabChange = fn();

// ─── Wrapper controlado ───────────────────────────────────────────────────────

/**
 * `TabsComponent` no gestiona el contenido activo por sí mismo: en modo
 * controlado, es responsabilidad del consumidor guardar `activeKey` y
 * renderizar el contenido asociado. Este wrapper reproduce ese patrón (igual
 * que lo haría una página real) para poder documentar/testear el modo
 * controlado de forma interactiva.
 * @param {object} props - Propiedades del wrapper
 * @param {Tab[]} props.tabs - Pestañas a renderizar
 * @param {string} props.initialKey - `key` inicialmente activa
 * @param {(key: string) => void} [props.onTabChange] - Handler adicional invocado además de actualizar el estado interno, usado para espiar los cambios desde el `play`
 * @param {boolean} [props.noTranslation] - Se reenvía tal cual a `TabsComponent`
 * @returns {JSX.Element} Las pestañas en modo controlado, con su contenido sincronizado
 */
function ControlledTabsDemo({
  tabs,
  initialKey,
  onTabChange,
  noTranslation,
}: {
  tabs: Tab[];
  initialKey: string;
  onTabChange?: (key: string) => void;
  noTranslation?: TabsProps["noTranslation"];
}) {
  const [activeKey, setActiveKey] = useState(initialKey);

  return (
    <TabsComponent
      tabs={tabs}
      activeKey={activeKey}
      noTranslation={noTranslation}
      onTabChange={(key) => {
        setActiveKey(key);
        onTabChange?.(key);
      }}
    >
      <p>{contentFor(activeKey)}</p>
    </TabsComponent>
  );
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: "UI/Navigations/Tabs",
  component: TabsComponent,
  parameters: {
    layout: "padded",
    // `TabsComponent` siempre llama a `useParams` (next/navigation) y a
    // `usePathname` (next-intl) para resolver la pestaña activa en modo no
    // controlado, aunque una story concreta use el modo controlado: sin este
    // mock del app router todas las stories fallan con "invariant expected
    // app router to be mounted" (mismo motivo que en Table.stories.tsx).
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/sessions" },
    },
    docs: {
      description: {
        component:
          "Navegación por pestañas: en escritorio, una lista horizontal (`role=\"tablist\"`); en mobile, un botón desplegable con la pestaña activa y el resto de opciones como menú. Admite dos modos: no controlado (cada pestaña es un `Link` a `href`, activa según el `pathname` actual) o controlado (`activeKey`/`onTabChange`, pestañas como `button`, contenido gestionado por el consumidor).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    tabs: { control: false },
    children: { control: false },
    onTabChange: { control: false },
  },
} satisfies Meta<typeof TabsComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Modo no controlado (href + pathname) ──────────────────────────────────────

export const Default: Story = {
  name: "Por defecto (no controlado)",
  args: {
    tabs: PROFILE_TABS,
    children: <p>{CONTENT_BY_KEY.sessions}</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const activeTab = canvas.getByRole("tab", { name: "Sesiones" });
    const inactiveTab = canvas.getByRole("tab", { name: "Seguridad" });

    expect(activeTab).toHaveAttribute("aria-selected", "true");
    expect(activeTab).toHaveAttribute("aria-current", "page");
    expect(inactiveTab).toHaveAttribute("aria-selected", "false");
    expect(inactiveTab).not.toHaveAttribute("aria-current");

    // Cada pestaña es un enlace real, navegable por teclado.
    expect(activeTab).toHaveAttribute("href");
    await userEvent.tab();
    await expect(activeTab).toHaveFocus();
  },
};

export const ActiveSegment: Story = {
  name: "Pestaña activa según el pathname (Seguridad)",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/security" },
    },
    docs: {
      description: {
        story:
          "La pestaña activa se calcula comparando `href` con el `pathname` actual, no con una prop explícita: al cambiar el pathname mockeado a `/profile/security`, es esa pestaña la que se marca activa.",
      },
    },
  },
  args: {
    tabs: PROFILE_TABS,
    children: <p>{CONTENT_BY_KEY.security}</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("tab", { name: "Seguridad" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(canvas.getByRole("tab", { name: "Sesiones" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  },
};

export const WithIcons: Story = {
  name: "Con iconos",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/notifications" },
    },
  },
  args: {
    tabs: PROFILE_TABS_WITH_ICONS,
    children: <p>{CONTENT_BY_KEY.notifications}</p>,
  },
};

export const NoTranslation: Story = {
  name: "Etiquetas literales (noTranslation)",
  parameters: {
    docs: {
      description: {
        story:
          "Con `noTranslation`, `label` se muestra tal cual en vez de resolverse como clave de traducción del namespace `Tabs`: pensado para etiquetas de contenido dinámico (p. ej. el nombre de una entidad) en vez de copy estático de la UI.",
      },
    },
  },
  args: {
    tabs: [
      { key: "acme", label: "Acme Corp" },
      { key: "globex", label: "Globex Inc" },
    ],
    noTranslation: true,
    children: <p>Contenido de la pestaña activa.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("tab", { name: "Acme Corp" })).toBeInTheDocument();
  },
};

export const ManyTabs: Story = {
  name: "Muchas pestañas",
  parameters: {
    docs: {
      description: {
        story:
          "La lista de pestañas no controla su propio desbordamiento horizontal (a diferencia del contenido, que sí lo hace vía `disableScroll`): con muchas pestañas, el layout depende del espacio disponible en el contenedor padre.",
      },
    },
  },
  args: {
    tabs: MANY_TABS,
    noTranslation: true,
    activeKey: "tab-1",
    onTabChange: fn(),
    children: <p>Contenido de la pestaña activa.</p>,
  },
};

// ─── Contenido: scroll interno ────────────────────────────────────────────────

const LONG_CONTENT = (
  <>
    {Array.from({ length: 12 }, (_, i) => (
      <p key={i}>Línea de contenido de ejemplo número {i + 1}.</p>
    ))}
  </>
);

export const ScrollableContent: Story = {
  name: "Contenido con scroll interno (por defecto)",
  args: {
    tabs: PROFILE_TABS,
    children: LONG_CONTENT,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Por defecto (`disableScroll: false`), el contenido hace scroll interno (`overflow-y: auto`) sin desplazar el resto de la página.",
      },
    },
  },
};

export const NoInternalScroll: Story = {
  name: "Contenido sin scroll interno (disableScroll)",
  args: {
    tabs: PROFILE_TABS,
    disableScroll: true,
    children: LONG_CONTENT,
  },
  parameters: {
    docs: {
      description: {
        story: "Con `disableScroll`, el contenido usa `overflow: visible` y crece con la página.",
      },
    },
  },
};

// ─── className / style ─────────────────────────────────────────────────────────

export const CustomStyling: Story = {
  name: "className / style personalizados",
  args: {
    tabs: PROFILE_TABS,
    className: "tabs--full",
    style: { maxWidth: "40rem" },
    children: <p>{CONTENT_BY_KEY.sessions}</p>,
  },
};

// ─── Modo controlado (activeKey + onTabChange) ─────────────────────────────────

export const Controlled: Story = {
  name: "Controlado (activeKey / onTabChange)",
  parameters: {
    docs: {
      description: {
        story:
          "En modo controlado, las pestañas se renderizan como `button` (no como `Link`) y es el consumidor quien decide qué contenido mostrar para cada `activeKey`. La pestaña \"Notificaciones\" está deshabilitada para comprobar que ni el click ni el teclado disparan `onTabChange`.",
      },
    },
  },
  // `args.tabs` no lo usa `render` (que monta `ControlledTabsDemo` de forma
  // explícita), pero satisface el tipado de `Meta<typeof TabsComponent>`,
  // que exige `tabs` por ser una prop obligatoria.
  args: {
    tabs: CONTROLLED_TABS,
  },
  render: () => (
    <ControlledTabsDemo
      tabs={CONTROLLED_TABS}
      initialKey="sessions"
      onTabChange={controlledOnTabChange}
    />
  ),
  play: async ({ canvasElement }) => {
    controlledOnTabChange.mockClear();

    const canvas = within(canvasElement);

    const sessionsTab = canvas.getByRole("tab", { name: "Sesiones" });
    const securityTab = canvas.getByRole("tab", { name: "Seguridad" });
    const notificationsTab = canvas.getByRole("tab", { name: "Notificaciones" });
    const preferencesTab = canvas.getByRole("tab", { name: "Preferencias" });

    expect(sessionsTab).toHaveAttribute("aria-selected", "true");
    expect(notificationsTab).toBeDisabled();

    // Navegación por teclado: Tab recorre los botones habilitados en orden;
    // el deshabilitado ("Notificaciones") se salta automáticamente al no ser
    // focuseable, así que de "Seguridad" se pasa directo a "Preferencias".
    await userEvent.tab();
    await expect(sessionsTab).toHaveFocus();
    await userEvent.tab();
    await expect(securityTab).toHaveFocus();
    await userEvent.tab();
    await expect(preferencesTab).toHaveFocus();

    // Activación por teclado (Enter) de la pestaña con foco.
    await userEvent.keyboard("{Enter}");
    expect(preferencesTab).toHaveAttribute("aria-selected", "true");
    expect(canvas.getByText(contentFor("preferences"))).toBeInTheDocument();
    expect(controlledOnTabChange).toHaveBeenCalledWith("preferences");

    // Click activa la pestaña y su contenido asociado.
    await userEvent.click(securityTab);
    expect(securityTab).toHaveAttribute("aria-selected", "true");
    expect(preferencesTab).toHaveAttribute("aria-selected", "false");
    expect(canvas.getByText(contentFor("security"))).toBeInTheDocument();
    expect(controlledOnTabChange).toHaveBeenCalledWith("security");

    // La pestaña deshabilitada nunca dispara el handler.
    expect(controlledOnTabChange).not.toHaveBeenCalledWith("notifications");
  },
};

// ─── Mobile (desplegable) ───────────────────────────────────────────────────────

export const Mobile: Story = {
  name: "Mobile (desplegable)",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "Por debajo de 1024px de ancho de ventana (no un breakpoint CSS: se detecta con `window.innerWidth`), las pestañas se colapsan en un botón desplegable con la pestaña activa y el resto de opciones como menú.",
      },
    },
  },
  args: {
    tabs: PROFILE_TABS,
    children: <p>{CONTENT_BY_KEY.sessions}</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const trigger = canvas.getByRole("button", { name: "Sesiones" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const securityOption = canvas.getByRole("link", { name: "Seguridad" });
    expect(securityOption).toBeInTheDocument();

    await userEvent.click(securityOption);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const MobileClosesOnOutsideClick: Story = {
  name: "Mobile — cierra al hacer click fuera",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "El desplegable mobile se cierra al detectar un click fuera de él, vía `useOutsideClick`.",
      },
    },
  },
  args: {
    tabs: PROFILE_TABS,
    // `disableScroll` también aplica en mobile (comprobado aquí de paso).
    disableScroll: true,
    children: <p>{CONTENT_BY_KEY.sessions}</p>,
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p data-testid="outside">Fuera de las pestañas</p>
      </div>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Sesiones" });

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(canvas.getByTestId("outside"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  },
};

export const MobileNoActiveTab: Story = {
  name: "Mobile — sin pestaña activa (y un tab sin href)",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/does-not-match" },
    },
    docs: {
      description: {
        story:
          "Cuando ningún tab coincide con el pathname actual, el botón desplegable muestra el placeholder «Selecciona una pestaña». El segundo tab, sin `href`, comprueba además que el modo no controlado lo excluye del desplegable (nunca se renderiza como enlace).",
      },
    },
  },
  args: {
    tabs: [
      { key: "sessions", label: "sessions", href: "/profile/sessions" },
      { key: "orphan", label: "notifications" },
    ],
    children: <p>Contenido.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Selecciona una pestaña" });
    expect(trigger).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(canvas.getByRole("link", { name: "Sesiones" })).toBeInTheDocument();
    expect(canvas.queryByRole("link", { name: "Notificaciones" })).not.toBeInTheDocument();
  },
};

export const DynamicSegmentResolution: Story = {
  name: "Segmento dinámico resuelto vía useParams",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/items/[id]",
        segments: [["id", "42"]],
      },
    },
    docs: {
      description: {
        story:
          "`href`/`pathname` pueden incluir segmentos dinámicos (`[id]`) que se resuelven con el valor real de `useParams()` antes de comparar: aquí `href=\"/items/[id]\"` se marca activo porque, tras resolver `[id]` a `42` en ambos lados, coinciden.",
      },
    },
  },
  args: {
    tabs: [
      { key: "detail", label: "sessions", href: "/items/[id]" },
      { key: "other", label: "security", href: "/items/other" },
    ],
    children: <p>Detalle.</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("tab", { name: "Sesiones" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(canvas.getByRole("tab", { name: "Seguridad" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  },
};

export const MobileControlled: Story = {
  name: "Mobile controlado (desplegable)",
  parameters: {
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        story:
          "En modo controlado, el desplegable mobile renderiza cada opción como `button` (no `Link`) y filtra por `activeKey` en vez de por `pathname`. La opción «Notificaciones» está deshabilitada para comprobar que el resto de opciones sí notifican `onTabChange` y cierran el desplegable.",
      },
    },
  },
  args: {
    tabs: CONTROLLED_TABS,
    activeKey: "sessions",
    onTabChange: fn(),
    children: <p>Contenido de la pestaña activa.</p>,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Sesiones" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const notificationsOption = canvas.getByRole("button", { name: "Notificaciones" });
    expect(notificationsOption).toBeDisabled();

    const securityOption = canvas.getByRole("button", { name: "Seguridad" });
    await userEvent.click(securityOption);

    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(args.onTabChange).toHaveBeenCalledWith("security");
  },
};
