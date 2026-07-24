import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutApproach from '@/components/ui/about/AboutApproach';

const meta = {
  title: 'Components/UI/About/AboutApproach',
  component: AboutApproach,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutApproach>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
