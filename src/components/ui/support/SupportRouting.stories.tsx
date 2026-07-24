import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SupportRouting from '@/components/ui/support/SupportRouting';

const meta = {
  title: 'Components/UI/Support/SupportRouting',
  component: SupportRouting,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/help/support' },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SupportRouting>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
