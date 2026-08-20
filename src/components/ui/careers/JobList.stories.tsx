import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { JOB_LIST } from './careers.fixtures';

import JobList from './JobList';

const meta = {
    title: 'Components/UI/Careers/JobList',
    component: JobList,
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
        jobs: JOB_LIST,
    },
} satisfies Meta<typeof JobList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Con ofertas',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.getAllByRole('article')).toHaveLength(JOB_LIST.length);
    },
};

export const SingleJob: Story = {
    name: 'Una sola oferta',
    args: {
        jobs: JOB_LIST.slice(0, 1),
    },
};

/**
 * La cuadrícula llena, que es la que enseña el buscador: doce ofertas entran en tres columnas sin dejar
 * huecos, y es el número que usa `CareersViewPage`.
 */
export const FullPage: Story = {
    name: 'Página completa (12 ofertas)',
    args: {
        jobs: Array.from({ length: 12 }, (_, index) => ({
            ...JOB_LIST[index % JOB_LIST.length],
            jobCode: `EMP-${String(index + 1).padStart(6, '0')}`,
        })),
    },
};

/**
 * Sin ofertas la lista se queda vacía **a propósito**: quien decide qué se enseña en su lugar es la vista,
 * que pinta `JobEmptyState` con un texto distinto según si hay filtros puestos o no hay nada abierto. Ver la
 * historia de `JobEmptyState`.
 *
 * Y no hay historia de «cargando»: la ruta de empleo **no tiene** `loading.tsx`, y no es un olvido. Un
 * Suspense por encima confirma el `200` antes de que la vista pueda lanzar el `notFound()`, así que una
 * ciudad sin ofertas respondía `200` con el cuerpo de un 404 — un soft 404 en toda regla.
 */
export const Empty: Story = {
    name: 'Sin ofertas (la vista pinta JobEmptyState)',
    args: {
        jobs: [],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        expect(canvas.queryAllByRole('article')).toHaveLength(0);
    },
};
