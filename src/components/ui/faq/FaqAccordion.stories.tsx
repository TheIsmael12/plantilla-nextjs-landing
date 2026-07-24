import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FaqAccordion from '@/components/ui/faq/FaqAccordion';

const meta = {
  title: 'Components/UI/Faq/FaqAccordion',
  component: FaqAccordion,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FaqAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
