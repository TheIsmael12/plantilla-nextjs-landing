import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalLayout from '@/components/ui/legal/LegalLayout';
import LegalToc from '@/components/ui/legal/LegalToc';
import LegalSection from '@/components/ui/legal/LegalSection';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/LegalLayout',
  component: LegalLayout,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    // ReactNode args cannot be serialized by Storybook's indexer — control disabled
    toc: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
  },
} satisfies Meta<typeof LegalLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    toc: (
      <LegalToc
        title="En esta página"
        ariaLabel="Índice de contenidos"
        items={[
          { href: '#aceptacion', label: '1. Aceptación de los términos' },
          { href: '#servicios', label: '2. Descripción de los servicios' },
          { href: '#cuenta', label: '3. Cuenta de usuario' },
        ]}
      />
    ),
    children: (
      <>
        <LegalSection id="aceptacion" title="1. Aceptación de los términos">
          <p className="legal__section__text">
            Al acceder o utilizar los servicios de esta plataforma, confirmas que has leído,
            entendido y aceptado quedar vinculado por estos Términos y Condiciones.
          </p>
        </LegalSection>
        <LegalSection id="servicios" title="2. Descripción de los servicios">
          <p className="legal__section__text">
            Describimos aquí el alcance de los servicios de mantenimiento ofrecidos a las
            comunidades de propietarios.
          </p>
        </LegalSection>
        <LegalSection id="cuenta" title="3. Cuenta de usuario">
          <p className="legal__section__text">
            Eres responsable de mantener la confidencialidad de tus credenciales de acceso.
          </p>
        </LegalSection>
      </>
    ),
  },
};
