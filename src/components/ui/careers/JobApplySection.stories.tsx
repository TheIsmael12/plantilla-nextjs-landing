import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, mocked, userEvent, within } from 'storybook/test';

import { submitJobApplication } from '@/actions/careers/careers-actions';

import { HTTPStatus } from '@/constants/httpStatus';

import { CITY_FACETS } from './careers.fixtures';

import JobApplySection from './JobApplySection';

/*
 * La acción de servidor llega doblada por el alias de `.storybook/main.ts`: el módulo real no se puede ni
 * importar en el navegador (arrastra next-auth → openid-client → `Buffer`).
 */
const mockSubmit = mocked(submitJobApplication);

/**
 * Rellena una candidatura válida y la envía.
 * @param {HTMLElement} canvasElement - Raíz de la historia
 */
async function fillAndSubmit(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/Nombre/), 'Lucía');
    await userEvent.type(canvas.getByLabelText(/Apellidos/), 'Ferrer Gómez');
    await userEvent.type(canvas.getByLabelText(/Correo/), 'lucia.ferrer@example.com');
    await userEvent.upload(
        canvas.getByLabelText(/Tu CV/),
        new File([new Uint8Array(240 * 1024)], 'cv-lucia.pdf', { type: 'application/pdf' }),
    );
    await userEvent.click(canvas.getByRole('checkbox', { name: /He leído la/ }));
    await userEvent.click(canvas.getByRole('button', { name: 'Enviar mi candidatura' }));
}

const meta = {
    title: 'Components/UI/Careers/JobApplySection',
    component: JobApplySection,
    parameters: {
        layout: 'padded',
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo/conserje-en-getafe-emp-000001' },
        },
        docs: {
            description: {
                component:
                    'La capa de cliente que envía la candidatura: el estado y la llamada a la API alrededor de `JobApplyForm`, que es presentacional. Mismo reparto que `ContactViewPage` con `ContactForm`.',
            },
        },
    },
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 460 }}>
                <Story />
            </div>
        ),
    ],
    tags: ['autodocs'],
    args: {
        jobCode: 'EMP-000001',
        cities: CITY_FACETS,
    },
} satisfies Meta<typeof JobApplySection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    name: 'Sin enviar',
    decorators: [
        (Story) => {
            mockSubmit.mockReset();
            return <Story />;
        },
    ],
};

/**
 * Envío correcto: el formulario se sustituye por la confirmación, sin redirigir. Y se comprueba lo que esta
 * capa aporta: que a la acción le llega un **objeto tipado** con el fichero dentro, no un `FormData` montado
 * en el formulario.
 */
export const Submitted: Story = {
    name: 'Enviado',
    decorators: [
        (Story) => {
            mockSubmit.mockReset().mockResolvedValueOnce({ status: HTTPStatus.CREATED });
            return <Story />;
        },
    ],
    play: async ({ canvasElement }) => {
        await fillAndSubmit(canvasElement);

        const canvas = within(canvasElement);
        expect(await canvas.findByText('Candidatura enviada')).toBeInTheDocument();

        expect(mockSubmit).toHaveBeenCalledTimes(1);
        expect(mockSubmit.mock.calls[0][0]).toMatchObject({
            jobCode: 'EMP-000001',
            firstName: 'Lucía',
            email: 'lucia.ferrer@example.com',
            privacyNoticeAcknowledged: true,
            talentPoolConsent: false,
        });
        expect(mockSubmit.mock.calls[0][0].cv).toBeInstanceOf(File);
    },
};

/**
 * La API rechaza el envío (por ejemplo, una oferta que se acaba de cerrar). El mensaje del backend se enseña
 * tal cual —ya viene traducido— y el formulario **se queda con todo lo escrito**: obligar a rellenarlo otra
 * vez es la forma más rápida de perder una candidatura.
 */
export const RejectedByApi: Story = {
    name: 'Rechazado por la API',
    decorators: [
        (Story) => {
            mockSubmit.mockReset().mockResolvedValueOnce({
                status: HTTPStatus.CONFLICT,
                message: 'Esta oferta ya no admite candidaturas.',
            });
            return <Story />;
        },
    ],
    play: async ({ canvasElement }) => {
        await fillAndSubmit(canvasElement);

        const canvas = within(canvasElement);
        expect(await canvas.findByText('Esta oferta ya no admite candidaturas.')).toBeInTheDocument();
        expect(canvas.getByLabelText(/Correo/)).toHaveValue('lucia.ferrer@example.com');
    },
};

/**
 * Mientras sube: el botón se deshabilita y cambia de texto. Se congela con una promesa que no se resuelve,
 * que es la única forma de ver ese estado sin depender de la velocidad de la red.
 */
export const Submitting: Story = {
    name: 'Enviando',
    decorators: [
        (Story) => {
            mockSubmit.mockReset().mockImplementationOnce(() => new Promise(() => {}));
            return <Story />;
        },
    ],
    play: async ({ canvasElement }) => {
        await fillAndSubmit(canvasElement);

        const canvas = within(canvasElement);
        expect(await canvas.findByRole('button', { name: 'Enviando…' })).toBeDisabled();
    },
};
