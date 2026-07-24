import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalToc from '@/components/ui/legal/LegalToc';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/LegalToc',
  component: LegalToc,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div style={{ maxWidth: '280px' }}><Story /></div>,
  ],
} satisfies Meta<typeof LegalToc>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'En esta página',
    ariaLabel: 'Índice de contenidos',
    items: [
      { href: '#aceptacion', label: '1. Aceptación de los términos' },
      { href: '#servicios', label: '2. Descripción de los servicios' },
      { href: '#cuenta', label: '3. Cuenta de usuario' },
      { href: '#uso-aceptable', label: '4. Uso aceptable' },
      { href: '#propiedad', label: '5. Propiedad intelectual' },
      { href: '#pagos', label: '6. Pagos y facturación' },
      { href: '#privacidad', label: '7. Privacidad' },
      { href: '#garantias', label: '8. Garantías y responsabilidad' },
      { href: '#contacto', label: '9. Contacto' },
    ],
  },
};
