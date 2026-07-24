import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SupportHero from '@/components/ui/support/SupportHero';

const meta = {
  title: 'Components/UI/Support/SupportHero',
  component: SupportHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
