import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SupportInfo from '@/components/ui/support/SupportInfo';

const meta = {
  title: 'Components/UI/Support/SupportInfo',
  component: SupportInfo,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportInfo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
