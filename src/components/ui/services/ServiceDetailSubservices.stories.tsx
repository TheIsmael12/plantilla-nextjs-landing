import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailSubservices from '@/components/ui/services/ServiceDetailSubservices';
import { SERVICE_SLUGS } from '@/config/routing';

const meta = {
  title: 'Components/UI/Services/ServiceDetailSubservices',
  component: ServiceDetailSubservices,
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
} satisfies Meta<typeof ServiceDetailSubservices>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
