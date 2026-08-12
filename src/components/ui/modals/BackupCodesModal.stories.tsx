import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, spyOn, userEvent, within } from "storybook/test";

import BackupCodesModal from "./BackupCodesModal";

const RECOVERY_CODES = [
  "4F7K-9XZP",
  "R2QW-8LMN",
  "T6YB-3JHC",
  "V9DK-1PXR",
  "M4NQ-7WZT",
  "B8FL-2KYX",
  "H3RC-6VDM",
  "J5TP-4NWQ",
];

const meta = {
  title: "UI/Modals/BackupCodesModal",
  component: BackupCodesModal,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Muestra un lote de códigos de recuperación de la verificación en dos pasos una única vez (tras activar o regenerar, §7.1 requisitos.md), con opciones de copiar (al portapapeles) o descargar (como fichero `.txt`) antes de cerrar — no volverán a mostrarse. Sin `isOpen`: el padre solo lo monta mientras hay códigos que enseñar, y fuerza `closeOnOutsideClick={false}` para evitar cierres accidentales antes de guardarlos.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    codes: {
      control: false,
      description: "Códigos de recuperación a mostrar, uno por celda de la rejilla de dos columnas.",
    },
    onClose: { action: "closed" },
  },
  args: {
    codes: RECOVERY_CODES,
    onClose: fn(),
  },
} satisfies Meta<typeof BackupCodesModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const UnSoloCodigo: Story = {
  name: "Un único código",
  parameters: {
    docs: {
      description: {
        story:
          "La rejilla de dos columnas también debe funcionar con un único código, por ejemplo si el resto ya se han consumido antes de volver a regenerarlos.",
      },
    },
  },
  args: {
    codes: ["4F7K-9XZP"],
  },
};

export const CopiarCodigos: Story = {
  name: "Interacción: copiar códigos",
  parameters: {
    docs: {
      description: {
        story:
          "Al hacer clic en «Copiar» se copian todos los códigos (separados por saltos de línea) al portapapeles y el botón pasa a mostrar «Copiado» con el icono de confirmación.",
      },
    },
  },
  play: async () => {
    // `ModalComponent` renderiza vía `createPortal` a `document.body`, fuera
    // de `canvasElement`: hay que consultar el DOM completo, como ya hacen
    // `RowActionsMenu.stories.tsx`/`SelectSearch.stories.tsx` para sus menús/listas portaladas.
    const canvas = within(document.body);

    const writeTextSpy = spyOn(navigator.clipboard, "writeText").mockResolvedValue(
      undefined,
    );

    const copyButton = canvas.getByRole("button", { name: /copiar/i });
    await userEvent.click(copyButton);

    await expect(writeTextSpy).toHaveBeenCalledWith(RECOVERY_CODES.join("\n"));
    await canvas.findByRole("button", { name: /copiado/i });

    writeTextSpy.mockRestore();
  },
};

export const DescargarCodigos: Story = {
  name: "Interacción: descargar códigos",
  parameters: {
    docs: {
      description: {
        story:
          "Al hacer clic en «Descargar» se genera un fichero de texto (`codigos-recuperacion.txt`) con todos los códigos.",
      },
    },
  },
  play: async () => {
    const canvas = within(document.body);

    const createObjectURLSpy = spyOn(URL, "createObjectURL").mockReturnValue(
      "blob:mock-url",
    );
    const revokeObjectURLSpy = spyOn(URL, "revokeObjectURL").mockImplementation(
      () => undefined,
    );

    const downloadButton = canvas.getByRole("button", { name: /descargar/i });
    await userEvent.click(downloadButton);

    await expect(createObjectURLSpy).toHaveBeenCalled();
    await expect(revokeObjectURLSpy).toHaveBeenCalled();

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  },
};

export const Cierre: Story = {
  name: "Interacción: cierre del modal",
  parameters: {
    docs: {
      description: {
        story:
          "El modal es operable con teclado: el botón de cerrar (aspa, con `aria-label`), la tecla Escape y el botón «Listo» del pie invocan todos `onClose` (confirmar equivale aquí a cerrar, una vez guardados los códigos).",
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

    const doneButton = canvas.getByRole("button", { name: /listo/i });
    await userEvent.click(doneButton);
    await expect(args.onClose).toHaveBeenCalledTimes(3);
  },
};
