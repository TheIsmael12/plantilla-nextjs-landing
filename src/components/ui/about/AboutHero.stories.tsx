import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutHero from '@/components/ui/about/AboutHero';

const meta = {
  title: 'Components/UI/About/AboutHero',
  component: AboutHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
