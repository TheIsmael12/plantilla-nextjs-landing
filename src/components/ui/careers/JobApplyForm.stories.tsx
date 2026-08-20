import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { CITY_FACETS } from './careers.fixtures';

import JobApplyForm from './JobApplyForm';

/**
 * Un fichero de mentira del tipo y tamaño que se quiera, para las historias del campo del CV.
 * @param {string} name - Nombre del fichero
 * @param {string} type - Tipo MIME
 * @param {number} sizeBytes - Tamaño
 * @returns {File} El fichero
 */
function fakeFile(name: string, type: string, sizeBytes = 1024): File {
    return new File([new Uint8Array(sizeBytes)], name, { type });
}

/**
 * Lleva el asistente al paso del CV, que es el segundo: los datos personales del primero son obligatorios y
 * el paso no deja avanzar sin ellos.
 * @param {HTMLElement} canvasElement - Raíz de la historia
 */
async function goToCvStep(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText(/Nombre/), 'Lucía');
    await userEvent.type(canvas.getByLabelText(/Apellidos/), 'Ferrer Gómez');
    await userEvent.type(canvas.getByLabelText(/Correo/), 'lucia.ferrer@example.com');
    await userEvent.click(canvas.getByRole('button', { name: /Siguiente/ }));

    await canvas.findByLabelText(/Tu CV/);
}

/**
 * Lleva el asistente al último paso, el de los permisos: es donde está el botón de enviar.
 * @param {HTMLElement} canvasElement - Raíz de la historia
 */
async function goToConsentsStep(canvasElement: HTMLElement) {
    await goToCvStep(canvasElement);

    const canvas = within(canvasElement);

    await userEvent.upload(
        canvas.getByLabelText(/Tu CV/),
        fakeFile('cv-lucia.pdf', 'application/pdf', 240 * 1024),
    );
    await userEvent.click(canvas.getByRole('button', { name: /Siguiente/ }));

    await canvas.findByRole('checkbox', { name: /He leído la/ });
}

const meta = {
    title: 'Components/UI/Careers/JobApplyForm',
    component: JobApplyForm,
    parameters: {
        layout: 'padded',
        // Los componentes de empleo enlazan con `Link` de next-intl, que necesita el enrutador del
        // App Router montado: sin esto, la historia revienta con "expected app router to be mounted".
        nextjs: {
            appDirectory: true,
            navigation: { pathname: '/empleo/conserje-en-getafe-emp-000001' },
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
        onSubmit: fn(),
    },
} satisfies Meta<typeof JobApplyForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * El formulario limpio.
 *
 * Lo que **no** pide es tan importante como lo que pide: no hay fotografía, ni fecha de nacimiento, ni
 * nacionalidad, ni DNI, y se dice en el propio formulario. Un dato que no está no puede influir en la
 * decisión.
 */
export const Default: Story = {
    name: 'Limpio',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByLabelText(/Nombre/)).toBeInTheDocument();
        expect(canvas.getByRole('button', { name: /Siguiente/ })).toBeInTheDocument();
        // El CV y los permisos llegan en los pasos siguientes, no en este.
        expect(canvas.queryByLabelText(/Tu CV/)).not.toBeInTheDocument();
    },
};

/**
 * Candidatura espontánea: sin oferta, y con la casilla de la bolsa de talento **obligatoria** —es la única
 * base legal para guardar una candidatura que no responde a ningún proceso—. El botón de enviar está
 * deshabilitado hasta que se marca.
 */
export const Spontaneous: Story = {
    name: 'Espontánea (bolsa de talento obligatoria)',
    args: {
        jobCode: undefined,
        requireTalentPool: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByRole('heading', { name: 'Candidatura espontánea' })).toBeInTheDocument();

        await goToConsentsStep(canvasElement);

        // Sin marcar la bolsa de talento no se puede enviar: es la única base legal para conservarla.
        expect(canvas.getByRole('button', { name: /Enviar/ })).toBeDisabled();
    },
};

/**
 * Los errores de validación del primer paso: pulsar «Siguiente» sin rellenar nada **no avanza** y dice qué
 * falta. Es lo que hace que el asistente no sea decorado: sin esta comprobación se podría llegar al último
 * paso con el correo mal escrito y enterarse al final.
 */
export const WithErrors: Story = {
    name: 'Con errores de validación',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole('button', { name: /Siguiente/ }));

        // El mensaje lo pinta `Input`, que le pone un asterisco delante: se busca por expresión regular.
        expect(await canvas.findByText(/Dinos tu nombre/)).toBeInTheDocument();
        expect(canvas.getByLabelText(/Nombre/)).toBeInTheDocument();
    },
};

