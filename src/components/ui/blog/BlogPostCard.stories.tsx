import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { BlogPostListItem } from '@/types/blog/blog';

import BlogPostCard from './BlogPostCard';

const basePost: BlogPostListItem = {
  postId: 'a1b2c3d4-0000-0000-0000-000000000001',
  slug: 'como-elegir-empresa-de-limpieza-para-tu-comunidad',
  title: 'Cómo elegir la empresa de limpieza adecuada para tu comunidad',
  excerpt:
    'Repasamos los criterios clave (certificaciones, seguros, personal propio) para elegir un proveedor de limpieza fiable para tu comunidad de vecinos o edificio.',
  publishedAt: '2026-06-12T09:00:00.000Z',
  updatedAt: '2026-06-14T10:00:00.000Z',
  readingMinutes: 6,
  coverUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80',
  coverImageAlt: 'Equipo de limpieza profesional trabajando en un portal',
  author: { slug: 'maria-lopez', name: 'María López' },
  category: { slug: 'limpieza', name: 'Limpieza' },
};

const meta = {
  title: 'Components/UI/Blog/BlogPostCard',
  component: BlogPostCard,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 380 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  args: {
    post: basePost,
  },
} satisfies Meta<typeof BlogPostCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCover: Story = {
  name: 'Sin portada',
  args: {
    post: { ...basePost, coverUrl: undefined, coverImageAlt: undefined },
  },
};

export const WithoutCategory: Story = {
  name: 'Sin categoría',
  args: {
    post: { ...basePost, category: undefined },
  },
};

export const LongExcerpt: Story = {
  name: 'Extracto largo (truncado a 3 líneas)',
  args: {
    post: {
      ...basePost,
      excerpt:
        'Repasamos los criterios clave —certificaciones, seguros, personal propio frente a subcontratado, protocolos de calidad y disponibilidad de sustituciones— que deberías comprobar antes de firmar con cualquier empresa de limpieza para tu comunidad de vecinos, edificio o negocio, con ejemplos reales de contratos y preguntas que hacer antes de decidir.',
    },
  },
};
