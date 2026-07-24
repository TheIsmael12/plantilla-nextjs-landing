import { fn } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ContactForm from '@/components/ui/contact/ContactForm';

const meta = {
  title: 'Components/UI/Contact/ContactForm',
  component: ContactForm,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onSubmit: fn(),
  },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Success: Story = {
  args: {
    success: true,
  },
};

export const WithError: Story = {
  args: {
    error: 'Ha ocurrido un error al enviar el mensaje. Inténtalo de nuevo.',
  },
};
