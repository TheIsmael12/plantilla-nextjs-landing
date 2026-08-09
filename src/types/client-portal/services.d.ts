/** Estado de un servicio contratado (`ClientServiceStatus` del backend). */
export type ClientServiceStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "PAUSED"
  | "CANCELLED"
  | "COMPLETED";

/** Periodicidad de facturación de un servicio o presupuesto (`BillingFrequency` del backend). */
export type BillingFrequency =
  | "ONE_OFF"
  | "MONTHLY"
  | "QUARTERLY"
  | "SEMIANNUAL"
  | "ANNUAL";

/** Momento de cobro respecto al periodo prestado (`PaymentTiming` del backend). */
export type PaymentTiming = "ADVANCE" | "ARREARS";

/** Política de renovación al vencer el contrato (`RenewalPolicy` del backend). */
export type RenewalPolicy = "NONE" | "AUTO_RENEW" | "MANUAL_RENEWAL";

/** Estado de una revisión de precio programada (`PriceRevisionStatus` del backend). */
export type PriceRevisionStatus = "SCHEDULED" | "APPLIED" | "CANCELLED";

/** Estado de una tarea asociada a un servicio contratado (`TaskStatus` del backend). */
export type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "BLOCKED";

/** Rol de un miembro del equipo asignado a un servicio (`ClientServiceMemberRole` del backend). */
export type ClientServiceMemberRole = "RESPONSIBLE" | "EXECUTOR";

/**
 * Elemento del listado `GET client/me/services`: versión ligera de un servicio
 * contratado, sin líneas ni equipo.
 * @interface ClientServiceListItem
 * @property {string} id - Identificador del servicio contratado
 * @property {string} code - Código de contrato (`CTR-000001`)
 * @property {string} serviceName - Nombre del servicio contratado
 * @property {string} serviceCode - Código del catálogo de servicios (`SRV-000001`)
 * @property {ClientServiceStatus} status - Estado actual del contrato
 * @property {BillingFrequency} billingFrequency - Periodicidad de facturación
 * @property {string} startDate - Fecha de inicio (ISO `YYYY-MM-DD`)
 * @property {string} [endDate] - Fecha de fin, si el contrato tiene duración determinada
 * @property {number} [basePrice] - Precio base; el backend lo omite cuando `canReadPrices` es `false`
 * @property {number} [baseQuantity] - Cantidad base contratada
 * @property {boolean} canReadPrices - Si el contacto del portal tiene permiso para ver importes
 * @property {ClientServiceAddress} [address] - Dónde se presta el servicio, si tiene ubicación asignada
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 * @property {string} updatedAt - Fecha de última modificación (ISO 8601)
 */
export interface ClientServiceListItem {
  id: string;
  code: string;
  serviceName: string;
  serviceCode: string;
  status: ClientServiceStatus;
  billingFrequency: BillingFrequency;
  startDate: string;
  endDate?: string;
  basePrice?: number;
  baseQuantity?: number;
  canReadPrices: boolean;
  address?: ClientServiceAddress;
  createdAt: string;
  updatedAt: string;
}

/**
 * Miembro del equipo asignado a un servicio contratado.
 * @interface ClientServiceTeamMember
 * @property {string} userId - Identificador del usuario asignado
 * @property {string} firstName - Nombre del usuario
 * @property {string} lastName - Apellidos del usuario
 * @property {ClientServiceMemberRole} role - Rol dentro del servicio
 */
export interface ClientServiceTeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  role: ClientServiceMemberRole;
}

/**
 * Extra contratado sobre un servicio (línea adicional recurrente).
 * @interface ClientServiceExtra
 * @property {string} id - Identificador del extra
 * @property {string} name - Nombre del extra
 * @property {string} [unit] - Unidad de medida
 * @property {number} quantity - Cantidad contratada
 * @property {number} [price] - Precio del extra, si el portal puede verlo
 */
export interface ClientServiceExtra {
  id: string;
  name: string;
  unit?: string;
  quantity: number;
  price?: number;
}

/**
 * Bolsa de horas asociada a un servicio contratado.
 * @interface ClientServiceHourBank
 * @property {number} contractedHours - Horas contratadas en la bolsa
 * @property {number} [approvedHours] - Horas ya aprobadas/consumidas
 */
export interface ClientServiceHourBank {
  contractedHours: number;
  approvedHours?: number;
}

