import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailOthers from '@/components/ui/services/ServiceDetailOthers';
import { SERVICE_SLUGS } from '@/config/routing';

const meta = {
  title: 'Components/UI/Services/ServiceDetailOthers',
  component: ServiceDetailOthers,
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
} satisfies Meta<typeof ServiceDetailOthers>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
