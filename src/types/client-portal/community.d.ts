/** Tipo de unidad del edificio (`CommunityUnitType` del backend). */
export type CommunityUnitType =
  | "PORTAL"
  | "VIVIENDA"
  | "LOCAL"
  | "GARAJE"
  | "TRASTERO"
  | "COMUN";

/** Estado de la cuenta de un vecino (`ResidentAccountStatus` del backend). */
export type ResidentAccountStatus = "ACTIVE" | "BLOCKED";

/** Rol de un vecino dentro de la comunidad (`ResidentRole` del backend). */
export type ResidentRole = "PROPIETARIO" | "INQUILINO" | "PRESIDENTE" | "ADMINISTRADOR";

/** Estado de la pertenencia de un vecino a la comunidad (`ResidentMembershipStatus` del backend). */
export type ResidentMembershipStatus = "ACTIVE" | "REVOKED";

/** Estado de una invitación enviada a un vecino (`ResidentInvitationStatus` del backend). */
export type ResidentInvitationStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";

/** Proveedor de la cerradura electrónica (`LockProviderName` del backend). */
export type LockProviderName = "AKILES" | "GENERIC_MANUAL";

/** Forma en que la cerradura se comunica con el sistema (`LockConnectivity` del backend). */
export type LockConnectivity = "BLE_ONLY" | "GATEWAY" | "WIFI";

/** Estado operativo de una cerradura (`CommunityLockStatus` del backend). */
export type CommunityLockStatus = "ACTIVE" | "OFFLINE" | "MAINTENANCE" | "RETIRED";

/** Modo de horario de una cerradura (`LockScheduleMode` del backend). */
export type LockScheduleMode = "ALWAYS_OPEN" | "SCHEDULED";

/** Tipo de credencial de acceso (`LockCredentialType` del backend). */
export type LockCredentialType = "NFC_CARD" | "NFC_PHONE" | "PIN" | "APP";

/** Estado de una credencial respecto a su sincronización con las cerraduras (`LockCredentialStatus` del backend). */
export type LockCredentialStatus =
  | "PENDING_SYNC"
  | "ACTIVE"
  | "PARTIALLY_SYNCED"
  | "PENDING_REVOKE"
  | "REVOKED"
  | "EXPIRED";

/** Estado de sincronización de una credencial en una cerradura concreta (`LockCredentialSyncStatus` del backend). */
export type LockCredentialSyncStatus =
  | "PENDING"
  | "SYNCED"
  | "FAILED"
  | "PENDING_REVOKE"
  | "REVOKED";

/** Método con el que se intentó abrir una cerradura (`LockAccessMethod` del backend). */
export type LockAccessMethod = "NFC" | "PIN" | "APP" | "BUTTON" | "PHYSICAL_KEY" | "REMOTE";

/** Resultado de un intento de acceso (`LockAccessResult` del backend). */
export type LockAccessResult =
  | "GRANTED"
  | "GRANTED_BYPASS"
  | "DENIED_UNKNOWN"
  | "DENIED_EXPIRED"
  | "DENIED_LOCK_SCHEDULE"
  | "DENIED_CREDENTIAL_SCHEDULE"
  | "DENIED_LOCK_DISABLED"
  | "ERROR";

/** Día de la semana de un tramo horario (`DayOfWeek` del backend). */
export type DayOfWeek = "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT" | "SUN";

/** Prioridad de una incidencia (`IncidentPriority` del backend). */
export type IncidentPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

/** Estado de una incidencia (`IncidentStatus` del backend). */
export type IncidentStatus =
  | "NUEVA"
  | "EN_CURSO"
  | "ESPERANDO_TERCERO"
  | "RESUELTA"
  | "CERRADA"
  | "RECHAZADA";

/** Estado de una celda de la matriz de llaves: si ese vecino tiene o no llave de esa puerta. */
export type KeyMatrixCellState = "GRANTED" | "PENDING" | "EXPIRED" | "OUT_OF_SCHEDULE" | "NONE";

/**
 * Comunidad activa sobre un servicio contratado (`GET client/me/communities`).
 * El listado no está paginado: un cliente tiene como mucho un puñado.
 * @interface PortalCommunity
 * @property {string} serviceId - Identificador del servicio contratado que soporta la comunidad
 * @property {string} serviceCode - Código de contrato del servicio
 * @property {string} serviceName - Nombre del servicio contratado
 * @property {ClientServiceAddress} [address] - Dónde está el edificio, si el servicio tiene una dirección asignada
 * @property {number} units - Número de unidades dadas de alta
 * @property {number} residents - Número de vecinos activos
 * @property {boolean} incidentsEnabled - Si el módulo de incidencias está activo
 * @property {boolean} keyringEnabled - Si el módulo de llaveros/credenciales está activo
 * @property {boolean} noticeboardEnabled - Si el tablón de anuncios está activo
 * @property {boolean} residentsManagedByClient - Si el cliente gestiona sus vecinos (si no, los gestiona personal interno)
 */
export interface PortalCommunity {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  address?: ClientServiceAddress;
  units: number;
  residents: number;
  incidentsEnabled: boolean;
  keyringEnabled: boolean;
  noticeboardEnabled: boolean;
  residentsManagedByClient: boolean;
}

/**
 * Configuración de la comunidad (`GET/PUT client/me/communities/:serviceId/config`).
 * Solo una parte de los campos es editable por el cliente; el resto los fija
 * el contrato y llegan aquí únicamente para poder mostrarlos.
 * @interface PortalCommunityConfig
 * @property {boolean} isEnabled - Si la app de comunidad está activa (solo lectura)
 * @property {boolean} keyringEnabled - Si el módulo de llaveros está contratado (solo lectura)
 * @property {number} maxResidents - Máximo de vecinos que permite el contrato (solo lectura)
 * @property {boolean} residentsManagedByClient - Si el cliente gestiona sus vecinos (solo lectura)
 * @property {string} timeZone - Zona horaria con la que se evalúan los horarios (solo lectura)
 * @property {boolean} incidentsEnabled - Si los vecinos pueden abrir incidencias
 * @property {boolean} noticeboardEnabled - Si el tablón de anuncios está visible para los vecinos
 * @property {boolean} allowGoogleSignIn - Si los vecinos pueden entrar con Google
 * @property {boolean} allowPasswordSignIn - Si los vecinos pueden entrar con contraseña
 * @property {ResidentRole} defaultResidentRole - Rol asignado por defecto a un vecino nuevo
 * @property {number} maxOpenIncidentsPerResident - Máximo de incidencias abiertas por vecino (1-100)
 * @property {number} maxPhotosPerIncident - Máximo de fotos por incidencia (1-20)
 * @property {number} activeResidents - Vecinos activos ahora mismo (calculado, solo lectura)
 */
export interface PortalCommunityConfig {
  isEnabled: boolean;
  keyringEnabled: boolean;
  maxResidents: number;
  residentsManagedByClient: boolean;
  timeZone: string;
  incidentsEnabled: boolean;
  noticeboardEnabled: boolean;
  allowGoogleSignIn: boolean;
  allowPasswordSignIn: boolean;
  defaultResidentRole: ResidentRole;
  maxOpenIncidentsPerResident: number;
  maxPhotosPerIncident: number;
  activeResidents: number;
}

/**
 * Cuerpo de `PUT client/me/communities/:serviceId/config`: lista blanca
 * estricta de los campos editables. El backend responde 400 si se desactivan
 * a la vez los dos métodos de inicio de sesión.
 * @interface UpdatePortalCommunityConfigDto
 * @property {boolean} [incidentsEnabled] - Si los vecinos pueden abrir incidencias
 * @property {boolean} [noticeboardEnabled] - Si el tablón de anuncios está visible
 * @property {boolean} [allowGoogleSignIn] - Si se permite entrar con Google
 * @property {boolean} [allowPasswordSignIn] - Si se permite entrar con contraseña
 * @property {ResidentRole} [defaultResidentRole] - Rol por defecto de un vecino nuevo
 * @property {number} [maxOpenIncidentsPerResident] - Máximo de incidencias abiertas por vecino
 * @property {number} [maxPhotosPerIncident] - Máximo de fotos por incidencia
 */
