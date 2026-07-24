import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalHighlight from '@/components/ui/legal/LegalHighlight';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/LegalHighlight',
  component: LegalHighlight,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div style={{ maxWidth: '640px' }}><Story /></div>,
  ],
} satisfies Meta<typeof LegalHighlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: {
    variant: 'info',
    children: (
      <p>
        <strong>Base legal:</strong> El tratamiento de tus datos se basa en el consentimiento,
        la ejecución del contrato y el interés legítimo.
      </p>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <p>
        El incumplimiento de estas condiciones puede resultar en la suspensión inmediata de
        tu cuenta y podríamos emprender acciones legales si fuera necesario.
      </p>
    ),
  },
};
