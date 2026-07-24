import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailFaq from '@/components/ui/services/ServiceDetailFaq';
import { SERVICE_SLUGS } from '@/config/routing';

const meta = {
  title: 'Components/UI/Services/ServiceDetailFaq',
  component: ServiceDetailFaq,
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
} satisfies Meta<typeof ServiceDetailFaq>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