/** El asistente avanza cuando el paso está bien, y el paso dos es el del CV. */
export const SecondStep: Story = {
    name: 'Segundo paso (el CV)',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.type(canvas.getByLabelText(/Nombre/), 'Lucía');
        await userEvent.type(canvas.getByLabelText(/Apellidos/), 'Ferrer Gómez');
        await userEvent.type(canvas.getByLabelText(/Correo/), 'lucia.ferrer@example.com');
        await userEvent.click(canvas.getByRole('button', { name: /Siguiente/ }));

        expect(await canvas.findByLabelText(/Tu CV/)).toBeInTheDocument();
    },
};

/**
 * Un CV demasiado grande se rechaza **en el navegador**, antes de subir nada: dejar que se suban 20 MB para
 * que el servidor los rechace es gastar la conexión de quien se presenta, que muchas veces está en el móvil.
 * Y el mensaje dice qué hacer, no qué ha pasado.
 *
 * Se prueba con el tamaño y no con el tipo porque `userEvent.upload` respeta el `accept` del input, así que
 * un PNG no llega ni a entrar: la regla del tipo se comprueba en `test/careers.schema.test.ts`, que es donde
 * vive.
 */
export const RejectsTooLargeCv: Story = {
    name: 'CV de más de 5 MB',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await goToCvStep(canvasElement);

        await userEvent.upload(
            canvas.getByLabelText(/Tu CV/),
            fakeFile('cv-enorme.pdf', 'application/pdf', 6 * 1024 * 1024),
        );

        expect(await canvas.findByText(/El CV no puede pasar de 5 MB/)).toBeInTheDocument();
    },
};

/**
 * Un PDF elegido se enseña con su nombre y su tamaño, y con un botón de quitarlo. Sin eso no hay forma de
 * saber si se adjuntó el fichero correcto.
 */
export const WithChosenCv: Story = {
    name: 'Con el CV elegido',
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await goToCvStep(canvasElement);

        await userEvent.upload(
            canvas.getByLabelText(/Tu CV/),
            fakeFile('cv-lucia.pdf', 'application/pdf', 240 * 1024),
        );

        expect(await canvas.findByText(/cv-lucia\.pdf/)).toBeInTheDocument();
        expect(canvas.getByRole('button', { name: 'Quitar el fichero' })).toBeInTheDocument();
    },
};

/**
 * La zona de arrastrar y soltar se ilumina cuando hay un fichero encima, para que se vea que va a caer ahí y
 * no en la ventana del navegador.
 */
export const DragOverHighlight: Story = {
    name: 'Arrastrando un fichero encima',
    play: async ({ canvasElement }) => {
        await goToCvStep(canvasElement);

        const dropZone = canvasElement.querySelector('.careers__form-file');
        expect(dropZone).not.toBeNull();

        fireEvent.dragOver(dropZone as Element);

        expect(dropZone).toHaveClass('careers__form-file--dragging');
    },
};

/**
 * Subiendo. El botón se deshabilita y cambia de texto mientras sube: un CV de 5 MB en una conexión móvil
 * tarda, y sin indicador la gente pulsa dos veces —y dos pulsaciones son dos candidaturas.
 */
export const Loading: Story = {
    name: 'Enviando',
    args: {
        loading: true,
    },
    play: async ({ canvasElement }) => {
        await goToConsentsStep(canvasElement);

        const canvas = within(canvasElement);
        expect(canvas.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
    },
};

/**
 * Enviado. El formulario se sustituye por la confirmación, sin redirigir.
 *
 * Y la confirmación **no** promete una referencia en pantalla: la API no la devuelve a propósito, así que
 * decir «tu referencia es CAN-000123» sería inventarse un dato. Lo que se dice es que llegará por correo.
 */
export const Success: Story = {
    name: 'Enviado',
    args: {
        success: true,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        expect(canvas.getByText('Candidatura enviada')).toBeInTheDocument();
        expect(canvas.queryByLabelText(/Tu CV/)).not.toBeInTheDocument();
    },
};

/**
 * Error de la API (por ejemplo, una oferta que se acaba de cerrar: `409`). El mensaje llega ya traducido
 * desde el backend y el formulario **se queda con todo lo escrito**: obligar a rellenarlo otra vez es la
 * forma más rápida de perder una candidatura.
 */
export const WithError: Story = {
    name: 'Rechazado por la API',
    args: {
        error: 'Esta oferta ya no admite candidaturas.',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // El error se pinta en cualquier paso: es del formulario, no de un campo.
        expect(canvas.getByText('Esta oferta ya no admite candidaturas.')).toBeInTheDocument();
        expect(canvas.getByLabelText(/Nombre/)).toBeInTheDocument();
    },
};
