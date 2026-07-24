import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ENV } from '@/config/env';
import ContactMapSection from '@/components/ui/contact/ContactMapSection';

const meta = {
  title: 'Components/UI/Contact/ContactMapSection',
  component: ContactMapSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ContactMapSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default: usa los valores de ENV directamente (sin pasar args)
export const Default: Story = {
  args: {},
};

// Override: demuestra que se pueden sobreescribir los defaults de ENV
export const Override: Story = {
  args: {
    address: 'Avda. Diagonal 477',
    city: 'Barcelona, 08036',
    phone: '+34 930 456 789',
    email: 'bcn@empresa.com',
    schedule: 'Lun – Sáb, 10:00 – 20:00',
  },
};

// WithoutSchedule: sin horario
export const WithoutSchedule: Story = {
  args: {
    address: ENV.COMPANY_ADDRESS,
    city: `${ENV.COMPANY_CITY}, ${ENV.COMPANY_POSTAL_CODE}`,
    phone: ENV.COMPANY_PHONE,
    email: ENV.COMPANY_EMAIL,
    schedule: undefined,
  },
};

