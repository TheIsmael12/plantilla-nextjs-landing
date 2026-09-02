/**
 * Un contrato pendiente de firma
 * (`GET client/me/contracts/pending`, requisitos-servicios.md sección 3.9).
 *
 * Va por cliente y **no** colgando de un servicio contratado, porque cuando un contrato está pendiente
 * todavía no hay servicio: se crea al convertir el pedido, y eso exige el contrato ya firmado. Colgarlo de
 * la ficha de un servicio lo habría dejado en un sitio al que no se puede llegar hasta que deja de hacer
 * falta.
 * @interface PendingContract
 * @property {string} id - Identificador del contrato
 * @property {string} serviceName - El servicio que se contrata
 * @property {string} quoteCode - Código del presupuesto del que sale
 * @property {string} status - Estado del contrato; aquí siempre `SENT_FOR_SIGNATURE`
 * @property {ContractSignatureMethod} signatureMethod - Cómo estaba previsto firmarlo
 * @property {string} [sentAt] - Cuándo se envió a firmar (ISO 8601)
 * @property {string} [expiresAt] - Hasta cuándo se puede firmar (ISO 8601)
 * @property {string} [signUrl] - Página del proveedor donde firma el siguiente de la cadena
 * @property {string} [signerEmail] - A nombre de quién está esa firma
 * @property {boolean} hasPendingUpload - Si ya hay un documento suyo esperando revisión
 * @property {string} [uploadedAt] - Cuándo lo subió (ISO 8601)
 */
export interface PendingContract {
  id: string;
  serviceName: string;
  quoteCode: string;
  status: string;
  signatureMethod: ContractSignatureMethod;
  sentAt?: string;
  expiresAt?: string;
  /*
   * Solo llega la del **siguiente** de la cadena.
   *
   * La firma es en cadena: el proveedor no libera al de después hasta que el de antes firma, así que
   * cualquier otra llevaría a una página que todavía no deja hacer nada. Y puede no llegar ninguna —hay
   * proveedores que la entregan más tarde—, en cuyo caso se enseña el contrato sin botón de firmar en vez
   * de un enlace roto.
   */
  signUrl?: string;
  signerEmail?: string;
  hasPendingUpload: boolean;
  uploadedAt?: string;
  /*
   * Por qué se descartó lo que subió antes.
   *
   * El correo que se lo dice se lee una vez y se pierde; esto sigue estando aquí cuando entra a
   * arreglarlo, que es el momento en que hace falta leerlo. Desaparece en cuanto sube algo nuevo.
   */
  rejectedReason?: string;
  rejectedAt?: string;
}

/** Cómo estaba previsto firmar un contrato. No impide entregar el papel firmado. */
export type ContractSignatureMethod = "ELECTRONIC" | "MANUAL";
