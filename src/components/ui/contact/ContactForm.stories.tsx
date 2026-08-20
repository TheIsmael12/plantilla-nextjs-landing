import { expect, fn, userEvent, within } from 'storybook/test';
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

/**
 * El número de fincas solo aparece al elegir «administrador de fincas».
 *
 * Es la única parte del formulario que cambia de forma según lo contestado, así que es la que hay que
 * comprobar de verdad: preguntarle a un particular cuántas fincas gestiona no es solo raro, es un envío
 * que el backend rechaza con un 400.
 */
export const PropertyManagerAsksForCount: Story = {
  args: {},
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Antes de elegir nada, el campo no existe.
    expect(canvas.queryByLabelText(/fincas gestionas/i)).toBeNull();

    await userEvent.click(canvas.getByRole('combobox', { name: /quién nos escribe/i }));

    // El listbox del selector se porta a document.body, así que no está dentro del canvas de la historia.
    const listbox = within(document.body);
    await userEvent.click(await listbox.findByRole('option', { name: /administrador de fincas/i }));

    expect(await canvas.findByLabelText(/fincas gestionas/i)).toBeVisible();
  },
};
