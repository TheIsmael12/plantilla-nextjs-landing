import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeCtaPrimary from '@/components/ui/home/HomeCtaPrimary';

const meta = {
  title: 'Components/UI/Home/HomeCtaPrimary',
  component: HomeCtaPrimary,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HomeCtaPrimary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
