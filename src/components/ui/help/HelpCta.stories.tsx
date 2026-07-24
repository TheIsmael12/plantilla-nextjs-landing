import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HelpCta from '@/components/ui/help/HelpCta';

const meta = {
  title: 'Components/UI/Help/HelpCta',
  component: HelpCta,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    eyebrow: '¿No encuentras lo que buscas?',
    title: 'Habla directamente con nuestro equipo',
    buttonLabel: 'Contactar',
    href: '/contact',
  },
} satisfies Meta<typeof HelpCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Faq: Story = {
  name: 'Cierre de FAQ',
  args: {
    eyebrow: '¿Sigues con dudas?',
    title: '¿No encuentras la respuesta que buscas?',
    buttonLabel: 'Contáctanos',
    href: '/contact',
  },
};
