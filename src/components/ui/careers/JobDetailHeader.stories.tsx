import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { JOB_DETAIL } from './careers.fixtures';

import JobDetailHeader from './JobDetailHeader';

const meta = {
    title: 'Components/UI/Careers/JobDetailHeader',
    component: JobDetailHeader,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo/conserje-en-getafe-emp-000001' },
        },
        docs: {
            description: {
                component:
                    'Cabecera de la ficha, con la misma forma que las demás cabeceras de detalle de la web: volver al listado, la familia profesional en una píldora, título, resumen y la referencia. Las condiciones del puesto y el botón de presentarse viven en `JobDetailAside`, la columna de la derecha.',
            },
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
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('Conserje en Getafe');
        expect(canvas.getByText(/EMP-000001/)).toBeInTheDocument();

        // El enlace de volver: es lo que tienen las demás cabeceras de detalle y lo que aquí faltaba.
        expect(canvas.getByRole('link', { name: /todas las ofertas/i })).toBeInTheDocument();

        // La familia profesional, en la píldora que las otras fichas usan para su categoría.
        expect(canvas.getByText(JOB_DETAIL.categoryName)).toBeInTheDocument();
    },
};

export const LongTitle: Story = {
    name: 'Título largo',
    args: {
        job: {
            ...JOB_DETAIL,
            title: 'Conserje de comunidad con funciones de mantenimiento y atención a proveedores en Getafe',
        },
    },
};
