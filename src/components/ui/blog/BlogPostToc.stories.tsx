import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { BlogHeading } from '@/types/blog/blog';

import BlogPostToc from './BlogPostToc';

const headings: BlogHeading[] = [
  { level: 2, text: 'Por qué importa elegir bien', anchor: 'por-que-importa-elegir-bien' },
  { level: 2, text: 'Certificaciones a comprobar', anchor: 'certificaciones-a-comprobar' },
  { level: 3, text: 'ISO 9001 y 14001', anchor: 'iso-9001-y-14001' },
  { level: 2, text: 'Preguntas antes de firmar', anchor: 'preguntas-antes-de-firmar' },
];

const meta = {
  title: 'Components/UI/Blog/BlogPostToc',
  component: BlogPostToc,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  args: {
    headings,
  },
} satisfies Meta<typeof BlogPostToc>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleHeading: Story = {
  name: 'Un solo encabezado (no se renderiza)',
  args: {
    headings: [{ level: 2, text: 'Introducción', anchor: 'introduccion' }],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.queryByRole('navigation')).not.toBeInTheDocument();
  },
};
