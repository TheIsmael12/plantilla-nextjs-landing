import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HelpHero from '@/components/ui/help/HelpHero';

const meta = {
  title: 'Components/UI/Help/HelpHero',
  component: HelpHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HelpHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
