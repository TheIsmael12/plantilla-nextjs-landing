import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import CsvPreview from "./CsvPreview";

/**
 * Sirve un CSV desde una URL `blob:`, que es lo que el componente sabe leer.
 *
 * Se usa un blob en vez de doblar `fetch`: el componente hace la petición él mismo y con esto se ejercita el
 * camino real —descarga, parseo y pintado— sin depender de un servidor ni de un mock global que afectaría al
 * resto de historias del navegador.
 * @param {string} content - El contenido del CSV
 * @returns {string} La URL del blob
 */
function csvUrl(content: string): string {
  return URL.createObjectURL(new Blob([content], { type: "text/csv" }));
}

const SIMPLE_CSV = [
  "codigo;nombre;importe",
  "FAC-001;Conserjería marzo;1.250,00",
  "FAC-002;Limpieza marzo;890,50",
  "FAC-003;Jardinería marzo;-120,00",
].join("\n");

const meta = {
  title: "UI/Files/CsvPreview",
  component: CsvPreview,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Vista previa de un CSV **con forma de hoja de cálculo**, no de tabla: cabeceras de columna en letras, números de fila, una celda activa y una barra superior con su referencia y su contenido. Es lo que espera quien abre un `.csv` desde el portal, que casi siempre viene de Excel y vuelve a Excel.\n\nEl fichero se descarga y se parsea en el cliente con `parseCsv`, que detecta el separador (`;`, `,` o tabulador), quita el BOM y respeta las comillas.\n\nLa rejilla **siempre tiene 16 columnas y 24 filas como mínimo**, aunque los datos ocupen menos: una hoja que termina justo donde acaban los datos no se lee como una hoja de cálculo. Y las filas cortas se rellenan con celdas vacías para que la rejilla no se descuadre.",
      },
    },
  },
  tags: ["autodocs"],
  args: {
    url: csvUrl(SIMPLE_CSV),
    name: "facturas.csv",
  },
} satisfies Meta<typeof CsvPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Un CSV normal, con su cabecera y tres filas. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("Conserjería marzo")).toBeInTheDocument());

    /*
     * La primera cabecera sale **dos veces**, y es correcto: una en su celda y otra en la barra de fórmulas,
     * porque A1 está activa al abrir. Buscarla con getByText fallaría por ambigüedad, no por ausencia.
     */
    await expect(canvas.getAllByText("codigo")).toHaveLength(2);
    await expect(canvas.getByText("importe")).toBeInTheDocument();
    await expect(canvas.getByText("FAC-003")).toBeInTheDocument();
  },
};

/**
 * Al abrir siempre hay una celda activa: A1, como en Excel.
 *
 * La barra de arriba enseña su referencia y su contenido; sin celda activa de salida, la barra saldría vacía y
 * parecería que falta algo.
 */
export const StartsOnA1: Story = {
  name: "Interacción — arranca en A1",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("Conserjería marzo")).toBeInTheDocument());

    await expect(canvas.getByText("A1")).toBeInTheDocument();
  },
};

/** Al pulsar una celda, la barra pasa a enseñar su referencia y su contenido. */
export const SelectsACell: Story = {
  name: "Interacción — selecciona una celda",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("Limpieza marzo")).toBeInTheDocument());

    await userEvent.click(canvas.getByText("Limpieza marzo"));

    // Columna B, tercera fila de la hoja (cabecera incluida).
    await expect(canvas.getByText("B3")).toBeInTheDocument();
  },
};

/**
 * El separador se detecta solo: este CSV va con coma y el de por defecto con punto y coma.
 *
 * Es lo que evita que un fichero exportado desde una herramienta anglosajona se pinte como una única columna con
 * todo el contenido dentro.
 */
export const CommaSeparated: Story = {
  name: "Separado por comas",
  args: {
    url: csvUrl("codigo,nombre\nFAC-001,Conserjería marzo"),
    name: "facturas-coma.csv",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("Conserjería marzo")).toBeInTheDocument());

    // Dos columnas de verdad: si el separador no se hubiera detectado, todo estaría en una sola celda.
    await expect(canvas.getByText("nombre")).toBeInTheDocument();
  },
};

/** Filas de distinta longitud: la rejilla se rellena y no se descuadra. */
export const RaggedRows: Story = {
  name: "Filas de distinta longitud",
  args: {
    // Valores en palabras, no en dígitos: los números chocarían con la columna de números de fila.
    url: csvUrl("a;b;c\nuno;dos;tres\nsolo\ncuatro;cinco"),
    name: "irregular.csv",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText("solo")).toBeInTheDocument());

    // La fila corta no arrastra a las siguientes: la última conserva sus dos valores en su sitio.
    await expect(canvas.getByText("cinco")).toBeInTheDocument();
    await expect(canvas.getByText("tres")).toBeInTheDocument();
  },
};

/** Un fichero vacío se dice con palabras, no con una hoja en blanco. */
export const EmptyFile: Story = {
  name: "Fichero vacío",
  args: { url: csvUrl(""), name: "vacio.csv" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText(/vacio\.csv/)).toBeInTheDocument());
  },
};

/**
 * Si la descarga falla, se dice cuál es el fichero que no se pudo leer.
 *
 * La URL apunta a algo que no existe, así que el `fetch` responde con un error y el componente cae a su mensaje
 * en vez de quedarse girando para siempre.
 */
export const FailsToLoad: Story = {
  name: "No se pudo cargar",
  args: { url: "/no-existe-este-fichero.csv", name: "roto.csv" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getByText(/roto\.csv/)).toBeInTheDocument());
  },
};
