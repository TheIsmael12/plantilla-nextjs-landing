import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FeatureMosaicSection from '@/components/ui/home/FeatureMosaicSection';

const meta = {
  title: 'Components/UI/Home/FeatureMosaicSection',
  component: FeatureMosaicSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FeatureMosaicSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