export interface UpdatePortalCommunityConfigDto {
  incidentsEnabled?: boolean;
  noticeboardEnabled?: boolean;
  allowGoogleSignIn?: boolean;
  allowPasswordSignIn?: boolean;
  defaultResidentRole?: ResidentRole;
  maxOpenIncidentsPerResident?: number;
  maxPhotosPerIncident?: number;
}

/**
 * Unidad del edificio (`GET client/me/communities/:serviceId/units`).
 * @interface CommunityUnit
 * @property {string} id - Identificador de la unidad
 * @property {string} clientServiceId - Servicio contratado al que pertenece
 * @property {string} code - Código visible de la unidad (p. ej. `1ºA`)
 * @property {string | null} block - Bloque o portal
 * @property {string | null} floor - Planta
 * @property {string | null} door - Puerta
 * @property {CommunityUnitType} type - Tipo de unidad
 * @property {boolean} isActive - Si la unidad está activa
 * @property {number} activeResidents - Vecinos activos asignados a la unidad
 */
export interface CommunityUnit {
  id: string;
  clientServiceId: string;
  code: string;
  block: string | null;
  floor: string | null;
  door: string | null;
  type: CommunityUnitType;
  isActive: boolean;
  activeResidents: number;
}

/**
 * Cuerpo de alta de una unidad (`POST client/me/communities/:serviceId/units`).
 * @interface CreateCommunityUnitDto
 * @property {string} code - Código de la unidad (1-50 caracteres, obligatorio)
 * @property {string} [block] - Bloque o portal (máx. 50)
 * @property {string} [floor] - Planta (máx. 20)
 * @property {string} [door] - Puerta (máx. 20)
 * @property {CommunityUnitType} [type] - Tipo de unidad
 * @property {boolean} [isActive] - Si la unidad nace activa
 */
export interface CreateCommunityUnitDto {
  code: string;
  block?: string;
  floor?: string;
  door?: string;
  type?: CommunityUnitType;
  isActive?: boolean;
}

/**
 * Cuerpo de edición de una unidad
 * (`PATCH client/me/communities/:serviceId/units/:unitId`): mismos campos que
 * el alta, todos opcionales.
 * @interface UpdateCommunityUnitDto
 * @property {string} [code] - Código de la unidad
 * @property {string} [block] - Bloque o portal
 * @property {string} [floor] - Planta
 * @property {string} [door] - Puerta
 * @property {CommunityUnitType} [type] - Tipo de unidad
 * @property {boolean} [isActive] - Si la unidad está activa
 */
export interface UpdateCommunityUnitDto {
  code?: string;
  block?: string;
  floor?: string;
  door?: string;
  type?: CommunityUnitType;
  isActive?: boolean;
}

/**
 * Fila de la importación masiva de unidades: igual que el alta pero sin poder
 * fijar `isActive`.
 * @interface PortalUnitImportRow
 * @property {string} code - Código de la unidad
 * @property {string} [block] - Bloque o portal
 * @property {string} [floor] - Planta
 * @property {string} [door] - Puerta
 * @property {CommunityUnitType} [type] - Tipo de unidad
 */
export interface PortalUnitImportRow {
  code: string;
  block?: string;
  floor?: string;
  door?: string;
  type?: CommunityUnitType;
}

/**
 * Cuerpo de la importación masiva
 * (`POST client/me/communities/:serviceId/units/import`).
 * @interface ImportPortalUnitsDto
 * @property {PortalUnitImportRow[]} rows - Unidades a dar de alta
 */
export interface ImportPortalUnitsDto {
  rows: PortalUnitImportRow[];
}

/**
 * Vecino con pertenencia a la comunidad
 * (`GET client/me/communities/:serviceId/residents`). El backend nunca expone
 * aquí teléfono, idioma, credenciales ni historial: es deliberado.
 * @interface PortalResident
 * @property {string} membershipId - Identificador de la pertenencia (el que consumen las acciones de edición/revocación)
 * @property {string} residentAccountId - Identificador de la cuenta del vecino
 * @property {string} email - Correo del vecino
 * @property {string} name - Nombre del vecino
 * @property {string | null} [communityUnitId] - Unidad asignada
 * @property {string | null} [communityUnitCode] - Código de la unidad asignada
 * @property {ResidentRole} role - Rol dentro de la comunidad
 * @property {ResidentMembershipStatus} status - Estado de la pertenencia
 * @property {ResidentAccountStatus} accountStatus - Estado de la cuenta del vecino
 * @property {boolean} canSignIn - Si el vecino puede iniciar sesión ahora mismo
 */
export interface PortalResident {
  membershipId: string;
  residentAccountId: string;
  email: string;
  name: string;
  communityUnitId?: string | null;
  communityUnitCode?: string | null;
  role: ResidentRole;
  status: ResidentMembershipStatus;
  accountStatus: ResidentAccountStatus;
  canSignIn: boolean;
}

/**
 * Llavero solicitado al invitar a un vecino: qué llavero y con qué tipo de
 * credencial se le dará acceso al aceptar.
 * @interface ResidentInvitationKeyring
 * @property {string} lockGroupId - Identificador del llavero
 * @property {LockCredentialType} credentialType - Tipo de credencial a emitir
 */
export interface ResidentInvitationKeyring {
  lockGroupId: string;
  credentialType: LockCredentialType;
}

/**
 * Invitación enviada a un futuro vecino
 * (`GET client/me/communities/:serviceId/invitations`). Nunca incluye el token
 * de aceptación.
 * @interface ResidentInvitation
 * @property {string} id - Identificador de la invitación
 * @property {string} clientServiceId - Servicio contratado al que pertenece
 * @property {string} email - Correo invitado
 * @property {string | null} name - Nombre del invitado, si se indicó
 * @property {string | null} communityUnitId - Unidad que se le asignará
 * @property {string | null} communityUnitCode - Código de esa unidad
 * @property {ResidentRole} role - Rol que tendrá al aceptar
 * @property {ResidentInvitationStatus} status - Estado de la invitación
 * @property {string} expiresAt - Caducidad de la invitación (ISO 8601)
 * @property {string | null} acceptedAt - Cuándo se aceptó (ISO 8601)
 * @property {ResidentInvitationKeyring[]} keyrings - Llaveros que se le concederán
 * @property {string[]} keyringNames - Nombres de esos llaveros, ya resueltos
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 */
export interface ResidentInvitation {
  id: string;
  clientServiceId: string;
  email: string;
  name: string | null;
  communityUnitId: string | null;
  communityUnitCode: string | null;
  role: ResidentRole;
  status: ResidentInvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  keyrings: ResidentInvitationKeyring[];
  keyringNames: string[];
  createdAt: string;
}

/**
 * Cuerpo de `POST client/me/communities/:serviceId/invitations`: admite hasta
 * 50 correos de una vez, pero `name` solo tiene sentido invitando a uno.
 * @interface CreateResidentInvitationsDto
 * @property {string[]} emails - Correos a invitar (1-50)
 * @property {string} [name] - Nombre del invitado, solo si se invita a uno (máx. 150)
 * @property {string} [communityUnitId] - Unidad a asignar
 * @property {ResidentRole} [role] - Rol a asignar
 * @property {ResidentInvitationKeyring[]} [keyrings] - Llaveros a conceder al aceptar
 */
export interface CreateResidentInvitationsDto {
  emails: string[];
  name?: string;
  communityUnitId?: string;
  role?: ResidentRole;
  keyrings?: ResidentInvitationKeyring[];
}

/**
 * Cuerpo de `PATCH client/me/communities/memberships/:membershipId`. El correo
 * del vecino no se puede cambiar desde el portal.
 * @interface UpdateResidentMembershipDto
 * @property {string | null} [communityUnitId] - Nueva unidad, o `null` para desasignarla
 * @property {ResidentRole} [role] - Nuevo rol
 */
export interface UpdateResidentMembershipDto {
  communityUnitId?: string | null;
  role?: ResidentRole;
}

