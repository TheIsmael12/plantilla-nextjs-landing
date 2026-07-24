import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ManageCookiesButton from '@/components/ui/legal/ManageCookiesButton';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/ManageCookiesButton',
  component: ManageCookiesButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    label: 'Gestionar preferencias de cookies',
  },
} satisfies Meta<typeof ManageCookiesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
