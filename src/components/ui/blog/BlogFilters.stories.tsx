import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { BlogTaxonomy } from '@/types/blog/blog';

import BlogFilters from './BlogFilters';

const categories: BlogTaxonomy[] = [
  { slug: 'limpieza', name: 'Limpieza', postCount: 12 },
  { slug: 'mantenimiento', name: 'Mantenimiento', postCount: 8 },
  { slug: 'seguridad', name: 'Seguridad', postCount: 5 },
  { slug: 'jardineria', name: 'Jardinería', postCount: 3 },
];

const tags: BlogTaxonomy[] = [
  { slug: 'normativa', name: 'Normativa', postCount: 6 },
  { slug: 'ahorro', name: 'Ahorro', postCount: 4 },
  { slug: 'sostenibilidad', name: 'Sostenibilidad', postCount: 3 },
];

const meta = {
  title: 'Components/UI/Blog/BlogFilters',
  component: BlogFilters,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/blog' },
    },
  },
  tags: ['autodocs'],
  args: {
    categories,
    tags,
  },
} satisfies Meta<typeof BlogFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithActiveCategory: Story = {
  name: 'Con categoría activa',
  args: { activeCategory: 'mantenimiento' },
};

export const WithActiveTag: Story = {
  name: 'Con tag activo',
  args: { activeTag: 'normativa' },
};

export const OnlyCategories: Story = {
  name: 'Solo categorías (sin tags)',
  args: { tags: [] },
};

export const NoCategoriesOrTags: Story = {
  name: 'Sin categorías ni tags (no se renderiza)',
  args: { categories: [], tags: [] },
};
