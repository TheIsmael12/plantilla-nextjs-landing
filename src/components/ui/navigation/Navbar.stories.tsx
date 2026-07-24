import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Navbar from '@/components/ui/navigation/Navbar';

const meta = {
  title: 'Components/UI/Navigation/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ServicesPage: Story = {
  name: 'Con ruta activa (Servicios)',
  parameters: {
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/services' },
    },
  },
};
