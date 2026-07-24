import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Footer from '@/components/ui/navigation/Footer';

const meta = {
  title: 'Components/UI/Navigation/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