/**
 * Cambio de nombre y/o correo de la identidad de un vecino. Afecta a todas las comunidades donde
 * viva, y cambiar el correo le retira el acceso con el anterior.
 * @interface UpdateResidentAccountDto
 * @property {string} [name] - Nuevo nombre
 * @property {string} [email] - Nuevo correo
 */
export interface UpdateResidentAccountDto {
  name?: string;
  email?: string;
}

/**
 * Cerradura incluida en un llavero.
 * @interface LockGroupLock
 * @property {string} id - Identificador de la cerradura
 * @property {string} name - Nombre de la puerta
 * @property {boolean} isMainAccess - Si es un acceso principal del edificio
 */
export interface LockGroupLock {
  id: string;
  name: string;
  isMainAccess: boolean;
}

/**
 * A qué apunta una regla de permiso.
 *
 * `EVERYTHING` es la regla vacía del fabricante: abre toda la organización, incluida la puerta que se monte
 * mañana.
 */
export type LockPermissionTarget = "EVERYTHING" | "SITE" | "LOCK";

/**
 * Si para abrir **en remoto** hay que estar en el edificio.
 *
 * Solo afecta a la apertura por internet: el PIN, la tarjeta y el Bluetooth exigen estar delante por su
 * propia naturaleza y esto no los toca. El círculo es el de la **sede**, no el de la puerta.
 */
export type LockPermissionPresence = "NONE" | "GPS";

/**
 * Una sede: el edificio, tal y como lo tiene dado de alta el fabricante.
 *
 * **No se configura aquí, se lee.** Importa por dos cosas: el radio del GPS es el de la sede y su zona
 * horaria es en la que se evalúan los horarios.
 * @interface CommunitySite
 */
export interface CommunitySite {
  id: string;
  name: string;
  timezone: string | null;
  geoLatitude: number | null;
  geoLongitude: number | null;
  /** En metros. Sin él, exigir presencia en una regla no puede funcionar. */
  geoRadius: number | null;
  address: string | null;
  lastSyncedAt: string | null;
}

/** Lo que sabe hacer el aparato instalado. Del fabricante, no editable. */
export interface DeviceCapabilities {
  gadgets: string;
  gadgetMaxCount: number;
  script: boolean;
  internet: boolean;
  ethernet: boolean;
  wifi: boolean;
  cellular: boolean;
  /** Tiene teclado. */
  pin: boolean;
  /** Lee NFC: tarjetas y móviles emulando una. */
  nfc: boolean;
  inputRules: boolean;
  mains: boolean;
  battery: boolean;
  batteryRechargeable: boolean;
  audio: boolean;
}

/** Cómo está el aparato ahora mismo. */
export interface DeviceStatus {
  online: boolean;
  mainsPresent: boolean;
  batteryPresent: boolean;
  batteryCharging: boolean;
  /** 0-100. */
  batteryPercent: number;
}

/** Algo que una puerta sabe hacer, en qué situación puede estar, o de qué avisa. */
export interface LockAction {
  id: string;
  name: string;
  i18nName: string;
  index: number;
  help: string;
}

/**
 * Un horario con nombre, reutilizable entre reglas de permiso.
 *
 * **Sin franjas no restringe nada**, no es que no abra nunca.
 * @interface LockSchedule
 */
