import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import TitleComponent from "./TitleComponent";

const meta = {
  title: "UI/Navigations/TitleComponent",
  component: TitleComponent,
  parameters: {
    layout: "padded",
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
    docs: {
      description: {
        component:
          "Título de página resuelto automáticamente a partir de la ruta activa: busca la ruta en `PRIVATE_ROUTES`/`AUTH_ROUTES` (vía `findRouteByPathname`) para obtener su icono y traduce el título con la misma clave (`Navigation.Routes`) usada por el sidebar y la navegación de perfil. Si la ruta no está registrada, cae al último segmento del pathname capitalizado y no muestra icono. Opcionalmente admite contenido adicional junto al título (`extra`) y un link de 'volver' hacia una ruta anterior (`returnPath`).",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    extra: {
      control: "text",
      description:
        "Contenido adicional (normalmente texto) mostrado junto al título resuelto, p. ej. el nombre de la entidad en una vista de detalle.",
    },
    returnPath: {
      control: "text",
      description:
        "Ruta estática (`StaticPathname`) a la que enlaza el link de 'volver' bajo el título; si se omite, no se muestra el link.",
    },
  },
} satisfies Meta<typeof TitleComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/" },
    },
  },
};

export const Tickets: Story = {
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/tickets" },
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
};

export const ProfilePreferencesTheme: Story = {
  name: "Perfil › Preferencias › Apariencia",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/profile/preferences/theme" },
    },
    docs: {
      description: {
        story:
          "Ruta anidada a tres niveles: el icono y el título se resuelven recorriendo `subRoutes` de forma recursiva.",
      },
    },
  },
};

export const UnknownRoute: Story = {
  name: "Ruta no registrada (fallback)",
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/ruta-que-no-existe" },
    },
    docs: {
      description: {
        story:
          "Cuando el pathname no coincide con ninguna ruta registrada, se usa el último segmento capitalizado como título y no se muestra icono.",
      },
    },
  },
};

export const UserDetail: Story = {
  name: "Detalle de usuario (extra + returnPath)",
  args: {
    extra: "Ismael Ben",
    returnPath: "/users",
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/users/1" },
    },
    docs: {
      description: {
        story:
          "`extra` añade contexto al título (ej: el nombre de la entidad) y `returnPath` muestra un link de 'volver' hacia una ruta estática (`StaticPathname`), como en la vista de detalle de usuario.",
      },
    },
  },
};

export const ExtraOnly: Story = {
  name: "Solo extra (sin returnPath)",
  args: {
    extra: "Ismael Ben",
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/users/1" },
    },
    docs: {
      description: {
        story:
          "`extra` puede usarse de forma independiente de `returnPath`: el título muestra el contenido adicional pero no se renderiza ningún link de 'volver'.",
      },
    },
  },
};

export const ReturnPathOnly: Story = {
  name: "Solo returnPath (sin extra)",
  args: {
    returnPath: "/users",
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/users/1" },
    },
    docs: {
      description: {
        story:
          "`returnPath` puede usarse de forma independiente de `extra`: se muestra el link de 'volver' sin contenido adicional en el título.",
      },
    },
  },
};

export const ReturnLinkKeyboardAccess: Story = {
  name: "Link de volver accesible por teclado",
  args: {
    /*
     * Una ruta **de este proyecto**, y ahí estaba el fallo.
     *
     * La historia venía con `/users`, que es una ruta de la intranet (`plantilla-nextjs`) y no existe en el
     * catálogo de la landing. `Navigation.Routes` no tenía esa clave, así que el enlace se llamaba «Volver a
     * navigation.routes./users» en vez de «Volver a Usuarios» y la búsqueda por nombre accesible no encontraba
     * nada. Se copió del repo hermano y nunca se adaptó; como el proyecto no tenía forma de ejecutar las pruebas,
     * llevaba roto sin que nadie lo viera.
     */
    returnPath: "/private-area/services",
  },
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: "/private-area/services/1" },
    },
    docs: {
      description: {
        story:
          "Prueba de interacción: el link de 'volver' expone un nombre accesible (`Volver a Mis servicios`), es alcanzable con Tab y su `href` apunta a la versión localizada de `returnPath`.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: /volver a mis servicios/i });

    await userEvent.tab();
    await expect(link).toHaveFocus();
    // El `href` va localizado: en español, `/private-area/services` se sirve como `/area-privada/servicios`.
    await expect(link).toHaveAttribute("href", expect.stringContaining("servicios"));
  },
};
