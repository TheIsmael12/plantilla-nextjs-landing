import '../src/styles/globals.scss';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';

import type { Preview } from '@storybook/nextjs-vite';

import esMessages from '../src/i18n/locales/es';
import enMessages from '../src/i18n/locales/en';

const allMessages: Record<string, Record<string, unknown>> = { es: esMessages, en: enMessages };

const preview: Preview = {
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Idioma de la aplicación',
      defaultValue: 'es',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'es', title: 'Español' },
          { value: 'en', title: 'English' },
        ],
        dynamicTitle: true,
      },
    },
    theme: {
      name: 'Theme',
      description: 'Tema de la aplicación',
      defaultValue: 'light',
      toolbar: {
        icon: 'sun',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },

  decorators: [
    (Story, context) => {
      const locale = context.globals.locale;
      const theme = context.globals.theme;

      return (
        <NextIntlClientProvider locale={locale} messages={allMessages[locale] ?? esMessages}>
          <ThemeProvider attribute="data-theme" forcedTheme={theme} enableSystem={false}>
            <Story />
          </ThemeProvider>
        </NextIntlClientProvider>
      );
    },
  ],

  parameters: {
    backgrounds: {
      disabled: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'error',
    },
  },
};

export default preview;