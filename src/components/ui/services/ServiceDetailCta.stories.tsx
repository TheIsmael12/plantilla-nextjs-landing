import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServiceDetailCta from '@/components/ui/services/ServiceDetailCta';

const meta = {
  title: 'Components/UI/Services/ServiceDetailCta',
  component: ServiceDetailCta,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServiceDetailCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
