import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import OtpCodeModal from "./OtpCodeModal";

const INVALID_CODE_MESSAGE = "El código introducido no es válido.";

const meta = {
  title: "UI/Modals/OtpCodeModal",
  component: OtpCodeModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Modal dedicado exclusivamente a pedir un código de verificación de 6 dígitos: lo comparten el reto MFA del login (`MfaVerifyModal`) y la confirmación de alta de 2FA (`TwoFactorSetupModal`). Gestiona internamente el valor del código, el estado de envío y el mensaje de error devuelto por `onSubmit`; el botón de confirmación permanece deshabilitado hasta que se completan los 6 dígitos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Controla la visibilidad del modal.",
    },
    title: {
      control: "text",
      description: "Título del modal.",
    },
    description: {
      control: "text",
      description: "Texto descriptivo bajo el título.",
    },
    submitText: {
      control: "text",
      description: "Texto (clave de traducción) del botón de envío.",
    },
    submittingText: {
      control: "text",
      description:
        "Texto (clave de traducción) del botón de envío mientras se procesa.",
    },
    onClose: { action: "onClose" },
    onSubmit: { action: "onSubmit" },
  },
  args: {
    isOpen: true,
    title: "Confirma el código",
    description:
      "Introduce el código de 6 dígitos generado por tu app autenticadora.",
    onClose: fn(),
    onSubmit: fn(async (): Promise<string | void> => undefined),
  },
} satisfies Meta<typeof OtpCodeModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: "Por defecto",
};

export const ConError: Story = {
  name: "Con error",
  args: {
    onSubmit: fn(async (): Promise<string | void> => INVALID_CODE_MESSAGE),
  },
};

export const TextosPersonalizados: Story = {
  name: "Textos personalizados",
  args: {
    submitText: "continue",
    submittingText: "verifying",
  },
};

export const EnvioCorrecto: Story = {
  name: "Envío correcto (interacción)",
  parameters: {
    docs: {
      description: {
        story:
          "Rellena las 6 casillas del código, comprueba que el botón de confirmación pasa a estar habilitado y que `onSubmit` recibe el código completo al enviarlo.",
      },
    },
  },
  play: async ({ args }) => {
    // `ModalComponent` renderiza vía `createPortal` a `document.body`, fuera
    // de `canvasElement`: hay que consultar el DOM completo, como ya hacen
    // `RowActionsMenu.stories.tsx`/`SelectSearch.stories.tsx` para sus menús/listas portaladas.
    const canvas = within(document.body);
    const slots = canvas.getAllByRole("textbox");
    expect(slots).toHaveLength(6);

    const submitButton = canvas.getByRole("button", { name: /Verificar/i });
    expect(submitButton).toBeDisabled();

    for (const [index, slot] of slots.entries()) {
      await userEvent.type(slot, String((index + 1) % 10));
    }

    expect(submitButton).toBeEnabled();

    await userEvent.click(submitButton);

    await expect(args.onSubmit).toHaveBeenCalledWith("123456");
  },
};

export const EnvioConErrorYCorreccion: Story = {
  name: "Envío con error y corrección (interacción)",
  args: {
    onSubmit: fn(async (): Promise<string | void> => INVALID_CODE_MESSAGE),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Envía un código incompleto/incorrecto, comprueba que aparece el mensaje de error devuelto por `onSubmit` y que desaparece en cuanto el usuario vuelve a tocar el código.",
      },
    },
  },
  play: async ({ args }) => {
    const canvas = within(document.body);
    const slots = canvas.getAllByRole("textbox");

    for (const [index, slot] of slots.entries()) {
      await userEvent.type(slot, String((index + 1) % 10));
    }

    const submitButton = canvas.getByRole("button", { name: /Verificar/i });
    await userEvent.click(submitButton);

    await expect(args.onSubmit).toHaveBeenCalledWith("123456");
    await canvas.findByText(INVALID_CODE_MESSAGE);

    await userEvent.type(slots[0] as HTMLElement, "9");

    await waitFor(() =>
      expect(canvas.queryByText(INVALID_CODE_MESSAGE)).not.toBeInTheDocument(),
    );
  },
};

export const Cierre: Story = {
  name: "Cierre del modal (interacción)",
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

    const closeButton = canvas.getByRole("button", { name: /Cancelar/i });
    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};
