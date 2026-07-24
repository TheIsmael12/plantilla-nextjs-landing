import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SupportChannels from '@/components/ui/support/SupportChannels';

const meta = {
  title: 'Components/UI/Support/SupportChannels',
  component: SupportChannels,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportChannels>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
