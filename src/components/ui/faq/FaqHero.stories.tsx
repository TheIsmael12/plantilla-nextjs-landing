import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FaqHero from '@/components/ui/faq/FaqHero';

const meta = {
  title: 'Components/UI/Faq/FaqHero',
  component: FaqHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FaqHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
