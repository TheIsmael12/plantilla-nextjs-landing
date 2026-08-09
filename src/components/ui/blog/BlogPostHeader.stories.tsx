import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { BlogPostDetail } from '@/types/blog/blog';

import BlogPostHeader from './BlogPostHeader';

const basePost: BlogPostDetail = {
  postId: 'a1b2c3d4-0000-0000-0000-000000000001',
  slug: 'como-elegir-empresa-de-limpieza-para-tu-comunidad',
  title: 'Cómo elegir la empresa de limpieza adecuada para tu comunidad',
  excerpt: 'Repasamos los criterios clave para elegir un proveedor de limpieza fiable.',
  publishedAt: '2026-06-12T09:00:00.000Z',
  updatedAt: '2026-06-14T10:00:00.000Z',
  readingMinutes: 6,
  coverUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1600&q=80',
  coverImageAlt: 'Equipo de limpieza profesional trabajando en un portal',
  author: { slug: 'maria-lopez', name: 'María López' },
  category: { slug: 'limpieza', name: 'Limpieza' },
  locale: 'es',
  body: '',
  seoTitle: '',
  seoDescription: '',
  noindex: false,
  wordCount: 1200,
  headings: [],
  aiGenerated: false,
  tags: [],
  availableLocales: [{ locale: 'es', slug: 'como-elegir-empresa-de-limpieza-para-tu-comunidad' }],
};

const meta = {
  title: 'Components/UI/Blog/BlogPostHeader',
  component: BlogPostHeader,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/blog/[slug]' },
    },
  },
  tags: ['autodocs'],
  args: {
    post: basePost,
  },
} satisfies Meta<typeof BlogPostHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutCover: Story = {
  name: 'Sin portada',
  args: {
    post: { ...basePost, coverUrl: undefined, coverImageAlt: undefined },
  },
};
