import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import BreadcrumbProvider, { useBreadcrumbLabel } from "@/context/BreadcrumbProvider";

import Breadcrumbs from "./BreadCrumbs";

/**
 * Envuelve `Breadcrumbs` inyectando una etiqueta dinámica para el segmento
 * activo (p. ej. el nombre real de un usuario ya cargado), tal y como haría
 * una página real a través de `useBreadcrumbLabel`.
 * @param {{ label: string }} props - `label` es el valor a inyectar en el segmento dinámico activo
 * @returns {JSX.Element} Las migas de pan con la etiqueta dinámica aplicada
 */
function BreadcrumbsWithDynamicLabel({ label }: { label: string }) {
  useBreadcrumbLabel(label);
  return <Breadcrumbs />;
}

const meta = {
  title: "UI/Navigations/Breadcrumbs",
  component: Breadcrumbs,
  decorators: [
    (Story) => (
      <BreadcrumbProvider>
        <Story />
      </BreadcrumbProvider>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Migas de pan que reconstruyen la ruta actual a partir del pathname y los route params, sin recibir props: traduce cada segmento estático vía i18n, muestra el valor real (o la etiqueta inyectada por la página vía `useBreadcrumbLabel`) en los dinámicos, y cae a \"Error 404\" si la ruta no está registrada en el catálogo de rutas. El último ítem representa la página actual: no es un enlace y lleva `aria-current=\"page\"` para lectores de pantalla.",
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  name: "Inicio",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
};

export const Profile: Story = {
  name: "Perfil",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile" },
    },
  },
};

export const ProfileSessions: Story = {
  name: "Perfil › Sesiones",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/sessions" },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const homeLink = canvas.getByRole("link", { name: "Inicio" });
    const profileLink = canvas.getByRole("link", { name: "Perfil" });

    expect(homeLink).toHaveAttribute("href");
    expect(profileLink).toHaveAttribute("href");

    // El último segmento ("Sesiones") representa la página actual: no es un
    // enlace, y su `<li>` debe llevar `aria-current="page"`.
    expect(canvas.queryByRole("link", { name: "Sesiones" })).not.toBeInTheDocument();
    expect(canvas.getByRole("listitem", { current: "page" })).toHaveTextContent("Sesiones");

    // Operable por teclado: Tab debe alcanzar los enlaces en orden.
    await userEvent.tab();
    await expect(homeLink).toHaveFocus();
    await userEvent.tab();
    await expect(profileLink).toHaveFocus();
  },
};

export const ProfileSecurity: Story = {
  name: "Perfil › Seguridad",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/security" },
    },
  },
};

export const ProfileNotifications: Story = {
  name: "Perfil › Notificaciones",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/notifications" },
    },
  },
};

export const ProfilePreferences: Story = {
  name: "Perfil › Preferencias",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/preferences" },
    },
  },
};

export const UserDetail: Story = {
  name: "Usuarios › Detalle (segmento dinámico)",
  parameters: {
    docs: {
      description: {
        story:
          "El segmento dinámico `[id]` debe resolverse con el valor real del route param (vía `useParams()`), no con el pathname plantilla (`/users/[id]`) que devuelve `usePathname()` de next-intl para rutas con `pathnames` configurado.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/users/[id]",
        segments: [["id", "f278d99f-1234-5678-9abc-def012345678"]],
      },
    },
  },
};

export const FourLevelPath: Story = {
  name: "Ruta de cuatro niveles",
  parameters: {
    docs: {
      description: {
        story:
          "Ejemplo con cuatro niveles (inicio › perfil › preferencias › idioma), para comprobar que la traducción y la navegabilidad de los segmentos intermedios se mantienen correctas a mayor profundidad.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/preferences/locale" },
    },
  },
};

export const UserDetailWithDynamicLabel: Story = {
  name: "Usuarios › Detalle (etiqueta dinámica inyectada)",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando la página inyecta una etiqueta vía `useBreadcrumbLabel` (p. ej. el nombre real del usuario ya cargado, en vez del id de la URL), esa etiqueta sustituye al valor crudo del segmento dinámico solo en el último ítem.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/users/[id]",
        segments: [["id", "f278d99f-1234-5678-9abc-def012345678"]],
      },
    },
  },
  render: () => <BreadcrumbsWithDynamicLabel label="María López" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText("María López")).toBeInTheDocument();
    expect(canvas.queryByText("f278d99f-1234-5678-9abc-def012345678")).not.toBeInTheDocument();
  },
};

export const SingleDynamicSegment: Story = {
  name: "Segmento dinámico único (sin segmento estático previo)",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando el segmento dinámico es también el primero de la ruta (no hay segmento estático anterior cuya `canonicalKey` comprobar), el fallback `?? \"/\"` evita un `undefined` y usa la raíz para comprobar si la ruta existe en el catálogo.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/[token]",
        segments: [["token", "abc123"]],
      },
    },
  },
};

export const NotFound: Story = {
  name: "Ruta desconocida (404)",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/ruta-que-no-existe" },
    },
  },
};

export const DeepPath: Story = {
  name: "Ruta de tres niveles",
  parameters: {
    controls: { disable: true },
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/sessions" },
    },
    docs: {
      description: {
        story:
          "Ejemplo del breadcrumb con tres niveles (inicio › perfil › sesiones). Usa el selector de locale del toolbar para ver la versión traducida.",
      },
    },
  },
};
