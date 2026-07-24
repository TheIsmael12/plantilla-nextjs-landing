import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContactDepartments from '@/components/ui/contact/ContactDepartments';

const meta = {
  title: 'Components/UI/Contact/ContactDepartments',
  component: ContactDepartments,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ContactDepartments>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
