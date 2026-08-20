import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import JobEmptyState from './JobEmptyState';

const meta = {
    title: 'Components/UI/Careers/JobEmptyState',
    component: JobEmptyState,
    parameters: {
        layout: 'padded',
        // Los componentes de empleo enlazan con `Link` de next-intl, que necesita el enrutador del
        // App Router montado: sin esto, la historia revienta con "expected app router to be mounted".
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo' },
        },
    },
    tags: ['autodocs'],
    args: {
        hasFilters: false,
    },
} satisfies Meta<typeof JobEmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * No hay ninguna oferta abierta. La salida es la candidatura espontánea: es lo único útil que se le puede
 * ofrecer a alguien que ha llegado buscando trabajo y no hay procesos en marcha.
 */
export const NoJobs: Story = {
    name: 'No hay ofertas abiertas',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByText('Ahora mismo no hay ofertas abiertas')).toBeInTheDocument();
        expect(canvas.getByRole('link', { name: 'Dejar mi candidatura' })).toBeInTheDocument();
    },
};

/**
 * Hay ofertas, pero los filtros no dejan ninguna. Es un texto distinto y con otra salida —quitar los
 * filtros— porque el problema es distinto: decirle «no hay ofertas» a quien acaba de filtrar por una ciudad
 * sin procesos sería falso.
 */
export const NoResults: Story = {
    name: 'Ninguna encaja con los filtros',
    args: {
        hasFilters: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByText('Ninguna oferta encaja con lo que buscas')).toBeInTheDocument();
        expect(canvas.getByRole('link', { name: 'Quitar los filtros' })).toBeInTheDocument();
    },
};
