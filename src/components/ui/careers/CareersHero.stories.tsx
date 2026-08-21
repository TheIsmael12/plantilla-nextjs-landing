import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import CareersHero from './CareersHero';

const meta = {
    title: 'Components/UI/Careers/CareersHero',
    component: CareersHero,
    parameters: {
        layout: 'fullscreen',
        nextjs: { appDirectory: true, navigation: { pathname: '/empleo' } },
        docs: {
            description: {
                component:
                    'Cabecera de «Trabaja con nosotros», con el mismo patrón que las demás cabeceras de listado de la web: fondo `surface` con línea inferior, contenido centrado, antetítulo con el nombre de la sección y la forma decorativa abajo a la derecha. Llevaba un degradado que no usa ninguna otra página.',
            },
        },
    },
    tags: ['autodocs'],
    args: {
        totalJobs: 7,
        totalCities: 3,
    },
} satisfies Meta<typeof CareersHero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Trabaja con nosotros');

        // El antetítulo, que es lo que comparte con el hero del blog o el de ayuda.
        expect(canvas.getByText('Empleo')).toBeInTheDocument();

        // El recuento hace creíble la sección: una cabecera genérica sobre un listado vacío es lo que
        // hace pensar que la empresa no contrata.
        expect(canvas.getByText(/7 ofertas.*3 ciudades/)).toBeInTheDocument();
    },
};

/**
 * Sin ofertas abiertas.
 *
 * El recuento cambia de mensaje en vez de desaparecer: decirlo es más honesto que dejar la cabecera
 * hablando de oportunidades sobre una lista vacía.
 */
export const WithoutOpenings: Story = {
    name: 'Sin ofertas abiertas',
    args: {
        totalJobs: 0,
        totalCities: 0,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByText(/No hay ofertas abiertas/i)).toBeInTheDocument();
    },
};
