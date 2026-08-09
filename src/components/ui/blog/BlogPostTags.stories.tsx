import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { BlogTaxonomyRef } from '@/types/blog/blog';

import BlogPostTags from './BlogPostTags';

const tags: BlogTaxonomyRef[] = [
  { slug: 'normativa', name: 'Normativa' },
  { slug: 'ahorro', name: 'Ahorro' },
  { slug: 'sostenibilidad', name: 'Sostenibilidad' },
];

const meta = {
  title: 'Components/UI/Blog/BlogPostTags',
  component: BlogPostTags,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/blog/[slug]' },
    },
  },
  tags: ['autodocs'],
  args: {
    tags,
  },
} satisfies Meta<typeof BlogPostTags>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NoTags: Story = {
  name: 'Sin tags (no se renderiza)',
  args: { tags: [] },
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.blog__post-tags')).not.toBeInTheDocument();
  },
};
