import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import type { FileAttachment } from "@/types/ui/files/file-list";

import FileList from "./FileList";

/** Un PNG de 1×1 en `data:`, para que la miniatura tenga algo real que pintar sin pedir nada a la red. */
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const FILES: FileAttachment[] = [
  { id: "1", name: "contrato.pdf", sizeBytes: 245_000, src: "/uploads/contrato.pdf", mimeType: "application/pdf" },
  { id: "2", name: "portada.png", sizeBytes: 88_000, src: TINY_PNG, mimeType: "image/png" },
  { id: "3", name: "presupuesto.xlsx", sizeBytes: 12_400, src: "/uploads/presupuesto.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
];

const meta = {
  title: "UI/Files/FileList",
  component: FileList,
  parameters: {
    docs: {
      description: {
        component:
          "Lista de adjuntos, con su miniatura, su nombre y su tamaño ya formateado.\n\nCada fila ofrece **solo las acciones que le pasen**: sin `onRemove` no hay botón de quitar, y con `canRemove` se decide fichero a fichero —el caso real es dejar borrar solo lo que subió uno mismo—.\n\n**Solo los previsualizables abren el visor** (imágenes, PDF y CSV); un `.xlsx` se descarga y no se intenta pintar. Al abrirlo, el índice que recibe el visor es la posición dentro de los previsualizables, no dentro de la lista: si no, pulsar la tercera fila abriría el fichero equivocado.\n\n`resolveUrl` transforma el `src` antes de usarlo —para anteponer el origen del backend a una ruta relativa—, y `resolveThumbnailUrl` permite que la fila pinte una miniatura ligera mientras el visor abre el original.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    files: FILES,
  },
} satisfies Meta<typeof FileList>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Solo lectura: ni descargar ni quitar. */
export const ReadOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("contrato.pdf")).toBeInTheDocument();
    await expect(canvas.getByText("presupuesto.xlsx")).toBeInTheDocument();

    /*
     * Sin `onRemove` no hay botón de quitar, pero **sí hay descarga**: la lista trae la suya por defecto.
     *
     * Y solo en el .xlsx: los previsualizables llevan «Ver» en su lugar, porque descargar un PDF que se puede
     * abrir ahí mismo es un paso de más. Ver la historia de más abajo.
     */
    await expect(canvas.queryByRole("button", { name: "Quitar archivo" })).toBeNull();
    await expect(canvas.getAllByRole("button", { name: "Descargar" })).toHaveLength(1);
  },
};

/** El tamaño se enseña ya formateado, no en bytes crudos. */
export const ShowsFormattedSize: Story = {
  name: "Enseña el tamaño formateado",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("239.3 KB")).toBeInTheDocument();
    await expect(canvas.getByText("12.1 KB")).toBeInTheDocument();
  },
};

/** Con descarga y borrado en todas las filas. */
export const WithActions: Story = {
  args: { onDownload: fn(), onRemove: fn() },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Quitar sale en las tres; descargar solo en la que no se puede previsualizar.
    await expect(canvas.getAllByRole("button", { name: "Quitar archivo" })).toHaveLength(3);
    await expect(canvas.getAllByRole("button", { name: "Descargar" })).toHaveLength(1);
  },
};

export const RemovesAFile: Story = {
  name: "Interacción — quita un fichero",
  args: { onRemove: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const [firstRemove] = canvas.getAllByRole("button", { name: "Quitar archivo" });
    await userEvent.click(firstRemove!);

    // Se devuelve el fichero **y su índice**: quien lo use necesita los dos para quitarlo de su estado.
    await expect(args.onRemove).toHaveBeenCalledWith(FILES[0], 0);
  },
};

/**
 * La descarga personalizada se usa en el fichero que la ofrece, con su índice **de la lista**.
 *
 * El botón está en el .xlsx —índice 2—, que es el único no previsualizable de este juego de datos.
 */
export const DownloadsAFile: Story = {
  name: "Interacción — descarga un fichero",
  args: { onDownload: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Descargar" }));

    await expect(args.onDownload).toHaveBeenCalledWith(FILES[2], 2);
  },
};

/**
 * `canRemove` decide fila a fila.
 *
 * El caso real es un hilo de incidencia donde cada uno solo puede borrar lo suyo: sin esto, la única opción sería
 * quitar el botón para todos o dejar que cualquiera borre los adjuntos del técnico.
 */
export const PartiallyRemovable: Story = {
  name: "Solo algunos se pueden quitar",
  args: {
    onRemove: fn(),
    canRemove: (file: FileAttachment) => file.id === "2",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("button", { name: "Quitar archivo" })).toHaveLength(1);
  },
};

/** Deshabilitada: las acciones se ven pero no responden. */
export const Disabled: Story = {
  args: { onDownload: fn(), onRemove: fn(), disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const button of canvas.getAllByRole("button", { name: "Descargar" })) {
      await expect(button).toBeDisabled();
    }
  },
};

/**
 * Solo los previsualizables ofrecen abrir el visor.
 *
 * El `.xlsx` no lo es, así que su fila no tiene el botón de ver: ofrecerlo llevaría a un visor que no sabe pintar
 * una hoja de Excel y acabaría en un mensaje de error evitable.
 */
export const OnlyViewableOpenTheViewer: Story = {
  name: "Solo los previsualizables se pueden ver",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // PDF e imagen sí; la hoja de cálculo no.
    await expect(canvas.getByRole("button", { name: "Ver contrato.pdf" })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "Ver portada.png" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Ver presupuesto.xlsx" })).toBeNull();
  },
};

/**
 * Al abrir el visor se avisa con el fichero y su índice **en la lista**, no en los previsualizables.
 *
 * Es lo que permite a quien la usa traerse el original del backend cuando la fila solo tenía una miniatura.
 */
export const OpensTheViewer: Story = {
  name: "Interacción — abre el visor",
  args: { onView: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "Ver portada.png" }));

    await expect(args.onView).toHaveBeenCalledWith(FILES[1], 1);

    // El visor se monta fuera del contenedor de la historia, en un portal.
    const screen = within(canvasElement.ownerDocument.body);
    await waitFor(() => expect(screen.getAllByText("portada.png").length).toBeGreaterThan(0));
  },
};

/** Con la lista vacía no se pinta nada, ni un contenedor con su borde. */
export const Empty: Story = {
  args: { files: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole("button")).toBeNull();
  },
};

/**
 * `resolveUrl` antepone el origen del backend a una ruta relativa.
 *
 * Los adjuntos llegan como `/uploads/…` y el backend vive en otro origen; sin transformar, la miniatura pediría
 * el fichero al propio Next y devolvería un 404.
 */
export const WithResolvedUrls: Story = {
  name: "Con URLs resueltas",
  args: {
    files: [FILES[1]!],
    resolveUrl: (src: string) => (src.startsWith("data:") ? src : `https://api.enovait.es${src}`),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("portada.png")).toBeInTheDocument();
  },
};
