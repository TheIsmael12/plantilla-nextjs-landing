import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { NextIntlClientProvider } from "next-intl";
import { expect, userEvent, within } from "storybook/test";

import NotFound from "./NotFound";

const storyMessages = {
  Views: {
    NotFound: {
      code: "Error 404",
      title: "Página no encontrada",
      description:
        "La página que buscas no existe o ha sido movida a otra dirección.",
    },
  },
  Buttons: {
    goHome: "Volver al inicio",
  },
};

const meta = {
  title: "UI/Errors/NotFound",
  component: NotFound,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Página completa de error 404 (ruta no encontrada): combina una ilustración, el código/título/descripción traducidos (`Views.NotFound`) y un enlace de vuelta al inicio (`Buttons.goHome`). Se usa como `not-found.tsx` de Next.js, por lo que no recibe callbacks: su única prop es `className`, para adaptar el contenedor raíz cuando se reutiliza fuera de esa ruta.",
      },
    },
  },
  tags: ["autodocs"],
  decorators: [
    (Story, context) => (
      <NextIntlClientProvider
        locale={(context.globals.locale as string) || "es"}
        messages={storyMessages}
      >
        <Story />
      </NextIntlClientProvider>
    ),
  ],
  argTypes: {
    className: {
      control: "text",
      description: "Clases CSS adicionales aplicadas al contenedor principal.",
    },
  },
  args: {},
} satisfies Meta<typeof NotFound>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Por defecto",
};

export const DarkTheme: Story = {
  name: "Tema oscuro",
  decorators: [
    (Story) => (
      <div data-theme="dark" style={{ minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export const LightTheme: Story = {
  name: "Tema claro",
  decorators: [
    (Story) => (
      <div data-theme="light" style={{ minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
};

export const EnglishLocale: Story = {
  name: "Inglés",
  decorators: [
    (Story) => (
      <NextIntlClientProvider
        locale="en"
        messages={{
          Views: {
            NotFound: {
              code: "Error 404",
              title: "Page not found",
              description:
                "The page you're looking for doesn't exist or has been moved.",
            },
          },
          Buttons: {
            goHome: "Go home",
          },
        }}
      >
        <Story />
      </NextIntlClientProvider>
    ),
  ],
};

export const WithCustomClassName: Story = {
  name: "Con clase personalizada",
  args: {
    className: "not-found--story-demo",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demuestra la prop `className`, que se añade al contenedor raíz (`.not-found`) para adaptarlo cuando se reutiliza fuera de la ruta `not-found.tsx`.",
      },
    },
  },
};

export const KeyboardAccessibility: Story = {
  name: "Accesibilidad por teclado",
  parameters: {
    docs: {
      description: {
        story:
          "Verifica que el único elemento interactivo de la página (el enlace `Volver al inicio`) tiene un nombre accesible y es alcanzable con el teclado mediante Tab.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const homeLink = canvas.getByRole("link", { name: /volver al inicio/i });

    // `Link` (de `@/i18n/navigation`) usa `localePrefix: "as-needed"`
    // (`src/i18n/routing.ts`), así que "/" se mantiene sin prefijo con el
    // locale por defecto ("es") de esta historia.
    await expect(homeLink).toHaveAttribute("href", "/");

    await userEvent.tab();
    await expect(homeLink).toHaveFocus();
  },
};
