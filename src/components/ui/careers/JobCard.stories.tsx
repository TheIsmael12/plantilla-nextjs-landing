import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { JOB_LIST_ITEM } from './careers.fixtures';

import JobCard from './JobCard';

const meta = {
    title: 'Components/UI/Careers/JobCard',
    component: JobCard,
    parameters: {
        layout: 'padded',
        // Los componentes de empleo enlazan con `Link` de next-intl, que necesita el enrutador del
        // App Router montado: sin esto, la historia revienta con "expected app router to be mounted".
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo' },
        },
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 380 }}>
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
    args: {
        job: JOB_LIST_ITEM,
    },
} satisfies Meta<typeof JobCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Destacada, con salario',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // El importe se enseña formateado, no como llega de la API ("18000.00"): es el fallo que tenía la
        // tarjeta antes de pasar por `formatJobSalary`.
        expect(canvas.getByText(/18\.000/)).toBeInTheDocument();
        expect(canvas.queryByText(/18000\.00/)).not.toBeInTheDocument();
    },
};

export const WithoutSalary: Story = {
    name: 'Sin salario publicado',
    args: {
        job: { ...JOB_LIST_ITEM, salary: null, isFeatured: false },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.getByText('Salario no publicado')).toBeInTheDocument();
    },
};

export const OnlyMinimumSalary: Story = {
    name: 'Solo salario mínimo',
    args: {
        job: {
            ...JOB_LIST_ITEM,
            salary: { min: '20000.00', max: null, currency: 'EUR', period: 'YEAR' },
        },
    },
};

export const Paused: Story = {
    name: 'Proceso en pausa',
    args: {
        job: { ...JOB_LIST_ITEM, isFeatured: false, acceptingApplications: false },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Nunca solo por color: el estado va escrito, que es lo que lo hace legible con lector de pantalla.
        expect(canvas.getByText('Proceso en pausa')).toBeInTheDocument();
    },
};

export const Remote: Story = {
    name: 'Remota, en varias ciudades',
    args: {
        job: {
            ...JOB_LIST_ITEM,
            isFeatured: false,
            workMode: 'REMOTE',
            locations: [
                { name: 'Madrid', slug: 'madrid', province: 'Madrid', country: 'ES' },
                { name: 'Getafe', slug: 'getafe', province: 'Madrid', country: 'ES' },
            ],
        },
    },
};

export const LongTitle: Story = {
    name: 'Título y resumen largos (se truncan)',
    args: {
        job: {
            ...JOB_LIST_ITEM,
            title: 'Conserje de comunidad con funciones de mantenimiento y atención a proveedores en Getafe',
            summary:
                'Turno de mañana en una comunidad de 120 viviendas con piscina, zonas verdes y dos garajes, con incorporación inmediata, formación pagada desde el primer día y posibilidad de rotar entre dos residenciales cercanos según la temporada.',
        },
    },
};
