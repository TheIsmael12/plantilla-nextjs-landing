import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LegalSection from '@/components/ui/legal/LegalSection';
import LegalHighlight from '@/components/ui/legal/LegalHighlight';
import '@/styles/04-components/legal/legal.scss';

const meta = {
  title: 'Components/UI/Legal/LegalSection',
  component: LegalSection,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div style={{ maxWidth: '720px' }}><Story /></div>,
  ],
  args: {
    id: 'section-demo',
    title: '1. Aceptación de los términos',
  },
} satisfies Meta<typeof LegalSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithText: Story = {
  args: {
    children: (
      <>
        <p className="legal__section__text">
          Al acceder o utilizar los servicios de esta plataforma, confirmas que has leído,
          entendido y aceptado quedar vinculado por estos Términos y Condiciones.
        </p>
        <p className="legal__section__text">
          Si no estás de acuerdo con alguna parte de estos términos, no podrás acceder al servicio.
        </p>
      </>
    ),
  },
};

export const WithList: Story = {
  args: {
    title: '4. Uso aceptable',
    children: (
      <>
        <p className="legal__section__text">Al utilizar nuestros servicios, aceptas no realizar ninguna de las siguientes acciones:</p>
        <ul className="legal__section__list">
          <li>Publicar contenido ilegal, difamatorio o dañino.</li>
          <li>Infringir los derechos de propiedad intelectual de terceros.</li>
          <li>Intentar acceder de manera no autorizada a los servicios.</li>
        </ul>
        <LegalHighlight variant="warning">
          <p>El incumplimiento puede resultar en la suspensión inmediata de tu cuenta.</p>
        </LegalHighlight>
      </>
    ),
  },
};

export const WithSubtitles: Story = {
  args: {
    title: '3. Cuenta de usuario',
    children: (
      <>
        <h3 className="legal__section__subtitle">Registro y responsabilidades</h3>
        <ul className="legal__section__list">
          <li>Debes proporcionar información precisa y actualizada.</li>
          <li>Eres responsable de mantener la confidencialidad de tus credenciales.</li>
        </ul>
        <h3 className="legal__section__subtitle">Seguridad de la cuenta</h3>
        <p className="legal__section__text">
          Implementamos medidas de seguridad razonables. Te recomendamos usar contraseñas únicas y complejas.
        </p>
      </>
    ),
  },
};
