import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { JOB_FILTERS } from './careers.fixtures';

import JobFilters from './JobFilters';

const meta = {
    title: 'Components/UI/Careers/JobFilters',
    component: JobFilters,
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
        filters: JOB_FILTERS,
        activeFilters: {},
        resultCount: JOB_FILTERS.totalJobs,
    },
} satisfies Meta<typeof JobFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Estado inicial: el panel está plegado. En móvil, seis grupos de chips desplegados dejarían la primera
 * oferta fuera de pantalla.
 */
export const Default: Story = {
    name: 'Plegado, sin filtros',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const toggle = canvas.getByRole('button', { name: 'Ver filtros' });
        expect(toggle).toHaveAttribute('aria-expanded', 'false');
    },
};

/**
 * El panel abierto. Se comprueba que los chips llevan el contador **dentro** de la propia etiqueta: es lo
 * que hace que un lector de pantalla lea «Getafe 2» junto y no dos textos sueltos.
 */
export const Open: Story = {
    name: 'Panel abierto',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const toggle = canvas.getByRole('button', { name: 'Ver filtros' });
        await userEvent.click(toggle);

        expect(toggle).toHaveAttribute('aria-expanded', 'true');
        expect(canvas.getByRole('button', { name: /Getafe 2/ })).toBeInTheDocument();
    },
};

/**
 * Con filtros puestos. La fila de filtros aplicados **no** se pliega: es la que dice qué se está viendo y
 * por dónde quitarlo, y esconderla es lo que hace que alguien crea que el buscador está roto.
 */
export const WithActiveFilters: Story = {
    name: 'Con filtros aplicados',
    args: {
        activeFilters: { citySlug: ['getafe'], contractSlug: 'indefinido', experience: 'UP_TO_1' },
        resultCount: 2,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByText('Filtros activos')).toBeInTheDocument();
        expect(canvas.getByRole('button', { name: 'Quitar todos' })).toBeInTheDocument();
    },
};

/**
 * Ningún resultado con los filtros puestos. El recuento se anuncia en una región `aria-live`: sin eso, con
 * lector de pantalla el filtro parece no hacer nada.
 */
export const NoResults: Story = {
    name: 'Sin resultados',
    args: {
        activeFilters: { citySlug: ['leganes'], categorySlug: 'limpieza' },
        resultCount: 0,
    },
};
