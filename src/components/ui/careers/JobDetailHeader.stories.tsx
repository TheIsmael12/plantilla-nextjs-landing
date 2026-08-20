import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { JOB_DETAIL } from './careers.fixtures';

import JobDetailHeader from './JobDetailHeader';

const meta = {
    title: 'Components/UI/Careers/JobDetailHeader',
    component: JobDetailHeader,
    parameters: {
        layout: 'fullscreen',
        // Los componentes de empleo enlazan con `Link` de next-intl, que necesita el enrutador del
        // App Router montado: sin esto, la historia revienta con "expected app router to be mounted".
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo/conserje-en-getafe-emp-000001' },
        },
    },
    tags: ['autodocs'],
    args: {
        job: JOB_DETAIL,
    },
} satisfies Meta<typeof JobDetailHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Con salario',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Conserje en Getafe');
        expect(canvas.getByText(/18\.000/)).toBeInTheDocument();
        expect(canvas.getByRole('link', { name: 'Presentar candidatura' })).toBeInTheDocument();
    },
};

export const WithoutSalary: Story = {
    name: 'Sin salario publicado',
    args: {
        job: { ...JOB_DETAIL, salary: null },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.getByText('Salario no publicado')).toBeInTheDocument();
    },
};

/**
 * Proceso en pausa. El aviso va **arriba** y no junto al formulario: quien llega a la ficha necesita saber
 * antes de leerse la oferta entera que ahora mismo no puede presentarse. Y no hay botón, porque no hay nada
 * que pulsar: el formulario tampoco se pinta.
 */
export const Paused: Story = {
    name: 'Proceso en pausa',
    args: {
        job: { ...JOB_DETAIL, acceptingApplications: false },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByText(/Este proceso está en pausa/)).toBeInTheDocument();
        expect(canvas.queryByRole('link', { name: 'Presentar candidatura' })).not.toBeInTheDocument();
    },
};

/**
 * Candidatura gestionada fuera: el botón sale a la web del proceso y está marcado como enlace externo. Es lo
 * mismo que dice el `directApply: false` de los datos estructurados.
 */
export const ExternalApplication: Story = {
    name: 'Candidatura externa',
    args: {
        job: { ...JOB_DETAIL, applyUrl: 'https://empleo.example.com/oferta/1234' },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        const link = canvas.getByRole('link', { name: /web del proceso/ });
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    },
};

export const RemoteWithManyCities: Story = {
    name: 'Remota, varias ciudades y un solo puesto',
    args: {
        job: {
            ...JOB_DETAIL,
            workMode: 'REMOTE',
            vacancies: 1,
            locations: [
                { name: 'Madrid', slug: 'madrid', province: 'Madrid', country: 'ES' },
                { name: 'Getafe', slug: 'getafe', province: 'Madrid', country: 'ES' },
                { name: 'Leganés', slug: 'leganes', province: 'Madrid', country: 'ES' },
            ],
        },
    },
};
