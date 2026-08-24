import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { CITY_LOCATIONS, JOB_DETAIL } from './careers.fixtures';

import JobApplyDialog from './JobApplyDialog';

const meta = {
    title: 'Components/UI/Careers/JobApplyDialog',
    component: JobApplyDialog,
    parameters: {
        layout: 'fullscreen',
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo/conserje-en-getafe-emp-000001' },
        },
        docs: {
            description: {
                component:
                    'El diálogo propio del formulario de candidatura: los pasos fijos arriba, los campos desplazándose en medio y las acciones fijas abajo. Lleva el puesto y la referencia en la cabecera, que es el contexto que se perdía al tapar la ficha. Sustituye al modal genérico con la variante `isFull`, que se ha retirado.',
            },
        },
    },
    tags: ['autodocs'],
    args: {
        jobCode: JOB_DETAIL.jobCode,
        jobTitle: JOB_DETAIL.title,
        cities: CITY_LOCATIONS,
        isOpen: true,
        onClose: fn(),
    },
} satisfies Meta<typeof JobApplyDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * El diálogo abierto en el primer paso.
 *
 * Comprueba lo que este componente añade sobre el modal genérico: que la cabecera dice a qué oferta se
 * está presentando, y que el formulario **no** repite su propio título dentro (`hideHeader`).
 */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        // El diálogo se porta a `document.body`, así que no está dentro del canvas de la historia.
        const dialog = within(await within(document.body).findByRole('dialog'));

        expect(dialog.getByRole('heading', { level: 2 })).toHaveTextContent('Presentar candidatura');
        expect(dialog.getByText(new RegExp(JOB_DETAIL.title))).toBeInTheDocument();
        expect(dialog.getByText(new RegExp(JOB_DETAIL.jobCode))).toBeInTheDocument();

        // Un solo encabezado: el del diálogo. El del formulario se oculta con `hideHeader`.
        expect(dialog.getAllByRole('heading', { level: 2 })).toHaveLength(1);

        void canvasElement;
    },
};

/**
 * Cerrar con el aspa.
 *
 * Es, junto a Escape, la **única** forma de cerrarlo: un click fuera no cierra, a diferencia del modal
 * genérico. Perder nueve campos y un fichero por pulsar al lado es la clase de cosa que hace que alguien no
 * se vuelva a presentar.
 */
export const ClosesFromTheHeader: Story = {
    name: 'Se cierra desde la cabecera',
    play: async ({ args }) => {
        const body = within(document.body);

        await userEvent.click(body.getByRole('button', { name: /cerrar/i }));
        expect(args.onClose).toHaveBeenCalled();
    },
};

/**
 * El paso del CV, que es el más alto.
 *
 * Es el caso que motivó el diálogo: con el modal genérico, aquí desaparecían de la pantalla a la vez el
 * indicador de pasos y el botón de continuar, porque todo vivía dentro del mismo cuerpo desplazable.
 */
export const OnTheCvStep: Story = {
    name: 'En el paso del CV',
    play: async () => {
        const dialog = within(await within(document.body).findByRole('dialog'));

        await userEvent.type(dialog.getByLabelText(/Nombre/), 'Lucía');
        await userEvent.type(dialog.getByLabelText(/Apellidos/), 'Ferrer Gómez');
        await userEvent.type(dialog.getByLabelText(/Correo/), 'lucia.ferrer@example.com');
        await userEvent.click(dialog.getByRole('button', { name: /Siguiente/ }));

        expect(await dialog.findByLabelText(/Tu CV/)).toBeInTheDocument();

        // Los pasos y las acciones siguen ahí: están fuera del área que se desplaza.
        expect(dialog.getByRole('list', { name: undefined })).toBeInTheDocument();
        expect(dialog.getByRole('button', { name: /Siguiente/ })).toBeVisible();
        expect(dialog.getByRole('button', { name: /Atrás/ })).toBeVisible();
    },
};
