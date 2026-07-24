import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import MenuItems from "./MenuItems";

const meta = {
  title: "UI/Navigations/MenuItems",
  component: MenuItems,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
    docs: {
      description: {
        component:
          "Menú de navegación genérico sobre `PRIVATE_ROUTES`, reutilizado tanto para el sidebar principal (sin `path`, monta las rutas de primer nivel agrupadas por categoría) como para un submenú concreto (con `path`, monta un enlace a esa ruta más sus `subRoutes`). Sustituye a los antiguos `MenuSection`/`ProfileMenuItems`, que duplicaban la misma lógica de agrupado/despliegue en dos componentes distintos.",
      },
    },
  },
  decorators: [
    (Story) => (
      <nav aria-label="Menú" style={{ display: "flex", maxWidth: "16.5rem" }}>
        <Story />
      </nav>
    ),
  ],
  tags: ["autodocs"],
} satisfies Meta<typeof MenuItems>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullSidebar: Story = {
  name: "Sidebar completo (sin path)",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `path`, monta las rutas de primer nivel de `PRIVATE_ROUTES` con `isShownInSidebar: true`, agrupadas por `category`. Hoy solo existe el Panel — el árbol crece solo a medida que se registran más rutas en `config/routing.ts`.",
      },
    },
  },
};

export const ProfileSubmenu: Story = {
  name: "Submenú de un path (Mi perfil)",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile" },
    },
    docs: {
      description: {
        story:
          "Con `path=\"/profile\"`: enlace a la propia ruta («Mi perfil») más sus `subRoutes`, agrupadas por categoría (`account`, `sessionsAndSecurity`). Así se reutiliza tanto en el desplegable de `User` como en el layout de perfil.",
      },
    },
  },
  args: { path: "/profile" },
};

export const ProfileSubmenuSessionsActive: Story = {
  name: "Submenú de perfil — Sesiones activa",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/sessions" },
    },
  },
  args: { path: "/profile" },
};

export const ProfileSubmenuSecurityActive: Story = {
  name: "Submenú de perfil — Seguridad activa",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/security" },
    },
  },
  args: { path: "/profile" },
};

export const PathWithoutSubRoutes: Story = {
  name: "Path sin subRoutes (fallback a lista vacía)",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/users" },
    },
    docs: {
      description: {
        story:
          "Con `path=\"/users\"` (una ruta registrada sin `subRoutes`), solo se muestra el enlace a la propia ruta: el fallback `rootRoute?.subRoutes ?? []` evita que el resto del componente reciba `undefined`.",
      },
    },
  },
  args: { path: "/users" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole("link", { name: "Usuarios" })).toBeInTheDocument();
    // Sin subRoutes no hay grupos desplegables que renderizar.
    expect(canvas.queryAllByRole("button")).toHaveLength(0);
  },
};

export const ProfileSubmenuTogglePreferences: Story = {
  name: "Interacción — desplegar/plegar Preferencias manualmente",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile" },
    },
    docs: {
      description: {
        story:
          "Cuando la ruta activa no cuelga de un grupo con `subRoutes` (aquí, `/profile`), ese grupo empieza plegado y se abre/pliega manualmente al pulsarlo (`toggleGroup`), sin depender del resaltado automático por ruta activa.",
      },
    },
  },
  args: { path: "/profile" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole("button", { name: /Preferencias/i });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(canvas.queryByRole("link", { name: "Idioma" })).not.toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(canvas.getByRole("link", { name: "Idioma" })).toBeInTheDocument();

    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(canvas.queryByRole("link", { name: "Idioma" })).not.toBeInTheDocument();
  },
};

export const ProfileSubmenuPreferencesOpen: Story = {
  name: "Submenú de perfil — Preferencias › Apariencia (grupo anidado abierto)",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/preferences/theme" },
    },
    docs: {
      description: {
        story:
          "Preferencias tiene sus propias `subRoutes` (idioma, apariencia, fecha/hora, notificaciones); al estar en una de ellas, el grupo se despliega solo y resalta el ítem activo.",
      },
    },
  },
  args: { path: "/profile" },
};