export interface LockSchedule {
  id: string;
  clientServiceId: string;
  name: string;
  slots: { dayOfWeek: DayOfWeek; startTime: string; endTime: string }[];
  /** En cuántas reglas se usa: cambiarlo les cambia el horario a todas. */
  usedByRules: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Una regla de permiso: **qué abre, cuándo y cómo**.
 * @interface LockPermissionRule
 */
export interface LockPermissionRule {
  id: string;
  target: LockPermissionTarget;
  siteId: string | null;
  siteName: string | null;
  lockId: string | null;
  lockName: string | null;
  actionId: string | null;
  actionName: string | null;
  scheduleId: string | null;
  scheduleName: string | null;
  presence: LockPermissionPresence;
  allowsOnline: boolean;
  allowsBluetooth: boolean;
  allowsMobileNfc: boolean;
  allowsPin: boolean;
  allowsCard: boolean;
}

/** Lo que se manda al guardar una regla. */
export interface LockPermissionRuleInput {
  target: LockPermissionTarget;
  siteId?: string;
  lockId?: string;
  actionId?: string;
  scheduleId?: string;
  presence?: LockPermissionPresence;
  allowsOnline?: boolean;
  allowsBluetooth?: boolean;
  allowsMobileNfc?: boolean;
  allowsPin?: boolean;
  allowsCard?: boolean;
}

/**
 * Un llavero: un conjunto de **reglas de permiso** con nombre, que se le da a personas.
 *
 * No tiene «puertas» como tal: tiene reglas, y cada una dice qué abre —toda una sede, una puerta, o una sola
 * acción de esa puerta—, cuándo y con qué métodos.
 * @interface LockGroup
 */
export interface LockGroup {
  id: string;
  clientServiceId: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  permissionRules: LockPermissionRule[];
  tags: string[];
  /** Cuánta **gente** lo tiene, no cuántas llaves hay. */
  memberCount: number;
  validFrom: string | null;
  validUntil: string | null;
  /** Lo que no llegó a las cerraduras al guardar; `null` si todo llegó. */
  syncWarning?: string | null;
}


/**
 * Una persona dentro de un llavero.
 * @interface KeyringMember
 * @property {string} id - La pertenencia al llavero, que es lo que se retira
 * @property {string} residentMembershipId - El vecino
 * @property {string} lockGroupId - El llavero
 * @property {string} keyringName - Nombre del llavero
 * @property {string} residentName - Nombre del vecino
 * @property {string} email - Su correo
 * @property {string | null} communityUnitCode - Su vivienda
 * @property {string | null} validFrom - Desde cuándo lo tiene
 * @property {string | null} validUntil - Hasta cuándo lo tiene
 * @property {string} createdAt - Cuándo entró
 */
export interface KeyringMember {
  id: string;
  residentMembershipId: string;
  lockGroupId: string;
  keyringName: string;
  residentName: string;
  email: string;
  communityUnitCode: string | null;
  validFrom: string | null;
  validUntil: string | null;
  createdAt: string;
}

/**
 * Con qué se identifica una persona: su PIN, su tarjeta, su móvil.
 *
 * **No es la llave de una puerta.** Lo que abre lo deciden sus llaveros, y por eso no tiene destino ni se
 * elige el tipo al darla: se emite sola con lo que sus llaveros conceden.
 * @interface MemberCredential
 * @property {string} id - La credencial
 * @property {LockCredentialType} type - PIN, tarjeta o móvil
 * @property {LockCredentialStatus} status - En qué estado está
 * @property {string} label - Cómo se la llama
 * @property {number} syncedLocks - En cuántas puertas está programada
 * @property {number} totalLocks - En cuántas debería estarlo
 * @property {string} createdAt - Cuándo se emitió
 */
export interface MemberCredential {
  id: string;
  type: LockCredentialType;
  status: LockCredentialStatus;
  label: string;
  syncedLocks: number;
  totalLocks: number;
  createdAt: string;
}

/**
 * La ficha de una persona en el llavero: quién es, a qué llega y con qué.
 * @interface MemberDetail
 * @property {string} residentMembershipId - El vecino
 * @property {string} residentName - Su nombre
 * @property {string} email - Su correo
 * @property {string | null} communityUnitCode - Su vivienda
 * @property {string | null} validFrom - Desde cuándo es vecino
 * @property {string | null} validUntil - Hasta cuándo lo es
 * @property {KeyringMember[]} keyrings - Sus llaveros
 * @property {MemberCredential[]} credentials - Con qué se identifica
 */
export interface MemberDetail {
  residentMembershipId: string;
  residentName: string;
  email: string;
  communityUnitCode: string | null;
  validFrom: string | null;
  validUntil: string | null;
  keyrings: KeyringMember[];
  credentials: MemberCredential[];
  /*
   * Cuántos enlaces de acceso tiene vivos.
   *
   * Un enlace no se puede volver a leer una vez emitido, así que este número es lo único que dice si esa
   * persona tiene uno, tres o ninguno — y si retirarlos va a retirar algo.
   */
  magicLinks: number;
}

/**
 * Hasta cuándo le vale a alguien un llavero
 * (`PATCH client/me/communities/:serviceId/keyring-members/:keyringMembershipId`).
 *
 * Es distinta de la vigencia del vecino: se puede vivir aquí indefinidamente y tener el llavero del gimnasio
 * solo mientras dure el abono. `null` quita el límite.
 * @interface UpdateKeyringMembershipDto
 * @property {string | null} [validFrom] - Desde cuándo (ISO 8601)
 * @property {string | null} [validUntil] - Hasta cuándo (ISO 8601)
 */
export interface UpdateKeyringMembershipDto {
  validFrom?: string | null;
  validUntil?: string | null;
}

/**
 * Cuerpo del reparto de llaves
 * (`POST client/me/communities/:serviceId/keys/assign`).
 * @interface AssignKeysDto
 * @property {string} lockGroupId - Llavero a repartir; es lo único que se reparte
 * @property {string[]} [membershipIds] - Vecinos que entran ahora
 * @property {string[]} [invitationIds] - Invitaciones a las que se les planifica el llavero
 */
export interface AssignKeysDto {
  lockGroupId: string;
  membershipIds?: string[];
  invitationIds?: string[];
}

/**
 * Una llave emitida en un reparto, con su PIN si se ha generado.
 * @interface AssignedKey
 * @property {string} credentialId - La credencial creada
 * @property {string} residentName - Quién la recibe
 * @property {string | null} [unitCode] - Su vivienda, si la tiene
 * @property {LockCredentialType} type - Tarjeta, PIN o app
 * @property {string} [pin] - El PIN en claro; **solo se ve aquí y solo ahora**
 */
export interface AssignedKey {
  credentialId: string;
  residentName: string;
  unitCode?: string | null;
  type: LockCredentialType;
  pin?: string;
}

/**
 * Parte de un reparto de llaves.
 *
 * Los cuatro recuentos se enseñan porque contestan a cosas distintas, y callar cualquiera deja a quien
 * reparte creyendo que hizo más —o menos— de lo que hizo.
 * @interface AssignKeysResult
 * @property {number} joined - Cuánta gente ha entrado en el llavero
 * @property {AssignedKey[]} issued - Llaves emitidas, con los PIN generados
 * @property {number} planned - Llaveros planificados en invitaciones sin aceptar
 * @property {number} skipped - Personas que ya lo tenían y se han dejado como estaban
 * @property {number} pendingCards - Tarjetas que hay que entregar y enrolar en persona
 * @property {LockCredentialType[]} unsupportedTypes - Métodos que las puertas del llavero no admiten
 */
export interface AssignKeysResult {
  /**
   * A cuánta gente se le ha metido en el llavero.
   *
   * No coincide con `issued`: a quien ya tenía PIN no se le crea otro —es suyo y se lo sabe de memoria—,
   * así que puede entrar en el llavero sin que se emita nada.
   */
  joined: number;
  issued: AssignedKey[];
  planned: number;
  skipped: number;
  pendingCards: number;
  unsupportedTypes: LockCredentialType[];
}

/**
 * Cuerpo de alta de un llavero (`POST client/me/communities/:serviceId/keyrings`).
 * @interface CreateLockGroupDto
 * @property {string} name - Nombre del llavero (1-100)
 * @property {string} [description] - Descripción (máx. 300)
 * @property {boolean} [isDefault] - Si pasa a ser el llavero por defecto
 * @property {string[]} lockIds - Puertas que incluye (mínimo 1)
 */
export interface CreateLockGroupDto {
  name: string;
  description?: string;
  isDefault?: boolean;
  tags?: string[];
  /** Sustituye la lista entera: es lo único que hace que quitar una regla llegue a la cerradura. */
  permissionRules: LockPermissionRuleInput[];
  validFrom?: string;
  validUntil?: string;
}

/**
 * Cuerpo de edición de un llavero
 * (`PATCH client/me/communities/:serviceId/keyrings/:keyringId`). Si llega
 * `lockIds`, sustituye la lista entera de puertas, no la amplía.
 * @interface UpdateLockGroupDto
 * @property {string} [name] - Nombre del llavero
 * @property {string} [description] - Descripción
 * @property {boolean} [isDefault] - Si pasa a ser el llavero por defecto
 * @property {string[]} [lockIds] - Nueva lista completa de puertas
 */
export interface UpdateLockGroupDto {
  name?: string;
  description?: string;
  isDefault?: boolean;
  tags?: string[];
  /** Sustituye la lista entera: es lo único que hace que quitar una regla llegue a la cerradura. */
  permissionRules?: LockPermissionRuleInput[];
  validFrom?: string;
  validUntil?: string;
}

/**
 * Celda de la matriz de llaves: el acceso de un vecino a una puerta concreta.
 * @interface KeyMatrixCell
 * @property {string} lockId - Puerta a la que se refiere la celda
 * @property {KeyMatrixCellState} state - Si tiene llave y en qué situación
 * @property {string[]} credentialIds - Credenciales que sustentan ese acceso
 */
export interface KeyMatrixCell {
  lockId: string;
  state: KeyMatrixCellState;
  credentialIds: string[];
}

/**
 * Fila de la matriz de llaves: un vecino y su acceso a cada puerta.
 * @interface KeyMatrixRow
 * @property {string} membershipId - Pertenencia del vecino
 * @property {string} residentName - Nombre del vecino
 * @property {string | null} communityUnitCode - Código de su unidad
 * @property {KeyMatrixCell[]} cells - Una celda por puerta, en el orden de `locks`
 */
export interface KeyMatrixRow {
  membershipId: string;
  residentName: string;
  communityUnitCode: string | null;
  cells: KeyMatrixCell[];
}

/**
 * Matriz vecino×puerta (`GET client/me/communities/:serviceId/key-matrix`):
 * responde a "quién tiene llave de qué", no a "qué credenciales existen".
 * @interface KeyMatrix
 * @property {LockGroupLock[]} locks - Puertas, en el orden de las columnas
 * @property {KeyMatrixRow[]} rows - Vecinos, una fila cada uno
 */
export interface KeyMatrix {
  locks: LockGroupLock[];
  rows: KeyMatrixRow[];
}

/**
 * Tramo horario semanal de una credencial o de una cerradura.
 * @interface LockScheduleSlotDto
 * @property {DayOfWeek} dayOfWeek - Día de la semana al que aplica
 * @property {string} startTime - Hora de inicio (`HH:mm`)
 * @property {string} endTime - Hora de fin (`HH:mm`)
 * @property {string} [label] - Etiqueta libre del tramo (máx. 100)
 */
export interface LockScheduleSlotDto {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  label?: string;
}

/**
 * Estado de sincronización de una credencial en una cerradura concreta. En
 * cerraduras `BLE_ONLY` la sincronización no es inmediata: aquí es donde se ve
 * si una alta o una revocación ya ha llegado de verdad a la puerta.
 * @interface LockCredentialSync
 * @property {string} lockId - Cerradura sincronizada
 * @property {string} lockName - Nombre de esa cerradura
 * @property {LockCredentialSyncStatus} status - Estado de la sincronización
 * @property {string | null} syncedAt - Cuándo se sincronizó (ISO 8601)
 * @property {number} attempts - Intentos realizados
 * @property {string | null} lastError - Último error, si falló
 * @property {string | null} lockLastSeenAt - Última vez que se vio la cerradura (ISO 8601)
 */
export interface LockCredentialSync {
  lockId: string;
  lockName: string;
  status: LockCredentialSyncStatus;
  syncedAt: string | null;
  attempts: number;
  lastError: string | null;
  lockLastSeenAt: string | null;
}

/**
 * Credencial de acceso (`GET client/me/communities/:serviceId/lock-credentials`).
 * Nunca incluye el PIN ni su hash: el PIN en claro solo llega una vez, en la
 * respuesta de creación ({@link LockCredentialCreated}).
 * @interface LockCredential
 * @property {string} id - Identificador de la credencial
 * @property {string} clientServiceId - Servicio contratado al que pertenece
 * @property {string | null} lockId - Puerta concreta, si la credencial es de una sola puerta
 * @property {string | null} lockGroupId - Llavero, si la credencial es de un llavero
 * @property {string | null} targetName - Nombre de la puerta o del llavero, ya resuelto
 * @property {string | null} residentMembershipId - Vecino al que pertenece
 * @property {string | null} residentName - Nombre de ese vecino
 * @property {string | null} residentUnitCode - Unidad de ese vecino
 * @property {LockCredentialType} type - Tipo de credencial
 * @property {string} label - Etiqueta de la credencial
 * @property {string | null} nfcUid - UID de la tarjeta NFC, si aplica
 * @property {string | null} issuedForName - A nombre de quién se emitió, si no es un vecino
 * @property {string | null} validFrom - Inicio de validez (ISO 8601)
 * @property {string | null} validUntil - Fin de validez (ISO 8601)
 * @property {boolean} canBypassSchedule - Si puede saltarse el horario de la puerta
 * @property {string | null} bypassReason - Motivo por el que puede saltárselo
 * @property {LockCredentialStatus} status - Estado de la credencial
 * @property {string | null} revokedAt - Cuándo se revocó (ISO 8601)
 * @property {LockScheduleSlotDto[]} scheduleSlots - Tramos horarios propios de la credencial
 * @property {LockCredentialSync[]} syncs - Estado de sincronización por cerradura
 * @property {number} pendingLocks - Cerraduras en las que todavía está pendiente de aplicarse
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 */
export interface LockCredential {
  id: string;
  clientServiceId: string;
  lockId: string | null;
  lockGroupId: string | null;
  targetName: string | null;
  residentMembershipId: string | null;
  residentName: string | null;
  residentUnitCode: string | null;
  type: LockCredentialType;
  label: string;
  nfcUid: string | null;
  issuedForName: string | null;
  validFrom: string | null;
  validUntil: string | null;
  canBypassSchedule: boolean;
  bypassReason: string | null;
  status: LockCredentialStatus;
  revokedAt: string | null;
  scheduleSlots: LockScheduleSlotDto[];
  syncs: LockCredentialSync[];
  pendingLocks: number;
  createdAt: string;
}

/**
 * Respuesta de `POST client/me/communities/:serviceId/lock-credentials`: la
 * credencial recién creada más, solo en esta respuesta y nunca más, el PIN en
 * claro. No es recuperable después, así que hay que mostrarlo una única vez.
 * @interface LockCredentialCreated
 * @property {string} [plainPin] - PIN en claro, solo si la credencial es de tipo `PIN`
 */
export interface LockCredentialCreated extends LockCredential {
  plainPin?: string;
}

/**
 * Cuerpo de alta de una credencial
 * (`POST client/me/communities/:serviceId/lock-credentials`). Hay que indicar
 * `lockId` o `lockGroupId`, no ambos.
 * @interface CreateLockCredentialDto
 * @property {string} [lockId] - Puerta concreta sobre la que emitir
 * @property {string} [lockGroupId] - Llavero sobre el que emitir
 * @property {string} [residentMembershipId] - Vecino al que se le emite
 * @property {LockCredentialType} type - Tipo de credencial (obligatorio)
 * @property {string} label - Etiqueta de la credencial (1-100)
 * @property {string} [nfcUid] - UID de la tarjeta NFC (máx. 100)
 * @property {string} [pin] - PIN de 4 a 10 dígitos
 * @property {string} [issuedForName] - A nombre de quién se emite (máx. 150)
 * @property {string} [validFrom] - Inicio de validez (ISO 8601)
 * @property {string} [validUntil] - Fin de validez (ISO 8601)
 * @property {boolean} [canBypassSchedule] - Si puede saltarse el horario de la puerta
 * @property {string} [bypassReason] - Motivo del salto de horario (máx. 300)
 * @property {LockScheduleSlotDto[]} [scheduleSlots] - Tramos horarios propios de la credencial
 */
export interface CreateLockCredentialDto {
  lockId?: string;
  lockGroupId?: string;
  residentMembershipId?: string;
  type: LockCredentialType;
  label: string;
  nfcUid?: string;
  pin?: string;
  issuedForName?: string;
  validFrom?: string;
  validUntil?: string;
  canBypassSchedule?: boolean;
  bypassReason?: string;
  scheduleSlots?: LockScheduleSlotDto[];
}

/**
 * Cuerpo de edición de una credencial
 * (`PATCH client/me/communities/lock-credentials/:credentialId`). El tipo, el
 * destino y el vecino no se pueden cambiar: para eso se revoca y se emite otra.
 * @interface UpdateLockCredentialDto
 * @property {string} [label] - Nueva etiqueta
 * @property {string | null} [validFrom] - Nuevo inicio de validez, o `null` para quitarlo
 * @property {string | null} [validUntil] - Nuevo fin de validez, o `null` para quitarlo
 * @property {boolean} [canBypassSchedule] - Si puede saltarse el horario
 * @property {string} [bypassReason] - Motivo del salto de horario
 * @property {LockScheduleSlotDto[]} [scheduleSlots] - Nuevos tramos horarios
 */
export interface UpdateLockCredentialDto {
  label?: string;
  validFrom?: string | null;
  validUntil?: string | null;
  canBypassSchedule?: boolean;
  bypassReason?: string;
  scheduleSlots?: LockScheduleSlotDto[];
}

/**
 * Cuerpo de revocación de una credencial
 * (`POST client/me/communities/lock-credentials/:credentialId/revoke`).
 * @interface RevokeLockCredentialDto
 * @property {string} [reason] - Motivo de la revocación (máx. 300)
 */
export interface RevokeLockCredentialDto {
  reason?: string;
}

/**
 * Cuerpo del enrolado de una tarjeta física sobre una credencial ya existente
 * (`POST client/me/communities/lock-credentials/:credentialId/enroll-card`).
 * @interface EnrollCardDto
 * @property {string} nfcUid - UID leído de la tarjeta (4-100 caracteres)
 */
export interface EnrollCardDto {
  nfcUid: string;
}

/**
 * Lo que el proveedor de la cerradura soporta de verdad. Determina, entre
 * otras cosas, si el horario configurado se aplica o es meramente informativo.
 * @interface LockProviderCapabilities
 * @property {boolean} lockSchedule - Si el proveedor aplica horarios a nivel de cerradura
 * @property {boolean} credentialSchedule - Si el proveedor aplica horarios a nivel de credencial
 * @property {boolean} holidays - Si soporta calendario de festivos
 * @property {boolean} remoteOpen - Si soporta apertura remota
 * @property {boolean} pin - Si soporta credenciales de tipo PIN
 * @property {number} pinMinLength - Longitud mínima del PIN
 * @property {number} pinMaxLength - Longitud máxima del PIN
 * @property {boolean} enrollCardByUid - Si permite enrolar tarjetas por UID
 * @property {boolean} phoneEmulation - Si soporta emulación NFC desde el móvil
 * @property {boolean} webhooks - Si notifica eventos por webhook
 * @property {number | null} eventDepth - Cuántos eventos históricos conserva
 * @property {boolean} immediateRevocation - Si la revocación es inmediata
 * @property {boolean} released - Si soporta dejar la puerta liberada
 */
export interface LockProviderCapabilities {
  lockSchedule: boolean;
  credentialSchedule: boolean;
  holidays: boolean;
  remoteOpen: boolean;
  pin: boolean;
  pinMinLength: number;
  pinMaxLength: number;
  enrollCardByUid: boolean;
  phoneEmulation: boolean;
  webhooks: boolean;
  eventDepth: number | null;
  immediateRevocation: boolean;
  released: boolean;
}

/**
 * Una puerta de la comunidad (`GET client/me/communities/:serviceId/locks`).
 *
 * Es el espejo de lo que el fabricante tiene, y **aquí no se configura**: en su API una puerta es de solo
 * lectura, y el cliente no da de alta ni de baja hardware. Lo único que se edita es lo que el fabricante no
 * sabe —a qué vivienda pertenece y si la damos por activa—; el horario y los métodos con los que se abre son
 * de la regla del llavero, no de la puerta.
 * @interface CommunityLock
 * @property {string} id - Identificador de la puerta
 * @property {string} clientServiceId - Servicio contratado al que pertenece
 * @property {LockProviderName} provider - Fabricante
 * @property {string} externalId - Identificador en el sistema del fabricante
 * @property {string} name - Nombre de la puerta, tal y como está dado de alta allí
 * @property {string | null} siteId - Sede en la que está
 * @property {string | null} siteName - Nombre de esa sede
 * @property {string | null} deviceId - Aparato del que cuelga
 * @property {string | null} deviceName - Nombre de ese aparato
 * @property {string | null} productName - Modelo del aparato
 * @property {string | null} revisionId - Revisión del modelo
 * @property {string | null} hardwareId - Número de serie
 * @property {DeviceCapabilities | null} capabilities - Lo que el aparato sabe hacer
 * @property {DeviceStatus | null} deviceStatus - Cómo está el aparato ahora
 * @property {LockAction[]} actions - Lo que la puerta sabe hacer
 * @property {LockAction[]} states - En qué situación puede estar
 * @property {LockAction[]} signals - Avisos puntuales que emite
 * @property {string | null} currentStateId - En cuál está ahora
 * @property {string | null} lastSyncedAt - Cuándo se trajo del fabricante (ISO 8601)
 * @property {string | null} communityUnitId - Vivienda a la que da acceso, si es de una
 * @property {string | null} communityUnitCode - Código de esa vivienda
 * @property {boolean} isMainAccess - Si es un acceso principal
 * @property {CommunityLockStatus} status - Estado operativo
 * @property {string} createdAt - Fecha de alta (ISO 8601)
 * @property {string} updatedAt - Última modificación (ISO 8601)
 */
export interface CommunityLock {
  id: string;
  clientServiceId: string;
  provider: LockProviderName;
  /** Su identificador en el sistema del fabricante. */
  externalId: string;
  name: string;

