import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ServicesCarouselSection from '@/components/ui/home/ServicesCarouselSection';

const meta = {
  title: 'Components/UI/Home/ServicesCarouselSection',
  component: ServicesCarouselSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ServicesCarouselSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

