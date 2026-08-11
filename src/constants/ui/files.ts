/**
 * Límites de subida de cada zona de la aplicación, **espejo de lo que valida la
 * API**. Cada entrada corresponde a un endpoint concreto del backend
 * (`plantilla-nestjs`), con su `ParseFilePipeBuilder`:
 *
 * | Zona | Endpoint | Límite en el backend |
 * |---|---|---|
 * | `avatar` | `POST users/me/avatar`, `PATCH users/{id}/avatar` | `AVATAR_MAX_SIZE_BYTES` (2 MB) |
 * | `companyLogo` | `POST company-settings/logo` | 2 MB |
 * | `clientDocument` | `POST clients/{id}/documents` | `MAX_DOCUMENT_SIZE_BYTES` (20 MB) |
 * | `purchaseInvoiceFile` | `POST purchase-invoices/{id}/file` | 20 MB |
 * | `signedContract` | `POST client-service-contracts/{id}/manual-signature` | `CONTRACT_MAX_SIZE_BYTES` (10 MB) |
 * | `bankStatement` | `POST bank-statements/import` | 10 MB |
 * | `incidentAttachment` | `POST incidents/{id}/attachments` | `UPLOAD_LIMITS_BYTES.INCIDENT_ATTACHMENT` (20 MB) |
 * | `csvImport` | `POST clients/import`, `POST products/import` | `IMPORT_MAX_SIZE_BYTES` (5 MB) |
 *
 * Validar en cliente no sustituye a la API — que sigue rechazando lo que no
 * cumpla — sino que evita gastar la subida entera para recibir un error, y
 * permite decir cuál es el máximo antes de intentarlo.
 *
 * **Al cambiar un límite hay que cambiarlo en los dos lados**, y además revisar
 * `serverActions.bodySizeLimit` de `next.config.ts`: las subidas viajan como
 * `FormData` a través de una Server Action, y ese tope corta la petición antes
 * de que llegue a la API.
 * @constant
 */
export const UPLOAD_LIMITS = {
  avatar: {
    maxSizeMB: 2,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
  },
  companyLogo: {
    maxSizeMB: 2,
    mimeTypes: ["image/png", "image/jpeg", "image/webp"],
    extensions: [".png", ".jpg", ".jpeg", ".webp"],
  },
  clientDocument: {
    maxSizeMB: 20,
    mimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    extensions: [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".docx", ".xlsx"],
  },
  purchaseInvoiceFile: {
    maxSizeMB: 20,
    mimeTypes: ["application/pdf", "image/png", "image/jpeg", "image/webp"],
    extensions: [".pdf", ".png", ".jpg", ".jpeg", ".webp"],
  },
  signedContract: {
    maxSizeMB: 10,
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
  },
  bankStatement: {
    // El formato lo elige el usuario en el propio modal (CAMT053 en XML, MT940
    // en .sta/.txt o CSV), así que aquí se aceptan los cuatro.
    maxSizeMB: 10,
    mimeTypes: ["application/xml", "text/xml", "text/csv", "text/plain"],
    extensions: [".xml", ".csv", ".sta", ".txt"],
  },
  incidentAttachment: {
    maxSizeMB: 20,
    // Lo que de verdad se adjunta a una avería: una foto, un PDF, el presupuesto de un tercero. Sin
    // nada ejecutable, y sin SVG, que es un documento con scripts disfrazado de imagen.
    mimeTypes: [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/heic",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    extensions: [".pdf", ".png", ".jpg", ".jpeg", ".webp", ".heic", ".docx", ".xlsx"],
  },
  csvImport: {
    maxSizeMB: 5,
    mimeTypes: ["text/csv"],
    extensions: [".csv"],
  },
} as const;

/**
 * Zona de subida de la aplicación, cada una con su propio límite y sus tipos
 * admitidos en {@link UPLOAD_LIMITS}.
 * @typedef {("avatar"|"companyLogo"|"clientDocument"|"purchaseInvoiceFile"|"signedContract"|"bankStatement"|"incidentAttachment"|"csvImport")} UploadZone
 */
export type UploadZone = keyof typeof UPLOAD_LIMITS;

/**
 * Valor del atributo `accept` de una zona: sus tipos MIME y sus extensiones.
 * Las extensiones hacen falta porque algunos sistemas entregan el fichero con
 * `type` vacío (sobre todo `.docx`/`.xlsx`/`.csv`), y sin ellas el diálogo del
 * sistema los mostraría en gris.
 * @param {UploadZone} zone - Zona de subida
 * @returns {string} El valor listo para el atributo `accept`
 */
export function uploadAccept(zone: UploadZone): string {
  const { mimeTypes, extensions } = UPLOAD_LIMITS[zone];

  return [...mimeTypes, ...extensions].join(",");
}

/** Bytes en un MB, para convertir los límites en MB de este fichero a lo que expone `File.size`. */
export const BYTES_PER_MB = 1024 * 1024;

/**
 * Número máximo de ficheros que admite un {@link FileUpload} cuando la vista
 * no impone su propio límite. Es un tope de interfaz, no de negocio: la API
 * vuelve a validarlo en cada subida.
 * @constant
 * @type {number}
 */
export const MAX_FILES = 5;

/**
 * Tamaño máximo por fichero, en MB, de un {@link FileUpload} que no indique
 * zona. Coincide con el límite más restrictivo de los adjuntos de documento
 * (`clientDocument` sube hasta 20 MB, pero un campo genérico no debería
 * prometer más de lo que acepta la zona más pequeña donde se use).
 * @constant
 * @type {number}
 */
export const MAX_FILE_SIZE_MB = 10;

/**
 * Tamaño máximo del conjunto de ficheros seleccionados, en MB. Es un límite
 * aparte de {@link MAX_FILE_SIZE_MB} porque varios ficheros válidos por
 * separado pueden sumar más de lo que acepta una única petición — y por encima
 * está el tope de `serverActions.bodySizeLimit`.
 * @constant
 * @type {number}
 */
export const MAX_TOTAL_SIZE_MB = 20;

/**
 * Tipos MIME aceptados por defecto por {@link FileUpload}: la unión de lo que
 * admiten las zonas de adjuntos, que es lo que se sube en el producto
 * (justificantes, contratos escaneados, fotos de incidencia).
 * @constant
 * @type {readonly string[]}
 */
export const ACCEPTED_MIME_TYPES = UPLOAD_LIMITS.clientDocument.mimeTypes;

/**
 * Extensiones aceptadas por defecto, en paralelo a {@link ACCEPTED_MIME_TYPES}:
 * algunos sistemas operativos entregan el fichero con `type` vacío (sobre todo
 * `.docx`/`.xlsx`), así que la extensión es la segunda vía de validación.
 * @constant
 * @type {readonly string[]}
 */
export const ACCEPTED_EXTENSIONS = [...UPLOAD_LIMITS.clientDocument.extensions, ".csv"] as const;

/**
 * Valor por defecto del atributo `accept` del `<input type="file">` de
 * {@link FileUpload}: MIME y extensiones juntos, que es como el navegador filtra
 * el diálogo del sistema. Solo filtra la selección — la validación real la hace
 * el componente, y la definitiva la API.
 * @constant
 * @type {string}
 */
export const ACCEPTED_FILE_TYPES = [...ACCEPTED_MIME_TYPES, ...ACCEPTED_EXTENSIONS].join(",");
