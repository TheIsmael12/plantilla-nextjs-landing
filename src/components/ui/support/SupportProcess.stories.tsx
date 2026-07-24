import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SupportProcess from '@/components/ui/support/SupportProcess';

const meta = {
  title: 'Components/UI/Support/SupportProcess',
  component: SupportProcess,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportProcess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
