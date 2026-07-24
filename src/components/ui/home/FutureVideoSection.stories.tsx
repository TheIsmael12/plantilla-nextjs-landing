import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FutureVideoSection from '@/components/ui/home/FutureVideoSection';

const meta = {
  title: 'Components/UI/Home/FutureVideoSection',
  component: FutureVideoSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FutureVideoSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

