import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ExpansionMapSection from '@/components/ui/home/ExpansionMapSection';

const meta = {
  title: 'Components/UI/Home/ExpansionMapSection',
  component: ExpansionMapSection,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ExpansionMapSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

