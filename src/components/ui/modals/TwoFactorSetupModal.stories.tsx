import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, mocked, spyOn, userEvent, waitFor, within } from "storybook/test";

import { AUTHENTICATOR_APPS } from "@/constants/authenticatorApps";
import { HTTPStatus } from "@/constants/httpStatus";

import TwoFactorSetupModal from "./TwoFactorSetupModal";

import type { TwoFactorSetupModalProps } from "@/types/ui/modals/two-factor-setup-modal";
import type { TwoFactorSetupData } from "@/types/profile/security";
import type { FetchResponse } from "@/types/responses";

// `@/actions/profile/security-actions` y `@/utils/userAgentUtils` están
// aliasados a `.storybook/mocks/*.ts` (ver `vitest.config.ts` y
// `.storybook/main.ts`), no mockeados con `vi.mock`: `security-actions.ts`
// lleva la directiva `"use server"` (Storybook/Vite no la respeta como sí
// hace el compilador de Next.js, así que un import real acabaría llamando a
// `fetchDataToken` de verdad) y `detectPlatform()` llama a `parseUserAgent`
// con el `navigator.userAgent` real del navegador de test. `mocked()` (de
// `storybook/test`, no `vi.mocked` de `vitest`) solo ajusta el tipo para
// TypeScript sin tocar el valor en tiempo de ejecución, así que este
// archivo funciona igual bajo el runner de Vitest y en el propio Storybook
// (`pnpm storybook`) — a diferencia de `vi.mock`, que rompía la carga del
// módulo (y de rebote cualquier `expect()` posterior) en el Storybook "de
// verdad" con "Cannot read properties of undefined (reading
// 'customEqualityTesters')".
import { setupTwoFactor, verifyTwoFactorSetup } from "@/actions/profile/security-actions";
import { parseUserAgent } from "@/utils/userAgentUtils";

const mockSetupTwoFactor = mocked(setupTwoFactor);
const mockVerifyTwoFactorSetup = mocked(verifyTwoFactorSetup);

// Valor por defecto "desktop" para no afectar al resto de historias; las dos
// historias de plataforma lo sobrescriben una única vez con
// `mockReturnValueOnce` (coincide con la única llamada a `detectPlatform()`
// por montaje, vía `useState(detectPlatform)`).
const mockParseUserAgent = mocked(parseUserAgent);
mockParseUserAgent.mockReturnValue({ device: "desktop", browser: undefined, os: undefined });

const INVALID_CODE_MESSAGE = "El código introducido no es válido.";

// PNG transparente de 1x1: evita depender de una imagen/red real para el QR.
const QR_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const SETUP_DATA: TwoFactorSetupData = {
  secret: "JBSWY3DPEHPK3PXP",
  otpauthUri: "otpauth://totp/Enova:demo@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Enova",
  qrDataUri: QR_DATA_URI,
};

/**
 * Deja siempre las 6 casillas del código OTP con el mismo valor de prueba
 * (`1`-`6`), igual que en el resto de historias de este módulo con `OtpInput`.
 * @param {HTMLElement} body - Elemento sobre el que consultar (`document.body`, portal del modal)
 * @returns {Promise<void>} Se resuelve cuando las 6 casillas han sido rellenadas
 */
async function fillOtpCode(body: HTMLElement): Promise<void> {
  const canvas = within(body);
  const slots = canvas.getAllByRole("textbox");

  for (const [index, slot] of slots.entries()) {
    await userEvent.type(slot, String((index + 1) % 10));
  }
}

// Resuelve la promesa que la historia `EfectoCanceladoAlDesmontar` deja
// pendiente en `mockSetupTwoFactor`, para poder llamarla desde el `play`
// *después* de desmontar el modal (y comprobar así la guarda `active` del
// `useEffect` de carga).
let resolvePendingSetup: ((response: FetchResponse<TwoFactorSetupData>) => void) | undefined;

