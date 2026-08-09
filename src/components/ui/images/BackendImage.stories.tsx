import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';

import { UserRoundIcon } from 'lucide-react';

import BackendImage from './BackendImage';

const meta = {
  title: 'Components/UI/Images/BackendImage',
  component: BackendImage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Imagen servida por el backend (portadas/avatares del blog...), a diferencia de `next/image` con `remotePatterns`: el origen del backend cambia por entorno, y el optimizador de `next/image` hace su propio fetch server-side que puede fallar por razones independientes de que la imagen sea válida. Un `<img>` nativo delega la carga al navegador. Muestra `fallback` si no hay `src` o si la imagen falla al cargar, preservando el mismo nombre accesible (`alt`) que tendría la imagen cargada.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'URL absoluta de la imagen, o `null`/`undefined` para mostrar `fallback`.',
    },
    alt: {
      control: 'text',
      description:
        'Texto alternativo de accesibilidad. Se usa como `alt` de la imagen y, si se muestra `fallback`, como `aria-label` del contenedor (`role="img"`) para no perder el nombre accesible.',
    },
    fill: {
      control: 'boolean',
      description:
        'Si `true`, ocupa el contenedor posicionado más cercano por completo (`position: absolute; inset: 0`), equivalente al `fill` de `next/image`.',
    },
    className: {
      control: 'text',
      description: 'Clases CSS adicionales, aplicadas a la imagen y al contenedor de `fallback`.',
    },
    fallback: {
      control: false,
      description: 'Contenido mostrado si no hay `src` o la imagen falla al cargar.',
    },
  },
  args: {
    alt: 'Avatar de usuario',
    className: '',
    fallback: <UserRoundIcon aria-hidden="true" />,
  },
} satisfies Meta<typeof BackendImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  name: 'Con imagen',
  args: {
    src: 'https://placehold.co/96x96',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole('img', { name: args.alt as string });

    await expect(image.tagName).toBe('IMG');
    await expect(image).toHaveAttribute('src', args.src as string);
  },
};

export const NoSrc: Story = {
  name: 'Sin src (fallback)',
  args: {
    src: null,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const fallback = canvas.getByRole('img', { name: args.alt as string });

    await expect(fallback.tagName).toBe('SPAN');
  },
};

export const Filled: Story = {
  name: 'Con fill (portada de card)',
  parameters: {
    docs: {
      description: {
        story: 'Uso típico en `BlogPostCard`/`BlogFeaturedPostCard`: ocupa un contenedor con `position: relative`.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ position: 'relative', width: 240, height: 160 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    src: 'https://placehold.co/480x320',
    fill: true,
  },
};

export const NoFallback: Story = {
  name: 'Sin fallback',
  parameters: {
    docs: {
      description: {
        story:
          'Sin `fallback`, el contenedor sigue mostrando `role="img"` con el `aria-label` de `alt`, pero queda vacío visualmente.',
      },
    },
  },
  args: {
    src: null,
    fallback: undefined,
  },
};

export const BrokenSrc: Story = {
  name: 'src roto (fallback tras error)',
  parameters: {
    docs: {
      description: {
        story:
          'Cuando `src` apunta a un recurso que ya no existe, la imagen dispara `onError` y se sustituye por `fallback`, sin perder el nombre accesible.',
      },
    },
  },
  args: {
    src: 'https://localhost/does-not-exist.png',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await waitFor(
      () => {
        const fallback = canvas.getByRole('img', { name: args.alt as string });
        expect(fallback.tagName).toBe('SPAN');
      },
      { timeout: 5000 },
    );
  },
};

export const KeyboardNotFocusable: Story = {
  name: 'No es un control interactivo',
  args: {
    src: 'https://placehold.co/96x96',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const image = await canvas.findByRole('img');

    await expect(image).not.toHaveAttribute('tabindex');
  },
};
