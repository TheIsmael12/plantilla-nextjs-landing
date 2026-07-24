import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TrustBarSection from '@/components/ui/home/TrustBarSection';

const meta = {
  title: 'Components/UI/Home/TrustBarSection',
  component: TrustBarSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TrustBarSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
