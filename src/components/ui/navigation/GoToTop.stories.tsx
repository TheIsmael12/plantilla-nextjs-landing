import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, waitFor, within } from 'storybook/test';

import GoToTop from '@/components/ui/navigation/GoToTop';

const meta = {
  title: 'Components/UI/Navigation/GoToTop',
  component: GoToTop,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Botón flotante para volver al principio de la página: solo aparece (opacidad y `pointer-events`) tras superar 480px de scroll vertical.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '1200px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GoToTop>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hidden: Story = {
  name: 'Oculto (sin scroll)',
};

export const VisibleAfterScroll: Story = {
  name: 'Visible tras hacer scroll',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { hidden: true });

    window.dispatchEvent(new Event('scroll'));
    Object.defineProperty(window, 'scrollY', { value: 600, configurable: true });
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => expect(button).toHaveClass('go-to-top--visible'));
  },
};
