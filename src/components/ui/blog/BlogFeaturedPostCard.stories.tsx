import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { BlogPostListItem } from '@/types/blog/blog';

import BlogFeaturedPostCard from './BlogFeaturedPostCard';

const basePost: BlogPostListItem = {
  postId: 'a1b2c3d4-0000-0000-0000-000000000001',
  slug: 'como-elegir-empresa-de-limpieza-para-tu-comunidad',
  title: 'Cómo elegir la empresa de limpieza adecuada para tu comunidad',
  excerpt:
    'Repasamos los criterios clave (certificaciones, seguros, personal propio) para elegir un proveedor de limpieza fiable para tu comunidad de vecinos o edificio.',
  publishedAt: '2026-06-12T09:00:00.000Z',
  updatedAt: '2026-06-14T10:00:00.000Z',
  readingMinutes: 6,
  coverUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80',
  coverImageAlt: 'Equipo de limpieza profesional trabajando en un portal',
  author: { slug: 'maria-lopez', name: 'María López' },
  category: { slug: 'limpieza', name: 'Limpieza' },
};

const meta = {
  title: 'Components/UI/Blog/BlogFeaturedPostCard',
  component: BlogFeaturedPostCard,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/blog' },
    },
  },
  tags: ['autodocs'],
  args: {
    post: basePost,
  },
} satisfies Meta<typeof BlogFeaturedPostCard>;

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
