import {
  BYTES_PER_MB,
  UPLOAD_LIMITS,
  type UploadZone,
} from "@/constants/ui/files";

const UNITS = ["B", "KB", "MB", "GB"] as const;

/**
 * Formatea un tamaño en bytes a la unidad legible más adecuada (`B`/`KB`/`MB`/`GB`),
 * con un decimal salvo en bytes. Usado por `DocumentLink` para mostrar el peso
 * de cualquier fichero adjunto (documentos de cliente, y en el futuro PDFs de
 * factura/contrato) sin repetir la conversión en cada vista.
 * @param {number} sizeBytes - Tamaño en bytes
 * @returns {string} El tamaño formateado (p. ej. `"1.4 MB"`)
 */
export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes <= 0) return `0 ${UNITS[0]}`;

  const exponent = Math.min(
    Math.floor(Math.log(sizeBytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = sizeBytes / 1024 ** exponent;

  return `${exponent === 0 ? value : value.toFixed(1)} ${UNITS[exponent]}`;
}

/**
 * Extensión de un nombre de fichero en mayúsculas, usada como etiqueta cuando
 * no hay vista previa que mostrar (`FileItem`). Devuelve `"FILE"` si el nombre
 * no tiene extensión, para no dejar el hueco vacío.
 * @param {string} fileName - Nombre del fichero, con o sin extensión
 * @returns {string} La extensión en mayúsculas (p. ej. `"PDF"`), o `"FILE"` si no tiene
 */
export function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop();

  return extension && extension !== fileName ? extension.toUpperCase() : "FILE";
}

/**
 * Indica si un fichero es una imagen según su tipo MIME. Lo usan los
 * componentes de `components/ui/files/` para decidir si pueden pintar una
 * vista previa y abrirlo en el visor.
 * @param {string} [mimeType] - Tipo MIME del fichero
 * @returns {boolean} `true` si es una imagen
 */
export function isImageFile(mimeType?: string): boolean {
  return mimeType?.startsWith("image/") ?? false;
}

/**
 * Indica si un fichero es un PDF según su tipo MIME. Igual que
 * {@link isImageFile}, es la condición para poder abrirlo en el visor (en su
 * caso, embebido en un `iframe`).
 * @param {string} [mimeType] - Tipo MIME del fichero
 * @returns {boolean} `true` si es un PDF
 */
export function isPdfFile(mimeType?: string): boolean {
  return mimeType === "application/pdf";
}

/**
 * Indica si un fichero es un CSV. Se comprueba también por extensión porque el
 * tipo MIME de un CSV es de todo menos fiable: según el sistema y el programa
 * que lo generó llega como `text/csv`, `application/csv`, `text/plain`,
 * `application/vnd.ms-excel` o directamente vacío.
 * @param {string} [mimeType] - Tipo MIME del fichero
 * @param {string} [fileName] - Nombre del fichero, para mirar su extensión
 * @returns {boolean} `true` si es un CSV
 */
export function isCsvFile(mimeType?: string, fileName?: string): boolean {
  if (mimeType === "text/csv" || mimeType === "application/csv") return true;

  return fileName ? getFileExtension(fileName) === "CSV" : false;
}

/**
 * Indica si un fichero puede abrirse en el visor ({@link FileViewer}): hoy,
 * imágenes, PDFs y CSVs (estos últimos como tabla). El resto solo se puede
 * descargar.
 * @param {string} [mimeType] - Tipo MIME del fichero
 * @param {string} [fileName] - Nombre del fichero, necesario para reconocer un CSV por extensión
 * @returns {boolean} `true` si el visor sabe representarlo
 */
export function isViewableFile(mimeType?: string, fileName?: string): boolean {
  return isImageFile(mimeType) || isPdfFile(mimeType) || isCsvFile(mimeType, fileName);
}

/**
 * Separador de campos de un CSV, deducido de su primera línea: se queda con el
 * candidato (`;`, `,` o tabulador) que más veces aparezca fuera de comillas.
 * Hace falta porque Excel en español exporta con `;` mientras que casi todo lo
 * demás usa `,`.
 * @param {string} headerLine - Primera línea del fichero
 * @returns {string} El separador detectado; `,` si no hay ninguno claro
 */
function detectCsvDelimiter(headerLine: string): string {
  const candidates = [";", ",", "\t"];

  let insideQuotes = false;
  const counts = new Map<string, number>(candidates.map((candidate) => [candidate, 0]));

  for (const character of headerLine) {
    if (character === '"') insideQuotes = !insideQuotes;
    if (insideQuotes) continue;

    const count = counts.get(character);
    if (count !== undefined) counts.set(character, count + 1);
  }

  const [best, bestCount] = [...counts.entries()].reduce(
    (winner, entry) => (entry[1] > winner[1] ? entry : winner),
    [",", 0] as [string, number],
  );

  return bestCount > 0 ? best : ",";
}

/**
 * Convierte el contenido de un CSV en filas de celdas, para poder pintarlo como
 * tabla en {@link FileViewer}. Detecta el separador ({@link detectCsvDelimiter}),
 * respeta los campos entre comillas (con separadores o saltos de línea dentro)
 * y las comillas escapadas (`""`), y descarta la última línea si está vacía.
 *
 * Es deliberadamente pequeño y sin dependencias: solo tiene que **mostrar** un
 * fichero: para importar datos de verdad, el que parsea es el backend
 * (`bank-csv-profiles`, importación de clientes/productos).
 * @param {string} content - Contenido completo del fichero CSV
 * @returns {string[][]} Filas, cada una con sus celdas ya sin comillas
 */
export function parseCsv(content: string): string[][] {
  const text = content.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const delimiter = detectCsvDelimiter(text.split("\n")[0] ?? "");

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index++) {
    const character = text[index];

    if (insideQuotes) {
      if (character !== '"') {
        cell += character;
        continue;
      }

      // Dos comillas seguidas dentro de un campo entrecomillado son una comilla.
      if (text[index + 1] === '"') {
        cell += '"';
        index++;
        continue;
      }

      insideQuotes = false;
      continue;
    }

    // Solo abre campo entrecomillado si la comilla está al principio de la
    // celda: una comilla suelta a mitad de campo (`Monitor 27"`) es parte del
    // texto, no el inicio de una cita — hay exportadores que no la escapan y
    // tomarla como apertura arrastraría el resto del fichero a una sola celda.
    if (character === '"' && cell === "") {
      insideQuotes = true;
      continue;
    }

    if (character === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if (character === "\n") {
      row.push(cell.trim());
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (cell !== "" || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }

  return rows.filter((cells) => cells.some((value) => value !== ""));
}

/**
 * Comprueba que un fichero cumple el límite de tamaño y de tipo de su zona de
 * subida ({@link UPLOAD_LIMITS}), **antes** de enviarlo: si no, la petición
 * gastaría la subida entera para acabar en un error de la API — o peor, en el
 * tope de `serverActions.bodySizeLimit`, que corta antes de llegar y da un
 * error genérico.
 *
 * Devuelve la clave del mensaje a mostrar en vez del texto, para que el
 * llamador lo traduzca con el `useTranslations` que ya tenga a mano.
 * @param {File} file - Fichero seleccionado
 * @param {UploadZone} zone - Zona de subida a la que va
 * @returns {{ key: "fileTooLarge" | "invalidType"; maxSizeMB: number } | null} El error a mostrar, o `null` si el fichero es válido
 */
export function validateUpload(
  file: File,
  zone: UploadZone,
): { key: "fileTooLarge" | "invalidType"; maxSizeMB: number } | null {
  const { maxSizeMB, mimeTypes, extensions } = UPLOAD_LIMITS[zone];

  if (file.size > maxSizeMB * BYTES_PER_MB) return { key: "fileTooLarge", maxSizeMB };

  // El tipo se acepta por MIME o por extensión: hay sistemas que entregan el
  // fichero con `type` vacío, sobre todo en `.docx`/`.xlsx`/`.csv`.
  const extension = `.${(file.name.split(".").pop() ?? "").toLowerCase()}`;
  const isAccepted =
    (mimeTypes as readonly string[]).includes(file.type) ||
    (extensions as readonly string[]).includes(extension);

  return isAccepted ? null : { key: "invalidType", maxSizeMB };
}

/** Esquemas de URL con los que es seguro pintar o descargar un fichero. */
const SAFE_FILE_URL_SCHEMES = ["http:", "https:", "blob:", "data:"];

/**
 * Indica si una URL de fichero se puede abrir, incrustar o descargar. Filtra
 * los esquemas ejecutables (`javascript:`, `vbscript:`) — un `href`/`src` con
 * `javascript:` ejecuta código en el origen de la aplicación, y estas URLs
 * llegan de datos guardados (el `fileUrl` de un adjunto), no de constantes del
 * código.
 * @param {string} url - URL a comprobar
 * @returns {boolean} `true` si la URL es de un esquema seguro (o una ruta relativa)
 */
export function isSafeFileUrl(url: string): boolean {
  const trimmed = url.trim();

  // Una URL vacía no es solo inútil: en un `iframe`, `src=""` recarga el propio
  // documento dentro del visor.
  if (!trimmed) return false;

  // Las rutas relativas (`/api/uploads/...`) no llevan esquema y son propias.
  if (trimmed.startsWith("/")) return !trimmed.startsWith("//");

  try {
    // La base solo se usa para poder resolver rutas relativas; lo que importa
    // es el esquema resultante.
    const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;

    return SAFE_FILE_URL_SCHEMES.includes(new URL(trimmed, base).protocol);
  } catch {
    return false;
  }
}

/**
 * Dispara la descarga de un fichero ya accesible por URL (adjunto del backend
 * o `blob:` de una selección local), sin abrir una pestaña nueva. Para ficheros
 * que llegan en base64 desde un Server Action, ver {@link downloadBase64File}.
 *
 * El atributo `download` de un `<a>` solo fuerza la descarga (y el nombre de
 * fichero) cuando la URL es del mismo origen que la página — el backend vive
 * en otro origen (otro puerto en desarrollo, otro dominio en producción), así
 * que un `<a download href="http://api...">` se limita a navegar hasta ahí,
 * dejando que el navegador decida qué hacer con la respuesta. Por eso primero
 * se trae el fichero con `fetch` y se descarga desde un `blob:` local, que sí
 * es siempre del origen de la página.
 * @param {string} url - URL del fichero; se ignora si no pasa {@link isSafeFileUrl}
 * @param {string} fileName - Nombre de fichero sugerido para la descarga
 * @returns {Promise<void>} Se resuelve cuando la descarga se ha disparado
 */
export async function downloadFileFromUrl(url: string, fileName: string): Promise<void> {
  if (!isSafeFileUrl(url)) return;

  // Un `blob:` ya es del origen de la página, así que aquí sí se respeta
  // `download`. Si la petición falla (CORS, red...), se cae al `<a>` directo:
  // en el peor caso el navegador abre el fichero en vez de descargarlo, que es
  // el comportamiento que ya había antes de este cambio.
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(blobUrl);
  } catch {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  }
}

/**
 * Dispara la descarga de un contenido de texto que **ya está en cliente**, sin
 * pedirlo al servidor: el caso típico es exportar algo que la pantalla acaba de
 * mostrar (p. ej. el volcado de datos personales de un lead, art. 20 RGPD).
 *
 * Para un fichero que produce el backend y llega en base64, ver
 * {@link downloadBase64File}; para uno accesible por URL, {@link downloadFileFromUrl}.
 * @param {string} content - Contenido del fichero, ya serializado
 * @param {string} fileName - Nombre de fichero sugerido para la descarga
 * @param {string} [mimeType] - Tipo MIME del `Blob`; por defecto texto plano
 * @returns {void}
 */
export function downloadTextFile(
  content: string,
  fileName: string,
  mimeType = "text/plain;charset=utf-8",
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}

/**
 * Decodifica un fichero en base64 (recibido de un Server Action, ver
 * `exportClientsCsv`/`exportProductsCsv`) a `Blob` y dispara su descarga,
 * sin depender de ningún estado del DOM más allá de un `<a>` temporal.
 * @param {string} base64 - Contenido del fichero codificado en base64
 * @param {string} fileName - Nombre de fichero sugerido para la descarga
 * @param {string} [mimeType] - Tipo MIME del `Blob`; por defecto CSV
 * @returns {void}
 */
export function downloadBase64File(
  base64: string,
  fileName: string,
  mimeType = "text/csv;charset=utf-8",
): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
