import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailProcess from '@/components/ui/services/ServiceDetailProcess';

const meta = {
  title: 'Components/UI/Services/ServiceDetailProcess',
  component: ServiceDetailProcess,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServiceDetailProcess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
