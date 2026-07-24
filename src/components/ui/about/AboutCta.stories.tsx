import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutCta from '@/components/ui/about/AboutCta';

const meta = {
  title: 'Components/UI/About/AboutCta',
  component: AboutCta,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
