import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LoginForm from './LoginForm';

const meta = {
  title: 'Components/UI/Auth/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
      navigation: { pathname: '/login' },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof LoginForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
