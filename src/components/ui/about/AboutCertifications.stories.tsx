import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutCertifications from '@/components/ui/about/AboutCertifications';

const meta = {
  title: 'Components/UI/About/AboutCertifications',
  component: AboutCertifications,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutCertifications>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
