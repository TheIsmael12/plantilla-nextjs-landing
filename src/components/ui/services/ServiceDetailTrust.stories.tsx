import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailTrust from '@/components/ui/services/ServiceDetailTrust';

const meta = {
  title: 'Components/UI/Services/ServiceDetailTrust',
  component: ServiceDetailTrust,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServiceDetailTrust>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
