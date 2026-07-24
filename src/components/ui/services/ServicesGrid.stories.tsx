import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServicesGrid from '@/components/ui/services/ServicesGrid';

const meta = {
  title: 'Components/UI/Services/ServicesGrid',
  component: ServicesGrid,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/services' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServicesGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
