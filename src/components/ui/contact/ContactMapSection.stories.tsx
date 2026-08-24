import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { ENV } from '@/config/env';
import { COMPANY_ADDRESS_SHORT } from '@/utils/companyAddressUtils';
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

// Override: demuestra que se pueden sobreescribir los defaults de ENV. La dirección va en una sola
// prop y ya formateada, que es como se escribe: calle, código postal y municipio en la misma línea.
export const Override: Story = {
  args: {
    address: 'Avda. Diagonal 477, 08036 Barcelona',
    phone: '+34 930 456 789',
    email: 'bcn@empresa.com',
    schedule: 'Lun – Sáb, 10:00 – 20:00',
  },
};

// WithoutSchedule: sin horario
export const WithoutSchedule: Story = {
  args: {
    address: COMPANY_ADDRESS_SHORT,
    phone: ENV.COMPANY_PHONE,
    email: ENV.COMPANY_EMAIL,
    schedule: undefined,
  },
};

