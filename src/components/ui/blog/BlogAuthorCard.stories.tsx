import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { BlogAuthorDetail } from '@/types/blog/blog';

import BlogAuthorCard from './BlogAuthorCard';

const baseAuthor: BlogAuthorDetail = {
  slug: 'maria-lopez',
  name: 'María López',
  bio: 'Responsable de calidad en Imora, especializada en protocolos de limpieza y mantenimiento para comunidades de propietarios.',
  avatarUrl: 'https://i.pravatar.cc/128?img=47',
  linkedinUrl: 'https://linkedin.com/in/example',
  websiteUrl: 'https://example.com',
};

const meta = {
  title: 'Components/UI/Blog/BlogAuthorCard',
  component: BlogAuthorCard,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/blog/[slug]' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  args: {
    author: baseAuthor,
  },
} satisfies Meta<typeof BlogAuthorCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutAvatar: Story = {
  name: 'Sin avatar',
  args: {
    author: { ...baseAuthor, avatarUrl: undefined },
  },
};

export const MinimalInfo: Story = {
  name: 'Solo nombre (sin bio ni enlaces)',
  args: {
    author: { slug: 'juan-perez', name: 'Juan Pérez' },
  },
};
