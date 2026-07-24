import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContactHero from '@/components/ui/contact/ContactHero';

const meta = {
  title: 'Components/UI/Contact/ContactHero',
  component: ContactHero,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContactHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
