import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AboutCertifications from '@/components/ui/about/AboutCertifications';

/*
 * La story sale en blanco a propósito, y no es un fallo del componente.
 *
 * `AboutCertifications` solo pinta las normas listadas en `HELD_CERTIFICATIONS`, que hoy está vacía porque
 * Imora aún no tiene ninguna. Para ver la maqueta con sellos hay que añadir a esa lista una norma de verdad
 * — que es exactamente la fricción que se busca: la única forma de verlo pintado es que sea cierto.
 */
const meta = {
  title: 'Components/UI/About/AboutCertifications',
  component: AboutCertifications,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof AboutCertifications>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
