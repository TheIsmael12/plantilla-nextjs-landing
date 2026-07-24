import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HeroNativeAds from '@/components/ui/home/HeroNativeAds';

const meta = {
  title: 'Components/UI/Home/HeroNativeAds',
  component: HeroNativeAds,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HeroNativeAds>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

