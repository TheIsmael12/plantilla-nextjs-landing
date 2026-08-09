import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BlogPagination from './BlogPagination';

const meta = {
  title: 'Components/UI/Blog/BlogPagination',
  component: BlogPagination,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/blog' },
    },
  },
  tags: ['autodocs'],
  args: {
    currentPage: 3,
    totalPages: 8,
  },
} satisfies Meta<typeof BlogPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FirstPage: Story = {
  name: 'Primera página',
  args: { currentPage: 1, totalPages: 8 },
};

export const LastPage: Story = {
  name: 'Última página',
  args: { currentPage: 8, totalPages: 8 },
};

export const FewPages: Story = {
  name: 'Pocas páginas (sin recorte de ventana)',
  args: { currentPage: 2, totalPages: 3 },
};

export const SinglePage: Story = {
  name: 'Una sola página (no se renderiza)',
  args: { currentPage: 1, totalPages: 1 },
};

export const WithActiveFilter: Story = {
  name: 'Con filtro de categoría activo (preservado en el href)',
  args: { currentPage: 2, totalPages: 5, searchParams: { category: 'limpieza' } },
};
