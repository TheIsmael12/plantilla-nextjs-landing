import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import { UserRoundIcon } from "lucide-react";

import BackendImage from "./BackendImage";

const meta = {
  title: "UI/Images/BackendImage",
  component: BackendImage,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Imagen servida por el backend (avatares, ficheros subidos por el usuario...), ya resuelta a URL absoluta por `resolveBackendAssetUrl` (`utils/fetchUtils.ts`), a diferencia de `ImageLogo` (activos estáticos locales). No usa `next/image` porque el origen del backend cambia por entorno y el proyecto no tiene `images.remotePatterns` configurado. Muestra `fallback` si no hay `src` o si la imagen falla al cargar (URL caducada, fichero borrado...), preservando en ese caso el mismo nombre accesible (`alt`) que tendría la imagen cargada.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    src: {
      control: "text",
      description: "URL absoluta de la imagen, o `null`/`undefined` para mostrar `fallback`.",
    },
    alt: {
      control: "text",
      description:
        "Texto alternativo de accesibilidad. Se usa como `alt` de la imagen y, si se muestra `fallback`, como `aria-label` del contenedor (`role=\"img\"`) para no perder el nombre accesible.",
    },
    className: {
      control: "text",
      description: "Clases CSS adicionales, aplicadas a la imagen y al contenedor de `fallback`.",
    },
    fallback: {
      control: false,
      description: "Contenido mostrado si no hay `src` o la imagen falla al cargar.",
    },
  },
  args: {
    alt: "Avatar de usuario",
    className: "",
    fallback: <UserRoundIcon aria-hidden="true" />,
  },
} satisfies Meta<typeof BackendImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  name: "Con imagen",
  args: {
    src: "https://placehold.co/96x96",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole("img", { name: args.alt as string });

    await expect(image.tagName).toBe("IMG");
    await expect(image).toHaveAttribute("src", args.src as string);
  },
};

export const NoSrc: Story = {
  name: "Sin src (fallback)",
  args: {
    src: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByRole("img", { name: args.alt as string });

    // Sin imagen que cargar, el fallback aparece de inmediato y conserva
    // el mismo nombre accesible que tendría la imagen si hubiera `src`.
    await expect(fallback.tagName).toBe("SPAN");
  },
};

export const Undefined: Story = {
  name: "src indefinido (fallback)",
  args: {
    src: undefined,
  },
};

export const NoFallback: Story = {
  name: "Sin fallback",
  parameters: {
    docs: {
      description: {
        story:
          "Sin `fallback`, el contenedor sigue mostrando `role=\"img\"` con el `aria-label` de `alt`, pero queda vacío visualmente. `fallback` es opcional: quien use el componente debería aportar siempre un icono o contenido de respaldo.",
      },
    },
  },
  args: {
    src: null,
    fallback: undefined,
  },
};

export const CustomClassName: Story = {
  name: "Con clases adicionales",
  args: {
    src: "https://placehold.co/64x64",
    className: "story-custom-class",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole("img");

    await expect(image).toHaveClass("story-custom-class");
  },
};

export const BrokenSrc: Story = {
  name: "src roto (fallback tras error)",
  parameters: {
    docs: {
      description: {
        story:
          "Cuando `src` apunta a un recurso que ya no existe, la imagen dispara `onError` y se sustituye por `fallback`, sin perder el nombre accesible (`aria-label` = `alt`).",
      },
    },
  },
  args: {
    src: "https://localhost/does-not-exist.png",
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // El navegador intenta cargar el src roto de forma asíncrona; hasta que
    // dispara `onError` el <img> puede seguir en el DOM, así que se espera
    // a que el fallback (un <span role="img">) lo sustituya.
    await waitFor(
      () => {
        const fallback = canvas.getByRole("img", { name: args.alt as string });
        expect(fallback.tagName).toBe("SPAN");
      },
      // El host "https://localhost/..." tarda en fallar la conexión (rechazo
      // TCP/TLS) más que el timeout por defecto de `waitFor` (1000ms), por lo
      // que el `onError` puede no haber disparado aún cuando expira.
      { timeout: 5000 },
    );
  },
};

export const KeyboardNotFocusable: Story = {
  name: "No es un control interactivo",
  parameters: {
    docs: {
      description: {
        story:
          "`BackendImage` es puramente presentacional (imagen o su fallback): no expone ningún control con el que interactuar por teclado ni dispara eventos propios, por eso no participa del orden de tabulación.",
      },
    },
  },
  args: {
    src: "https://placehold.co/96x96",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole("img");

    await expect(image).not.toHaveAttribute("tabindex");
  },
};
