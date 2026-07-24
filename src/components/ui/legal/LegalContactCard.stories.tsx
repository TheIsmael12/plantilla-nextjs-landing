import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalContactCard from '@/components/ui/legal/LegalContactCard';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/LegalContactCard',
  component: LegalContactCard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div style={{ maxWidth: '500px' }}><Story /></div>,
  ],
  args: {
    children: (
      <>
        <p><strong>Imora Servicios S.L.</strong></p>
        <p>CIF: B12345678</p>
        <p>Email legal: <a href="mailto:legal@imora.es" className="legal__link">legal@imora.es</a></p>
        <p>Dirección: Calle Ejemplo 123, Madrid</p>
      </>
    ),
  },
} satisfies Meta<typeof LegalContactCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DPO: Story = {
  args: {
    children: (
      <>
        <p><strong>Delegado de Protección de Datos</strong></p>
        <p>Email: <a href="mailto:privacy@imora.es" className="legal__link">privacy@imora.es</a></p>
        <p>Dirección: Calle Ejemplo 123, Madrid</p>
      </>
    ),
  },
};
