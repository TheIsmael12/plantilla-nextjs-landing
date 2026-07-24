import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutValues from '@/components/ui/about/AboutValues';

const meta = {
  title: 'Components/UI/About/AboutValues',
  component: AboutValues,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutValues>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