/**
 * Tarea planificada dentro de un servicio contratado.
 * @interface ClientServiceTask
 * @property {string} id - Identificador de la tarea
 * @property {string} title - Título de la tarea
 * @property {TaskStatus} status - Estado actual
 * @property {string} [dueDate] - Fecha de vencimiento (ISO `YYYY-MM-DD`)
 */
export interface ClientServiceTask {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate?: string;
}

/**
 * Detalle "redactado" de `GET client/me/services/:id`: DTO propio y distinto
 * del de listado — aquí `basePrice` viene siempre (el backend ya ha aplicado
 * la comprobación de permisos antes de responder), pero no incluye ni el
 * código de contrato ni las fechas del listado.
 * @interface ClientServiceDetail
 * @property {string} id - Identificador del servicio contratado
 * @property {string} serviceName - Nombre del servicio
 * @property {string} [serviceDescription] - Descripción del servicio
 * @property {ClientServiceStatus} status - Estado actual del contrato
 * @property {number} baseQuantity - Cantidad base contratada
 * @property {number} basePrice - Precio base contratado
 * @property {string} [baseUnit] - Unidad de medida de la cantidad base
 * @property {ClientServiceAddress} [address] - Dónde se presta el servicio, si tiene ubicación asignada
 * @property {ClientServiceTeamMember[]} [team] - Equipo asignado al servicio
 * @property {ClientServiceExtra[]} [extras] - Extras contratados
 * @property {ClientServiceHourBank} [hourBank] - Bolsa de horas, si el servicio la tiene
 * @property {ClientServiceTask[]} [tasks] - Tareas planificadas
 */
export interface ClientServiceDetail {
  id: string;
  serviceName: string;
  serviceDescription?: string;
  status: ClientServiceStatus;
  baseQuantity: number;
  basePrice: number;
  baseUnit?: string;
  address?: ClientServiceAddress;
  team?: ClientServiceTeamMember[];
  extras?: ClientServiceExtra[];
  hourBank?: ClientServiceHourBank;
  tasks?: ClientServiceTask[];
}

/**
 * Dirección donde se presta un servicio contratado.
 * @interface ClientServiceAddress
 * @property {string} [label] - Etiqueta libre de la dirección
 * @property {string} line1 - Primera línea de la dirección
 * @property {string} [line2] - Segunda línea de la dirección
 * @property {string} city - Ciudad
 * @property {string} [province] - Provincia
 * @property {string} postalCode - Código postal
 * @property {string} country - País
 */
export interface ClientServiceAddress {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  province?: string;
  postalCode: string;
  country: string;
}

/**
 * Revisión de precio de `GET client/me/services/:id/price-revisions`.
 * @interface ClientServicePriceRevision
 * @property {string} id - Identificador de la revisión
 * @property {number} previousPrice - Precio antes de la revisión
 * @property {number} newPrice - Precio tras la revisión
 * @property {number} [previousQuantity] - Cantidad antes de la revisión
 * @property {number} [newQuantity] - Cantidad tras la revisión
 * @property {string} effectiveFrom - Fecha desde la que aplica (ISO `YYYY-MM-DD`)
 * @property {string} [reason] - Motivo de la revisión
 * @property {PriceRevisionStatus} status - Estado de la revisión
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 */
export interface ClientServicePriceRevision {
  id: string;
  previousPrice: number;
  newPrice: number;
  previousQuantity?: number;
  newQuantity?: number;
  effectiveFrom: string;
  reason?: string;
  status: PriceRevisionStatus;
  createdAt: string;
}

/**
 * Filtros de `GET client/me/services`.
 * @interface ClientServicesQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 * @property {ClientServiceStatus} [status] - Filtro por estado
 * @property {"ASC" | "DESC"} [sortOrder] - Orden de resultados
 * @property {string} [search] - Búsqueda libre por código de contrato o nombre del servicio
 */
export interface ClientServicesQuery {
  page?: number;
  limit?: number;
  status?: ClientServiceStatus;
  sortOrder?: "ASC" | "DESC";
  search?: string;
}

/**
 * Filtros de paginación simples de las subcolecciones de un servicio
 * (`/quotes`, `/price-revisions`), que no admiten más filtros.
 * @interface ClientServiceSubResourceQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 */
export interface ClientServiceSubResourceQuery {
  page?: number;
  limit?: number;
}
