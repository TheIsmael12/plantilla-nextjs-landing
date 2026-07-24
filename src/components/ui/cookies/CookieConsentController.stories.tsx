import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CookieConsentController from '@/components/ui/cookies/CookieConsentController';

const meta = {
  title: 'Components/UI/Cookies/CookieConsentController',
  component: CookieConsentController,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Panel de consentimiento de cookies RGPD/ePrivacy. Se muestra como un card compacto en la esquina inferior derecha. Permite aceptar todo, rechazar opcionales o personalizar categoría a categoría.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('na:cookie-consent');
      }
      return (
        <div
          style={{
            minHeight: '100vh',
            background: 'var(--background-color, #f9fafb)',
            padding: '2rem',
            position: 'relative',
          }}
        >
          <p style={{ color: 'var(--neutral-color, #6b7280)', fontSize: '0.875rem', maxWidth: '32rem' }}>
            Página de ejemplo — el banner aparece en la esquina inferior derecha.
          </p>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof CookieConsentController>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Banner inicial: sin consentimiento previo almacenado. Muestra el panel compacto. */
export const BannerDefault: Story = {
  name: 'Banner — sin consentimiento previo',
};

/** Panel expandido con las categorías visibles desde el primer render. */
export const BannerExpanded: Story = {
  name: 'Banner — preferencias expandidas',
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('na:cookie-consent');
        // Simulate click on "Personalizar" toggle after mount
        setTimeout(() => {
          const btn = document.querySelector<HTMLButtonElement>('.cookie-consent__toggle');
          btn?.click();
        }, 200);
      }
      return <Story />;
    },
  ],
};

/** Se dispara el evento `na:open-cookie-consent` desde código externo (p.ej. enlace del footer). */
export const OpenedViaEvent: Story = {
  name: 'Abierto mediante evento externo',
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('na:cookie-consent');
        setTimeout(() => window.dispatchEvent(new Event('na:open-cookie-consent')), 150);
      }
      return <Story />;
    },
  ],
};

/** Estado en el que ya existe consentimiento guardado: el banner no aparece. */
export const WithConsentStored: Story = {
  name: 'Con consentimiento guardado (sin banner)',
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'na:cookie-consent',
          JSON.stringify({ analytics: true, marketing: false, functional: true, timestamp: Date.now() }),
        );
      }
      return <Story />;
    },
  ],
};

/** Revisión de preferencias: el banner se reabre con los valores ya guardados. */
export const ReviewExistingConsent: Story = {
  name: 'Revisión — re-abrir con valores guardados',
  decorators: [
    (Story) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'na:cookie-consent',
          JSON.stringify({ analytics: true, marketing: false, functional: true, timestamp: Date.now() }),
        );
        setTimeout(() => window.dispatchEvent(new Event('na:open-cookie-consent')), 150);
      }
      return <Story />;
    },
  ],
};
