import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HelpTopics from '@/components/ui/help/HelpTopics';

const meta = {
  title: 'Components/UI/Help/HelpTopics',
  component: HelpTopics,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof HelpTopics>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