  /*
   * De dónde cuelga y qué sabe hacer: **todo esto lo manda el fabricante** y aquí solo se lee.
   *
   * Las capacidades vienen del **aparato**, no de la puerta: seis puertas pueden colgar del mismo
   * controlador, y copiarlas a cada una era garantizar que tarde o temprano dijeran cosas distintas.
   */
  siteId: string | null;
  siteName: string | null;
  deviceId: string | null;
  deviceName: string | null;
  /** El modelo del aparato, presentable: «Pinpad», no `pinpad`. */
  productName: string | null;
  revisionId: string | null;
  /** Número de serie impreso en la etiqueta. */
  hardwareId: string | null;
  capabilities: DeviceCapabilities | null;
  deviceStatus: DeviceStatus | null;
  /** Abrir, subir, bajar… Lo que la puerta sabe hacer. */
  actions: LockAction[];
  /** En qué situación puede estar, si sabe decirlo. */
  states: LockAction[];
  /** Avisos puntuales: un timbre, un sensor. */
  signals: LockAction[];
  currentStateId: string | null;
  lastSyncedAt: string | null;

  /* Y lo nuestro, que es lo único editable: el fabricante no sabe de viviendas. */
  communityUnitId: string | null;
  communityUnitCode: string | null;
  isMainAccess: boolean;
  status: CommunityLockStatus;

