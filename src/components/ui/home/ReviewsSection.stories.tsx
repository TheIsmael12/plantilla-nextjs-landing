import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ReviewsSection from '@/components/ui/home/ReviewsSection';

const meta = {
  title: 'Components/UI/Home/ReviewsSection',
  component: ReviewsSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ReviewsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

