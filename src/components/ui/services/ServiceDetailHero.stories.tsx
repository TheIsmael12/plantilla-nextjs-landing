import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailHero from '@/components/ui/services/ServiceDetailHero';
import { SERVICE_SLUGS } from '@/config/routing';

const meta = {
  title: 'Components/UI/Services/ServiceDetailHero',
  component: ServiceDetailHero,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/services/cleaning' },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    slug: {
      control: 'select',
      options: SERVICE_SLUGS,
    },
  },
  args: {
    slug: 'cleaning',
  },
} satisfies Meta<typeof ServiceDetailHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Concierge: Story = {
  name: 'Conserjería',
  args: { slug: 'concierge' },
};

export const Security: Story = {
  name: 'Seguridad',
  args: { slug: 'security' },
};
