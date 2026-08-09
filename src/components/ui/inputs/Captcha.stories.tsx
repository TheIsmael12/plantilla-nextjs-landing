import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';

import Captcha from './Captcha';

const meta = {
  title: 'Components/UI/Inputs/Captcha',
  component: Captcha,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Widget de Cloudflare Turnstile del formulario de contacto público. Sin `NEXT_PUBLIC_TURNSTILE_SITE_KEY` configurada (el caso por defecto en Storybook), el componente no renderiza nada — comportamiento intencional, no un fallo: el backend acepta envíos sin `captchaToken`.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    onVerify: fn(),
    onExpire: fn(),
  },
} satisfies Meta<typeof Captcha>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithoutSiteKey: Story = {
  name: 'Sin site key (no renderiza nada)',
  play: async ({ canvasElement }) => {
    expect(canvasElement.querySelector('.captcha')).not.toBeInTheDocument();
  },
};
