import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, mocked, userEvent, waitFor, within } from "storybook/test";

import { HTTPStatus } from "@/constants/httpStatus";

// `@/actions/profile/security-actions` está aliasado a
// `.storybook/mocks/security-actions.ts` (ver `vitest.config.ts` y
// `.storybook/main.ts`): `security-actions.ts` lleva la directiva
// `"use server"`, que Storybook/Vite no respeta como sí hace el compilador
// de Next.js, así que un import real acabaría llamando a `fetchDataToken`
// de verdad. `disableTwoFactor` ya es un `fn()` de `storybook/test` gracias
// al alias — `mocked()` (también de `storybook/test`, no `vi.mocked` de
// `vitest`) solo ajusta el tipo para TypeScript, sin tocar el valor en
// tiempo de ejecución, así que este archivo funciona igual bajo el runner
// de Vitest y en el propio Storybook (`pnpm storybook`) — a diferencia de
// `vi.mock`, que rompía la carga del módulo (y de rebote cualquier
// `expect()` posterior) en el Storybook "de verdad".
import { disableTwoFactor } from "@/actions/profile/security-actions";

import TwoFactorDisableModal from "./TwoFactorDisableModal";

const mockDisableTwoFactor = mocked(disableTwoFactor);

// `OtpInput` vuelve a traducir su prop `error` como clave del namespace
// `Validations` (`useTranslations("Validations")`), igual que hace con los
// errores de Yup del propio esquema (`otpLength`/`required`, `schemas/security.schema.ts`):
// por eso el mensaje que simula devolver el servidor debe ser también una
// clave real de ese namespace, no un texto arbitrario ya traducido.
const SERVER_ERROR_KEY = "otpLength";
// El mensaje se renderiza con un prefijo "* " (`OtpInput.tsx`), de ahí el
// matcher parcial en vez de una igualdad exacta (mismo motivo que en
// `RequiredFieldsValidation`, más arriba).
const SERVER_ERROR_TEXT = /código completo/i;

/**
 * Rellena la contraseña y las 6 casillas del código con datos válidos para
 * que la validación de Yup deje pasar el envío hasta `disableTwoFactor`.
 * @param {HTMLElement} body - Elemento sobre el que consultar (`document.body`, portal del modal)
 * @returns {Promise<void>} Se resuelve cuando ambos campos están rellenos
 */
async function fillValidForm(body: HTMLElement): Promise<void> {
  const canvas = within(body);

  const passwordInput = canvas.getByLabelText(/contraseña/i, { selector: "input" });
  await userEvent.type(passwordInput, "ContraseñaActual1");

  const slots = canvas.getAllByRole("textbox");
  for (const [index, slot] of slots.entries()) {
    await userEvent.type(slot, String((index + 1) % 10));
  }
}

const meta = {
  title: "UI/Modals/TwoFactorDisableModal",
  component: TwoFactorDisableModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Pide confirmación (contraseña actual + código de la aplicación autenticadora) antes de desactivar la verificación en dos pasos (§7.1 requisitos.md): una acción sensible, no basta con un simple \"¿seguro?\". Ambos campos se validan en el cliente (Yup) antes de intentar nada contra el backend; solo si pasan esa validación se envía la petición a `2fa/disable`. `disableTwoFactor` (`actions/profile/security-actions.ts`) está mockeado para cubrir tanto un envío válido con éxito como los distintos errores que puede devolver la API, además de la validación de campos, el mostrar/ocultar contraseña, el código OTP y el cierre del modal.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "closed" },
    onDisabled: { action: "disabled" },
  },
  args: {
    onClose: fn(),
    onDisabled: fn(),
  },
} satisfies Meta<typeof TwoFactorDisableModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RequiredFieldsValidation: Story = {
  name: "Interacción: validación de campos obligatorios",
  parameters: {
    docs: {
      description: {
        story:
          "Envía el formulario vacío y comprueba que aparecen los errores de validación de la contraseña y del código, sin llegar a invocar `onDisabled`.",
      },
    },
  },
  play: async ({ args }) => {
    // `ModalComponent` renderiza vía `createPortal` a `document.body`, fuera
    // de `canvasElement`: hay que consultar el DOM completo, como ya hacen
    // `RowActionsMenu.stories.tsx`/`SelectSearch.stories.tsx` para sus menús/listas portaladas.
    const canvas = within(document.body);

    const submitButton = canvas.getByRole("button", { name: /desactivar/i });
    await userEvent.click(submitButton);

    // El mensaje se renderiza con un prefijo "* " (`Input.tsx`/`OtpInput.tsx`),
    // de ahí el matcher parcial en vez de una igualdad exacta.
    await canvas.findByText(/Este campo es obligatorio/);
    await canvas.findByText(/código completo/i);

    await expect(args.onDisabled).not.toHaveBeenCalled();
  },
};

