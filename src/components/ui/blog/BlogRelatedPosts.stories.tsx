import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { BlogPostListItem } from '@/types/blog/blog';

import BlogRelatedPosts from './BlogRelatedPosts';

const posts: BlogPostListItem[] = [
  {
    postId: 'a1b2c3d4-0000-0000-0000-000000000002',
    slug: 'mantenimiento-preventivo-vs-correctivo',
    title: 'Mantenimiento preventivo vs. correctivo: qué conviene a tu edificio',
    excerpt: 'Diferencias clave y cómo un plan preventivo reduce costes a largo plazo.',
    publishedAt: '2026-05-20T09:00:00.000Z',
    updatedAt: '2026-05-20T09:00:00.000Z',
    readingMinutes: 5,
    coverUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
    author: { slug: 'juan-perez', name: 'Juan Pérez' },
    category: { slug: 'mantenimiento', name: 'Mantenimiento' },
  },
  {
    postId: 'a1b2c3d4-0000-0000-0000-000000000003',
    slug: 'normativa-piscinas-comunitarias-2026',
    title: 'Normativa de piscinas comunitarias en 2026: lo que debes saber',
    excerpt: 'Repasamos los cambios normativos que afectan a piscinas de comunidades este año.',
    publishedAt: '2026-04-02T09:00:00.000Z',
    updatedAt: '2026-04-02T09:00:00.000Z',
    readingMinutes: 8,
    author: { slug: 'maria-lopez', name: 'María López' },
    category: { slug: 'piscinas', name: 'Piscinas' },
  },
];

const meta = {
  title: 'Components/UI/Blog/BlogRelatedPosts',
  component: BlogRelatedPosts,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    posts,
  },
} satisfies Meta<typeof BlogRelatedPosts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  name: 'Sin relacionados (no se renderiza)',
  args: { posts: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('heading')).not.toBeInTheDocument();
  },
};
