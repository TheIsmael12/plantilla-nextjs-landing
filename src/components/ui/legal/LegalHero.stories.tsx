import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ScrollTextIcon, ShieldIcon, CookieIcon } from 'lucide-react';

import LegalHero from '@/components/ui/legal/LegalHero';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/LegalHero',
  component: LegalHero,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
  argTypes: {
    // ReactNode args cannot be serialized by Storybook's indexer — control disabled
    icon: { control: false, table: { disable: true } },
  },
  args: {
    updatedAtLabel: 'Última actualización:',
    updatedDate: '1 de enero de 2025',
  },
} satisfies Meta<typeof LegalHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Terms: Story = {
  name: 'Términos y Condiciones',
  args: {
    variant: 'terms',
    icon: <ScrollTextIcon size={32} strokeWidth={1.5} />,
    title: 'Términos y Condiciones',
    subtitle:
      'Lee detenidamente estos términos antes de usar nuestros servicios. Al acceder y utilizar la plataforma, aceptas quedar vinculado por estas condiciones.',
  },
};

export const Privacy: Story = {
  name: 'Política de Privacidad',
  args: {
    variant: 'privacy',
    icon: <ShieldIcon size={32} strokeWidth={1.5} />,
    title: 'Política de Privacidad',
    subtitle:
      'Tu privacidad es nuestra prioridad. Aquí encontrarás toda la información sobre cómo recopilamos, usamos y protegemos tus datos personales.',
  },
};

export const Cookies: Story = {
  name: 'Política de Cookies',
  args: {
    variant: 'cookies',
    icon: <CookieIcon size={32} strokeWidth={1.5} />,
    title: 'Política de Cookies',
    subtitle: 'Utilizamos cookies y tecnologías similares para mejorar tu experiencia.',
  },
};
