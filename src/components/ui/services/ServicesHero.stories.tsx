import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServicesHero from '@/components/ui/services/ServicesHero';

const meta = {
  title: 'Components/UI/Services/ServicesHero',
  component: ServicesHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServicesHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