/**
 * Envoltorio de solo-test: monta {@link TwoFactorSetupModal} junto a un botón
 * que lo desmonta, para poder desmontarlo desde el `play` de
 * `EfectoCanceladoAlDesmontar` mientras `setupTwoFactor()` sigue pendiente.
 * @param {Pick<TwoFactorSetupModalProps, "onClose" | "onVerified">} props - Callbacks a reenviar al modal mientras esté montado
 * @returns {JSX.Element} El botón de desmontar y, mientras `mounted` sea `true`, el modal
 */
function UnmountWrapper({
  onClose,
  onVerified,
}: Pick<TwoFactorSetupModalProps, "onClose" | "onVerified">) {
  const [mounted, setMounted] = useState(true);

  return (
    <>
      <button type="button" data-testid="unmount-trigger" onClick={() => setMounted(false)}>
        Desmontar
      </button>
      {mounted && <TwoFactorSetupModal onClose={onClose} onVerified={onVerified} />}
    </>
  );
}

const meta = {
  title: "UI/Modals/TwoFactorSetupModal",
  component: TwoFactorSetupModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Alta de la verificación en dos pasos en 2 pasos: primero pide a `setupTwoFactor()` el secreto y el QR y los muestra junto a una explicación y un catálogo de apps autenticadoras recomendadas (`step: \"scan\"`), luego reutiliza `OtpCodeModal` para confirmar con el código generado por la aplicación autenticadora (`step: \"confirm\"`). Sin `isOpen`: el padre solo lo monta mientras dura el alta. En Storybook `setupTwoFactor`/`verifyTwoFactorSetup` (`actions/profile/security-actions.ts`) están mockeados para controlar cada paso sin depender de un backend real.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onClose: { action: "onClose" },
    onVerified: { action: "onVerified" },
  },
  args: {
    onClose: fn(),
    onVerified: fn(),
  },
} satisfies Meta<typeof TwoFactorSetupModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Cargando: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Estado inicial mientras `setupTwoFactor()` todavía no ha respondido: no hay QR ni catálogo de apps, solo el mensaje de carga.",
      },
    },
  },
  decorators: [
    (Story) => {
      // Promesa que nunca se resuelve: fija el componente en `step: "loading"`.
      mockSetupTwoFactor.mockReset().mockReturnValue(new Promise(() => {}));
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);
    await canvas.findByText(/generando tu código qr/i);
  },
};