  createdAt: string;
  updatedAt: string;
}

/**
 * Tramo horario ya persistido de una cerradura.
 * @interface LockScheduleSlot
 * @property {string} id - Identificador del tramo
 * @property {string} lockId - Cerradura a la que pertenece
 * @property {DayOfWeek} dayOfWeek - Día de la semana
 * @property {string} startTime - Hora de inicio (`HH:mm`)
 * @property {string} endTime - Hora de fin (`HH:mm`)
 * @property {string | null} label - Etiqueta del tramo
 */
export interface LockScheduleSlot {
  id: string;
  lockId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  label: string | null;
}


/**
 * Resumen agregado de accesos por puerta
 * (`GET client/me/communities/:serviceId/access-log`). No identifica a ningún
 * vecino: es deliberado, y no debe cruzarse con nada para ponerle nombres.
 * @interface LockAccessSummary
 * @property {string} lockId - Puerta resumida
 * @property {string} lockName - Nombre de la puerta
 * @property {number} granted - Accesos concedidos
 * @property {number} denied - Accesos denegados
 * @property {number} deniedBySchedule - Denegados concretamente por horario
 * @property {string | null} lastAccessAt - Último acceso registrado (ISO 8601)
 */
export interface LockAccessSummary {
  lockId: string;
  lockName: string;
  granted: number;
  denied: number;
  deniedBySchedule: number;
  lastAccessAt: string | null;
}

/**
 * Una apertura del registro (`GET client/me/communities/:serviceId/access-log-detail`).
 *
 * Ya no hace falta motivo para consultarlo, pero la consulta se sigue auditando: un registro de entradas dice
 * a qué hora llega cada uno a su casa.
 * @interface LockAccessLogEntry
 * @property {string} id - Identificador del evento
 * @property {string} lockId - Puerta
 * @property {string} lockName - Nombre de la puerta
 * @property {string | null} credentialId - Credencial usada
 * @property {string | null} credentialLabel - Etiqueta de esa credencial
 * @property {string | null} residentMembershipId - Vecino que accedió
 * @property {string | null} residentName - Nombre de ese vecino
 * @property {string | null} openedByLabel - Quién abrió cuando no es un vecino (el fabricante sí lo dice)
 * @property {LockAccessMethod} method - Método de apertura
 * @property {LockAccessResult} result - Resultado del intento
 * @property {string} occurredAt - Cuándo ocurrió (ISO 8601)
 * @property {boolean} isOccurredAtApproximate - Si la hora es aproximada (cerraduras sin reloj fiable)
 * @property {string} receivedAt - Cuándo lo recibió el sistema (ISO 8601)
 */
export interface LockAccessLogEntry {
  id: string;
  lockId: string;
  lockName: string;
  credentialId: string | null;
  credentialLabel: string | null;
  residentMembershipId: string | null;
  residentName: string | null;
  /*
   * Quién abrió cuando no lo hizo un vecino: el administrador desde el panel del fabricante, un instalador.
   * El fabricante sí dice de dónde vino la apertura, y enseñar «sin identificar» a secas suena a fallo.
   */
  openedByLabel: string | null;
  method: LockAccessMethod;
  result: LockAccessResult;
  occurredAt: string;
  isOccurredAtApproximate: boolean;
  receivedAt: string;
}

/**
 * Filtros del registro de accesos.
 *
 * La puerta es uno más y no la condición para ver algo: la pregunta que trae aquí casi nunca es «qué ha
 * pasado en el garaje», es «qué ha pasado esta noche».
 * @interface LockAccessLogQuery
 * @property {string} [lockId] - Una puerta concreta
 * @property {string} [from] - Desde cuándo (ISO 8601)
 * @property {string} [to] - Hasta cuándo (ISO 8601)
 * @property {LockAccessResult} [result] - Solo las aperturas con este resultado
 * @property {string} [search] - Busca por nombre de quien abrió
 */
export interface LockAccessLogQuery {
  lockId?: string;
  from?: string;
  to?: string;
  result?: LockAccessResult;
  search?: string;
}

/**
 * Incidencia reportada por un vecino (`GET client/me/incidents`). El backend
 * ya filtra las sensibles server-side: el portal no puede pedirlas ni debe
 * ofrecer ningún control para intentarlo.
 * @interface CommunityIncident
 * @property {string} id - Identificador de la incidencia
 * @property {string} code - Código visible (p. ej. `INC-000001`)
 * @property {string} title - Título
 * @property {string} description - Descripción
 * @property {string} type - Identificador del tipo
 * @property {string} typeName - Nombre del tipo
 * @property {boolean} isSensitive - Si es sensible (siempre `false` en este listado)
 * @property {IncidentPriority} priority - Prioridad
 * @property {IncidentStatus} status - Estado
 * @property {string} channel - Identificador del canal de entrada
 * @property {string} channelName - Nombre del canal
 * @property {string} [clientServiceId] - Servicio contratado asociado
 * @property {string} [clientServiceName] - Nombre de ese servicio
 * @property {string | null} [communityUnitId] - Unidad afectada
 * @property {string | null} [communityUnitCode] - Código de esa unidad (p. ej. `1ºA`)
 * @property {string | null} [reportedByResidentId] - Vecino que la reportó
 * @property {string | null} [reportedByResidentName] - Nombre de ese vecino
 * @property {string | null} [assignedToId] - Persona asignada
 * @property {string | null} [assignedToName] - Nombre de la persona asignada
 * @property {string | null} [dueAt] - Fecha compromiso (ISO 8601)
 * @property {boolean} isOverdue - Si ha superado su fecha compromiso
 * @property {string | null} [resolvedAt] - Cuándo se resolvió (ISO 8601)
 * @property {string | null} [closedAt] - Cuándo se cerró (ISO 8601)
 * @property {string | null} [resolution] - Texto de resolución
 * @property {boolean} visibleToCommunity - Si los vecinos la ven en el tablón
 * @property {IncidentStatus[]} allowedTransitions - Transiciones posibles (informativo: el portal es de solo lectura)
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 * @property {string} updatedAt - Última modificación (ISO 8601)
 */
export interface CommunityIncident {
  id: string;
  code: string;
  title: string;
  description: string;
  type: string;
  typeName: string;
  isSensitive: boolean;
  priority: IncidentPriority;
  status: IncidentStatus;
  channel: string;
  channelName: string;
  clientServiceId?: string;
  clientServiceName?: string;
  communityUnitId?: string | null;
  communityUnitCode?: string | null;
  reportedByResidentId?: string | null;
  reportedByResidentName?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  dueAt?: string | null;
  isOverdue: boolean;
  resolvedAt?: string | null;
  closedAt?: string | null;
  resolution?: string | null;
  visibleToCommunity: boolean;
  allowedTransitions: IncidentStatus[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Filtros de `GET client/me/incidents`.
 * @interface CommunityIncidentsQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 * @property {IncidentStatus} [status] - Filtro por estado
 * @property {string} [clientServiceId] - Filtro por servicio contratado (la comunidad activa)
 * @property {string} [sortBy] - Campo de orden (whitelist del backend: `createdAt`, `updatedAt`, `dueAt`, `priority`, `status`, `code`)
 * @property {"ASC" | "DESC"} [sortOrder] - Dirección de orden
 * @property {string} [dateFrom] - Filtra por `createdAt >= dateFrom` (ISO `YYYY-MM-DD`)
 * @property {string} [dateTo] - Filtra por `createdAt <= dateTo` (ISO `YYYY-MM-DD`)
 * @property {string} [search] - Búsqueda libre por código o título de la incidencia
 */
export interface CommunityIncidentsQuery {
  page?: number;
  limit?: number;
  status?: IncidentStatus;
  clientServiceId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

/**
 * Paginación y búsqueda comunes a los listados de comunidad
 * (`GET client/me/communities/:serviceId/...`).
 * @interface CommunityListQuery
 * @property {number} [page] - Página a obtener (1-indexada)
 * @property {number} [limit] - Tamaño de página
 * @property {string} [search] - Texto libre; cada listado decide sobre qué campos filtra
 * @property {string} [sortBy] - Campo de orden; cada listado valida contra su propia whitelist de columnas (backend, `applySort`)
 * @property {"ASC" | "DESC"} [sortOrder] - Dirección de orden
 */
export interface CommunityListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Filtros de `GET client/me/communities/:serviceId/residents`.
 * @interface CommunityResidentsQuery
 * @property {boolean} [includeRevoked] - Si incluir también las pertenencias ya revocadas
 */
export interface CommunityResidentsQuery extends CommunityListQuery {
  includeRevoked?: boolean;
  /** Solo los vecinos de esta unidad; lo filtra la API, no la página ya traída. */
  communityUnitId?: string;
}

/**
 * Filtros de `GET client/me/communities/:serviceId/invitations`.
 * @interface CommunityInvitationsQuery
 * @property {boolean} [includeClosed] - Si incluir también las aceptadas/revocadas/caducadas
 */
export interface CommunityInvitationsQuery extends CommunityListQuery {
  includeClosed?: boolean;
}

/**
 * Filtros de `GET client/me/communities/:serviceId/units`.
 * @interface CommunityUnitsQuery
 * @property {boolean} [includeInactive] - Si incluir también las unidades dadas de baja
 */
export interface CommunityUnitsQuery extends CommunityListQuery {
  includeInactive?: boolean;
}

/**
 * Tipos de incidencia que el cliente puede abrir desde el portal.
 *
 * La lista está escrita a mano porque el backend no expone ningún endpoint de
 * catálogo consultable (verificado: no existe `client/me/incidents/types` ni
 * equivalente). Son los tipos no sensibles sembrados por la migración
 * `MakeIncidentTypesConfigurable`: los sensibles (`RECLAMACION`, `RUIDO`,
 * `CONVIVENCIA`) se omiten a propósito porque el backend responde 400
 * (`INCIDENT_SENSITIVE_NOT_ALLOWED_FROM_PORTAL`) al intentar crearlos desde el
 * portal, así que ofrecerlos solo daría un error garantizado.
 */
export type PortalIncidentType =
  | "AVERIA"
  | "MANTENIMIENTO"
  | "LIMPIEZA"
  | "SUMINISTRO"
  | "ACCESO"
  | "CONSULTA"
  | "OTRO";

/**
 * Cuerpo de `POST client/me/incidents`.
 *
 * No hay campo para marcar la incidencia como sensible ni debe haberlo: lo
 * decide el backend a partir del `type`, y es invisible para el cliente.
 * @interface PortalCreateIncidentInput
 * @property {string} title - Título (1-255 caracteres)
 * @property {string} description - Descripción (1-5000 caracteres)
 * @property {string} type - Código del catálogo de tipos; ver {@link PortalIncidentType}
 * @property {string} [clientServiceId] - Servicio contratado al que se refiere; tiene que ser del propio cliente
 * @property {IncidentPriority} [priority] - Prioridad solicitada; el backend aplica `NORMAL` si se omite
 */
export interface PortalCreateIncidentInput {
  title: string;
  description: string;
  type: string;
  clientServiceId?: string;
  priority?: IncidentPriority;
}

/**
 * Cuerpo de `POST client/me/incidents/:id/comments`. Sin campo `visibility`:
 * un comentario escrito desde el portal nace siempre `REPORTER`, lo fija el
 * servidor.
 * @interface PortalCreateIncidentCommentInput
 * @property {string} body - Texto del comentario (1-5000 caracteres)
 */
export interface PortalCreateIncidentCommentInput {
  body: string;
}

/**
 * Adjunto de una incidencia visible desde el portal (siempre
 * `visibility: REPORTER`; el backend nunca deja ver uno `INTERNAL`/`COMMUNITY`
 * a un cliente).
 * @interface IncidentAttachment
 * @property {string} id - Identificador del adjunto
 * @property {string} incidentId - Incidencia a la que pertenece
 * @property {string | null} [commentId] - Mensaje al que acompaña; `null` si cuelga de la incidencia entera
 * @property {string} filename - Nombre original del fichero
 * @property {string} mimetype - Tipo MIME
 * @property {number} sizeBytes - Tamaño en bytes
 * @property {string | null} [uploadedByPortalClientId] - Presente si lo subió el propio cliente desde el portal
 * @property {boolean} [hasThumbnail] - Si tiene miniatura descargable en `?variant=thumbnail`
 * @property {string} createdAt - Fecha de subida (ISO 8601)
 */
export interface IncidentAttachment {
  id: string;
  incidentId: string;
  commentId?: string | null;
  filename: string;
  mimetype: string;
  sizeBytes: number;
  uploadedByPortalClientId?: string | null;
  hasThumbnail?: boolean;
  createdAt: string;
}

/**
 * Comentario recién creado desde el portal, tal y como lo devuelve
 * `POST client/me/incidents/:id/comments`.
 * @interface IncidentCommentResponse
 * @property {string} id - Identificador del comentario
 * @property {string} incidentId - Incidencia a la que pertenece
 * @property {string} body - Texto del comentario
 * @property {"REPORTER"} visibility - Siempre `REPORTER`; el portal no elige visibilidad
 * @property {string | null} [authorName] - `null` si lo escribió el propio cliente (equipo interno si no), solo presente en la lectura del hilo (`GET .../comments`); ausente en la respuesta de creación
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 * @property {IncidentAttachment[]} [attachments] - Ficheros que acompañan a este mensaje; ausente en la respuesta de creación (se suben después, con el id que esta devuelve)
 */
export interface IncidentCommentResponse {
  id: string;
  incidentId: string;
  body: string;
  visibility: "REPORTER";
  authorName?: string | null;
  createdAt: string;
  attachments?: IncidentAttachment[];
}

/**
 * Un aviso del tablón de la comunidad, tal y como lo devuelve
 * `GET client/me/communities/:serviceId/announcements`.
 *
 * El portal los recibe **todos**, incluidos los programados y los caducados, y los distingue por
 * `isVisible`: quien es dueño de la comunidad necesita ver lo que va a salir y lo que ya salió, no solo lo
 * que está puesto hoy. La regla de qué está vivo la aplica el servidor; aquí solo se lee.
 * @interface PortalCommunityAnnouncement
 * @property {string} id - Identificador del aviso
 * @property {string} clientServiceId - Comunidad a la que pertenece
 * @property {string} title - Titular del aviso
 * @property {string} body - Cuerpo del aviso, en texto plano
 * @property {string} publishedAt - Cuándo empieza a verse (ISO 8601); una fecha futura es un aviso programado
 * @property {string | null} [expiresAt] - Cuándo deja de verse (ISO 8601), o `null` si no caduca
 * @property {boolean} pinned - Si va fijado arriba del tablón
 * @property {string | null} [color] - Color del aviso en hexadecimal, o `null` para el de por defecto
 * @property {string | null} [createdByName] - Quién lo publicó, ya resuelto
 * @property {boolean} isVisible - Si un vecino lo está viendo ahora mismo
 * @property {string} createdAt - Fecha de creación (ISO 8601)
 */
export interface PortalCommunityAnnouncement {
  id: string;
  clientServiceId: string;
  title: string;
  body: string;
  publishedAt: string;
  expiresAt?: string | null;
  pinned: boolean;
  color?: string | null;
  createdByName?: string | null;
  isVisible: boolean;
  createdAt: string;
}

/**
 * Datos para publicar un aviso en el tablón de la comunidad.
 * @interface CreateCommunityAnnouncementDto
 * @property {string} title - Titular del aviso
 * @property {string} body - Cuerpo del aviso
 * @property {string} [publishedAt] - Desde cuándo se ve (ISO 8601); por defecto, ahora
 * @property {string} [expiresAt] - Hasta cuándo se ve (ISO 8601); vacío = no caduca
 * @property {boolean} [pinned] - Lo fija arriba del todo
 * @property {string} [color] - Color del aviso en hexadecimal
 */
export interface CreateCommunityAnnouncementDto {
  title: string;
  body: string;
  publishedAt?: string;
  expiresAt?: string;
  pinned?: boolean;
  color?: string;
}

/**
 * Campos a corregir de un aviso ya publicado.
 * @interface UpdateCommunityAnnouncementDto
 */
export interface UpdateCommunityAnnouncementDto {
  title?: string;
  body?: string;
  publishedAt?: string;
  expiresAt?: string;
  pinned?: boolean;
  color?: string;
}

/**
 * Filtros del listado de credenciales, más allá de la paginación
 * (`GET client/me/communities/:serviceId/lock-credentials`).
 * @interface CommunityCredentialsQuery
 * @extends CommunityListQuery
 * @property {string} [residentMembershipId] - Acotar a un vecino concreto
 * @property {string} [lockGroupId] - Acotar a las de un llavero; excluyente con `lockId`
 * @property {string} [lockId] - Acotar a las de una puerta concreta
 * @property {boolean} [onlyLive] - Solo las que abren o van a abrir: excluye revocadas y caducadas
 */
export interface CommunityCredentialsQuery extends CommunityListQuery {
  residentMembershipId?: string;
  lockGroupId?: string;
  lockId?: string;
  onlyLive?: boolean;
}

/**
 * Un vecino del reparto en lote: a quién se le da la llave y con qué etiqueta queda en la lista.
 *
 * La etiqueta la compone la pantalla a partir del nombre y la vivienda, no la API: así lo que se ve en la
 * vista previa antes de repartir es exactamente lo que va a quedar escrito.
 * @interface BatchCredentialTarget
 * @property {string} residentMembershipId - Pertenencia del vecino que recibe la llave
 * @property {string} label - Etiqueta de esta credencial (máx. 100)
 * @property {string} [pin] - PIN propio de este vecino, si el tipo es PIN; sin él lo genera la API
 */
export interface BatchCredentialTarget {
  residentMembershipId: string;
  label: string;
  pin?: string;
}

/**
 * Reparto de la misma llave a varios vecinos
 * (`POST client/me/communities/:serviceId/lock-credentials/batch`).
 *
 * Un destino, un tipo y una validez para todos, y la lista de vecinos. **No admite tarjetas NFC**: cada
 * tarjeta física tiene su UID y la API lo exige al emitir, así que se dan de una en una.
 * @interface BatchCreateLockCredentialsDto
 * @property {string} [lockId] - La puerta a la que dan acceso; excluyente con `lockGroupId`
 * @property {string} [lockGroupId] - El llavero al que dan acceso; excluyente con `lockId`
 * @property {LockCredentialType} type - Tipo de credencial, el mismo para todas
 * @property {string} [validFrom] - Desde cuándo valen (ISO 8601)
 * @property {string} [validUntil] - Hasta cuándo valen (ISO 8601)
 * @property {boolean} [canBypassSchedule] - Si pueden abrir fuera del horario de la puerta
 * @property {string} [bypassReason] - Por qué, obligatorio si se concede el salto
 * @property {BatchCredentialTarget[]} residents - Los vecinos que reciben la llave
 */
export interface BatchCreateLockCredentialsDto {
  lockId?: string;
  lockGroupId?: string;
  type: LockCredentialType;
  validFrom?: string;
  validUntil?: string;
  canBypassSchedule?: boolean;
  bypassReason?: string;
  residents: BatchCredentialTarget[];
}

/**
 * Parte de un reparto en lote.
 *
 * Un vecino que falla no cancela el resto, así que la respuesta trae las dos listas. Las emitidas llegan
 * completas, con su `plainPin` cuando el tipo es PIN: **es la única vez que ese PIN se puede leer**.
 * @interface LockCredentialBatchResult
 * @property {LockCredentialCreated[]} created - Las credenciales emitidas
 * @property {{residentMembershipId: string, error: string}[]} failed - Los vecinos que se quedaron sin llave, con el código del error
 */
export interface LockCredentialBatchResult {
  created: LockCredentialCreated[];
  failed: { residentMembershipId: string; error: string }[];
}

/**
 * Resumen de las incidencias del cliente (`GET client/me/incidents/counters`).
 *
 * No trae «sin asignar» como el de la intranet: a quién le toca el trabajo es un dato interno, y enseñárselo
 * al cliente solo invita a preguntar por qué su avería no tiene dueño todavía.
 * @interface PortalIncidentCounters
 * @property {number} open - Abiertas (nueva, en curso, esperando a un tercero)
 * @property {number} overdue - Abiertas cuyo compromiso de resolución ya ha pasado
 * @property {number} resolved - Resueltas pendientes de cierre
 * @property {number} closed - Cerradas
 */
export interface PortalIncidentCounters {
  open: number;
  overdue: number;
  resolved: number;
  closed: number;
}