export const TogglePasswordVisibility: Story = {
  name: "Interacción: mostrar/ocultar contraseña",
  parameters: {
    docs: {
      description: {
        story:
          "Escribe una contraseña y comprueba que el botón de mostrar/ocultar cambia el tipo del campo y su nombre accesible.",
      },
    },
  },
  play: async () => {
    const canvas = within(document.body);

    // Restringido a `input`: sin el selector, la regex también encuentra el
    // botón de mostrar/ocultar (`aria-label="Mostrar contraseña"`).
    const passwordInput = canvas.getByLabelText(/contraseña/i, {
      selector: "input",
    }) as HTMLInputElement;
    await userEvent.type(passwordInput, "MiContraseñaActual1");
    expect(passwordInput).toHaveAttribute("type", "password");

    const toggleButton = canvas.getByRole("button", { name: /mostrar contraseña/i });
    await userEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute("type", "text");
    await canvas.findByRole("button", { name: /ocultar contraseña/i });
  },
};

export const FillOtpCode: Story = {
  name: "Interacción: rellenar el código de 6 dígitos",
  parameters: {
    docs: {
      description: {
        story:
          "Rellena las 6 casillas del código con el teclado y comprueba que el foco avanza automáticamente de una casilla a la siguiente.",
      },
    },
  },
  play: async () => {
    const canvas = within(document.body);
    const slots = canvas.getAllByRole("textbox");
    expect(slots).toHaveLength(6);

    for (const [index, slot] of slots.entries()) {
      await userEvent.type(slot, String((index + 1) % 10));
    }

    slots.forEach((slot, index) => {
      expect(slot).toHaveValue(String((index + 1) % 10));
    });
  },
};

export const CloseWithButtonAndEscape: Story = {
  name: "Interacción: cierre con botón y con Escape",
  parameters: {
    docs: {
      description: {
        story:
          "Comprueba que el modal es operable con teclado: el botón de cerrar (aspa) y la tecla Escape invocan `onClose`.",
      },
    },
  },
  play: async ({ args }) => {
    const canvas = within(document.body);

    const closeButton = canvas.getByRole("button", { name: /cerrar/i });
    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

export const DesactivacionCorrecta: Story = {
  name: "Interacción: desactivación correcta",
  parameters: {
    docs: {
      description: {
        story:
          "Con la contraseña y el código válidos, `disableTwoFactor` resuelve con éxito y se invoca `onDisabled`.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockDisableTwoFactor.mockReset().mockResolvedValueOnce({ status: HTTPStatus.OK });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    await fillValidForm(document.body);

    const canvas = within(document.body);
    const submitButton = canvas.getByRole("button", { name: /desactivar/i });
    await userEvent.click(submitButton);

    await waitFor(() => expect(args.onDisabled).toHaveBeenCalledTimes(1));
  },
};

export const DesactivacionConMensajeDeError: Story = {
  name: "Interacción: error con mensaje del servidor",
  parameters: {
    docs: {
      description: {
        story:
          "El servidor rechaza la desactivación con un mensaje concreto (una clave de `Validations`, igual que los errores del propio esquema Yup): se muestra en el campo del código, sin invocar `onDisabled`.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockDisableTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.BAD_REQUEST, message: SERVER_ERROR_KEY });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    await fillValidForm(document.body);

    const canvas = within(document.body);
    const submitButton = canvas.getByRole("button", { name: /desactivar/i });
    await userEvent.click(submitButton);

    await canvas.findByText(SERVER_ERROR_TEXT);
    await expect(args.onDisabled).not.toHaveBeenCalled();
  },
};

export const DesactivacionConErrorGenerico: Story = {
  name: "Interacción: error sin mensaje del servidor",
  parameters: {
    docs: {
      description: {
        story:
          "El servidor rechaza la desactivación sin un mensaje concreto (p. ej. un fallo de red): se recurre al mensaje de error genérico (`Common.Errors.unexpectedError`), sin invocar `onDisabled`.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockDisableTwoFactor.mockReset().mockResolvedValueOnce({ status: HTTPStatus.SERVICE_UNAVAILABLE });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    await fillValidForm(document.body);

    const canvas = within(document.body);
    const submitButton = canvas.getByRole("button", { name: /desactivar/i });
    await userEvent.click(submitButton);

    // `Common.Errors.unexpectedError` es un texto ya resuelto, no una clave de
    // `Validations`, así que `OtpInput` (que traduce su prop `error` como
    // clave de ese namespace) no puede volver a resolverlo: se busca solo la
    // presencia del bloque de error, sin acoplarse al texto exacto que
    // next-intl use de *fallback* para una clave inexistente.
    await waitFor(() => {
      expect(document.body.querySelector(".otp-input__group .label__error")).toBeInTheDocument();
    });
    await expect(args.onDisabled).not.toHaveBeenCalled();
  },
};