export const EscaneoQR: Story = {
  name: "Escaneo del QR",
  parameters: {
    docs: {
      description: {
        story:
          "`setupTwoFactor()` responde con el secreto y el QR: se muestran los pasos a seguir, el catálogo de apps recomendadas y el QR con la clave manual.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText(SETUP_DATA.secret);

    // El QR usa `alt=""` (decorativo, la clave manual ya cubre la misma
    // información de forma accesible), por lo que no expone rol `img`;
    // se comprueba con un selector CSS en vez de `getByRole`.
    const qrImage = document.body.querySelector(".two-factor-setup-modal__qr img");
    expect(qrImage).toHaveAttribute("src", QR_DATA_URI);

    await canvas.findByRole("button", { name: /continuar/i });
  },
};

export const ErrorAlCargar: Story = {
  name: "Error al generar el QR",
  parameters: {
    docs: {
      description: {
        story:
          "`setupTwoFactor()` devuelve un error (p. ej. de red): se muestra el mensaje en el pie del modal y no hay botón «Continuar», al no haber datos de alta que confirmar.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.SERVICE_UNAVAILABLE, message: INVALID_CODE_MESSAGE });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText(INVALID_CODE_MESSAGE);
    expect(canvas.queryByRole("button", { name: /continuar/i })).not.toBeInTheDocument();
  },
};

export const CopiarSecreto: Story = {
  name: "Interacción: copiar la clave manual",
  parameters: {
    docs: {
      description: {
        story:
          "Al pulsar sobre la clave manual se copia al portapapeles y el icono cambia a la marca de confirmación.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    const writeTextSpy = spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    const secretButton = await canvas.findByText(SETUP_DATA.secret);
    await userEvent.click(secretButton);

    await expect(writeTextSpy).toHaveBeenCalledWith(SETUP_DATA.secret);

    writeTextSpy.mockRestore();
  },
};

export const PasoDeConfirmacion: Story = {
  name: "Interacción: avanzar al paso de confirmación",
  parameters: {
    docs: {
      description: {
        story:
          "Tras cargar el QR, pulsar «Continuar» sustituye el modal de escaneo por `OtpCodeModal` para introducir el código de 6 dígitos.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    const continueButton = await canvas.findByRole("button", { name: /continuar/i });
    await userEvent.click(continueButton);

    await canvas.findByRole("button", { name: /verificar/i });
    expect(canvas.getAllByRole("textbox")).toHaveLength(6);
  },
};

export const VerificacionCorrecta: Story = {
  name: "Interacción: código correcto (envío completo)",
  parameters: {
    docs: {
      description: {
        story:
          "Completa el flujo entero: carga el QR, avanza a la confirmación, introduce el código y comprueba que `verifyTwoFactorSetup()` lo recibe y `onVerified` se invoca al confirmarse la activación.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      mockVerifyTwoFactorSetup.mockReset().mockResolvedValueOnce({ status: HTTPStatus.OK });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    const canvas = within(document.body);

    const continueButton = await canvas.findByRole("button", { name: /continuar/i });
    await userEvent.click(continueButton);

    await fillOtpCode(document.body);

    const submitButton = canvas.getByRole("button", { name: /verificar/i });
    await userEvent.click(submitButton);

    await expect(mockVerifyTwoFactorSetup).toHaveBeenCalledWith("123456");
    await waitFor(() => expect(args.onVerified).toHaveBeenCalledTimes(1));
  },
};

export const VerificacionConError: Story = {
  name: "Interacción: código incorrecto",
  parameters: {
    docs: {
      description: {
        story:
          "`verifyTwoFactorSetup()` rechaza el código: se muestra el mensaje de error devuelto por la API dentro del propio `OtpCodeModal`, sin invocar `onVerified`.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      mockVerifyTwoFactorSetup
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.BAD_REQUEST, message: INVALID_CODE_MESSAGE });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    const canvas = within(document.body);

    const continueButton = await canvas.findByRole("button", { name: /continuar/i });
    await userEvent.click(continueButton);

    await fillOtpCode(document.body);

    const submitButton = canvas.getByRole("button", { name: /verificar/i });
    await userEvent.click(submitButton);

    await canvas.findByText(INVALID_CODE_MESSAGE);
    await expect(args.onVerified).not.toHaveBeenCalled();
  },
};

export const Cierre: Story = {
  name: "Interacción: cierre con botón y con Escape",
  parameters: {
    docs: {
      description: {
        story:
          "El modal es operable con teclado desde el paso de escaneo: el botón de cerrar (aspa) y la tecla Escape invocan `onClose`.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    const canvas = within(document.body);

    const closeButton = await canvas.findByRole("button", { name: /cerrar/i });
    await userEvent.click(closeButton);
    await expect(args.onClose).toHaveBeenCalledTimes(1);

    await userEvent.keyboard("{Escape}");
    await expect(args.onClose).toHaveBeenCalledTimes(2);
  },
};

export const ErrorAlCargarSinMensaje: Story = {
  name: "Error al generar el QR (sin mensaje del servidor)",
  parameters: {
    docs: {
      description: {
        story:
          "`setupTwoFactor()` devuelve un error sin un mensaje concreto (p. ej. un fallo de red): se muestra el mensaje de error genérico en el pie del modal.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.SERVICE_UNAVAILABLE });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText(/ha ocurrido un error inesperado/i);
    expect(canvas.queryByRole("button", { name: /continuar/i })).not.toBeInTheDocument();
  },
};

export const VerificacionConErrorGenerico: Story = {
  name: "Interacción: código incorrecto (sin mensaje del servidor)",
  parameters: {
    docs: {
      description: {
        story:
          "`verifyTwoFactorSetup()` rechaza el código sin un mensaje concreto: se muestra el mensaje de error genérico dentro de `OtpCodeModal`, sin invocar `onVerified`.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      mockVerifyTwoFactorSetup
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.INTERNAL_SERVER_ERROR });
      return <Story />;
    },
  ],
  play: async ({ args }) => {
    const canvas = within(document.body);

    const continueButton = await canvas.findByRole("button", { name: /continuar/i });
    await userEvent.click(continueButton);

    await fillOtpCode(document.body);

    const submitButton = canvas.getByRole("button", { name: /verificar/i });
    await userEvent.click(submitButton);

    await canvas.findByText(/ha ocurrido un error inesperado/i);
    await expect(args.onVerified).not.toHaveBeenCalled();
  },
};

export const CatalogoParaIOS: Story = {
  name: "Catálogo de apps para iOS",
  parameters: {
    docs: {
      description: {
        story:
          "Con la plataforma detectada como iOS (`parseUserAgent`), las 4 apps del catálogo tienen enlace de descarga: ninguna muestra el aviso de «solo disponible en móvil», a diferencia de la variante de escritorio.",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      mockParseUserAgent.mockReturnValueOnce({ device: "mobile", browser: "Safari", os: "iOS" });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText(SETUP_DATA.secret);

    const downloadLinks = canvas.getAllByRole("link", { name: /descargar/i });
    expect(downloadLinks).toHaveLength(AUTHENTICATOR_APPS.length);
  },
};

export const CatalogoParaAndroid: Story = {
  name: "Catálogo de apps para Android",
  parameters: {
    docs: {
      description: {
        story:
          "Con la plataforma detectada como Android (`parseUserAgent`), las 4 apps del catálogo tienen enlace de descarga: ninguna muestra el aviso de «solo disponible en móvil».",
      },
    },
  },
  decorators: [
    (Story) => {
      mockSetupTwoFactor
        .mockReset()
        .mockResolvedValueOnce({ status: HTTPStatus.OK, data: SETUP_DATA });
      mockParseUserAgent.mockReturnValueOnce({ device: "mobile", browser: "Chrome", os: "Android" });
      return <Story />;
    },
  ],
  play: async () => {
    const canvas = within(document.body);

    await canvas.findByText(SETUP_DATA.secret);

    const downloadLinks = canvas.getAllByRole("link", { name: /descargar/i });
    expect(downloadLinks).toHaveLength(AUTHENTICATOR_APPS.length);
  },
};

export const EfectoCanceladoAlDesmontar: Story = {
  name: "El efecto de carga no actualiza estado tras desmontar",
  parameters: {
    docs: {
      description: {
        story:
          "Si el modal se desmonta antes de que `setupTwoFactor()` responda, el `useEffect` de carga no debe actualizar estado sobre un componente ya desmontado (guarda `active`): al resolver la promesa después de desmontar, no debe lanzarse ningún error.",
      },
    },
  },
  render: (args) => <UnmountWrapper onClose={args.onClose} onVerified={args.onVerified} />,
  decorators: [
    (Story) => {
      mockSetupTwoFactor.mockReset().mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePendingSetup = resolve;
          }),
      );
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    // El botón de desmontar vive en `canvasElement`, pero el propio modal se
    // renderiza vía `createPortal` a `document.body` (fuera de `canvasElement`).
    const canvas = within(canvasElement);
    const bodyCanvas = within(document.body);

    await bodyCanvas.findByText(/generando tu código qr/i);

    const unmountButton = canvas.getByTestId("unmount-trigger");
    await userEvent.click(unmountButton);

    expect(bodyCanvas.queryByText(/generando tu código qr/i)).not.toBeInTheDocument();

    resolvePendingSetup?.({ status: HTTPStatus.OK, data: SETUP_DATA });
    resolvePendingSetup = undefined;

    await waitFor(() => expect(mockSetupTwoFactor).toHaveBeenCalledTimes(1));
    expect(canvas.getByTestId("unmount-trigger")).toBeInTheDocument();
  },
};
