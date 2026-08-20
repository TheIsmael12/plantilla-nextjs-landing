/** Modalidad de trabajo de una oferta (requisitos-empleo.md del backend, sección 1.6). */
type JobWorkMode = "ON_SITE" | "HYBRID" | "REMOTE";

/** Experiencia pedida, de menos a más: el orden **es** el dato para el filtro. */
type JobExperienceLevel = "NONE" | "UP_TO_1" | "FROM_1_TO_3" | "FROM_3_TO_5" | "OVER_5";

/** Periodo al que se refiere el importe del salario. */
type JobSalaryPeriod = "HOUR" | "MONTH" | "YEAR";

/** Estado de una candidatura, tal como lo ve el candidato. */
type JobApplicationStatus =
  | "RECEIVED"
  | "IN_REVIEW"
  | "INTERVIEW"
  | "OFFER"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

/**
 * Ciudad de una oferta pública.
 *
 * `zoneSlug` la enlaza con su página de zona de servicios cuando existe: es enlazado interno gratis entre
 * dos secciones que hablan del mismo municipio.
 * @interface PublicJobLocation
 * @property {string} name - Nombre del municipio
 * @property {string} slug - Slug de la ciudad, el que va en la URL del filtro
 * @property {string} province - Provincia
 * @property {string | null} [region] - Comunidad autónoma
 * @property {string} country - Código ISO 3166-1 alpha-2
 * @property {string | null} [postalCode] - Código postal, para los datos estructurados
 * @property {string | null} [latitude] - Latitud, para los datos estructurados
 * @property {string | null} [longitude] - Longitud, para los datos estructurados
 * @property {string | null} [zoneSlug] - Slug de su página de zona de servicios
 */
interface PublicJobLocation {
  name: string;
  slug: string;
  province: string;
  region?: string | null;
  country: string;
  postalCode?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  zoneSlug?: string | null;
}

/**
 * Salario de una oferta. **Solo llega cuando la oferta lo publica**: si no, el backend no lo devuelve.
 * @interface PublicJobSalary
 * @property {string | null} [min] - Importe mínimo
 * @property {string | null} [max] - Importe máximo
 * @property {string} currency - Divisa
 * @property {JobSalaryPeriod} period - Periodo del importe
 */
interface PublicJobSalary {
  min?: string | null;
  max?: string | null;
  currency: string;
  period: JobSalaryPeriod;
}

/**
 * Oferta tal como sale en el listado público.
 * @interface PublicJobListItem
 * @property {string} jobCode - Código público de la oferta
 * @property {string} slug - Slug de su ficha en este idioma
 * @property {string} title - Título del puesto
 * @property {string} summary - Resumen para la tarjeta
 * @property {string} categoryName - Familia profesional
 * @property {string} categorySlug - Slug de la familia, para el filtro
 * @property {string} contractTypeName - Tipo de contrato
 * @property {string} contractTypeSlug - Slug del tipo de contrato, para el filtro
 * @property {string} scheduleName - Jornada
 * @property {JobWorkMode} workMode - Modalidad
 * @property {JobExperienceLevel} experienceLevel - Experiencia pedida
 * @property {PublicJobLocation[]} locations - Ciudades donde se ofrece
 * @property {PublicJobSalary | null} [salary] - Salario, solo si la oferta lo publica
 * @property {boolean} isFeatured - Si va destacada en el listado
 * @property {boolean} acceptingApplications - `false` cuando el proceso está en pausa
 * @property {string} publishedAt - Cuándo se publicó
 * @property {string} expiresAt - Cuándo caduca
 */
interface PublicJobListItem {
  jobCode: string;
  slug: string;
  title: string;
  summary: string;
  categoryName: string;
  categorySlug: string;
  contractTypeName: string;
  contractTypeSlug: string;
  scheduleName: string;
  workMode: JobWorkMode;
  experienceLevel: JobExperienceLevel;
  locations: PublicJobLocation[];
  salary?: PublicJobSalary | null;
  isFeatured: boolean;
  acceptingApplications: boolean;
  publishedAt: string;
  expiresAt: string;
}

/**
 * Oferta completa de la ficha pública.
 * @interface PublicJobDetail
 * @property {string} description - Descripción, en Markdown
 * @property {string | null} [responsibilities] - Qué va a hacer, en Markdown
 * @property {string | null} [requirements] - Qué se pide, en Markdown
 * @property {string | null} [niceToHave] - Qué suma pero no descarta, en Markdown
 * @property {string[]} benefits - Lo que se ofrece
 * @property {number} vacancies - Número de puestos
 * @property {string | null} [metaTitle] - Título para buscadores
 * @property {string | null} [metaDescription] - Descripción para buscadores
 * @property {string | null} [applyUrl] - Si la candidatura se gestiona fuera
 * @property {string} employmentType - `employmentType` de schema.org, para el JSON-LD
 * @property {Record<string, string>} alternateSlugs - Slug del mismo puesto en los otros idiomas
 * @property {number | null} [applicantCount] - Cuánta gente se ha presentado; solo llega a partir del umbral que fija el backend, y por debajo es null
 */
interface PublicJobDetail extends PublicJobListItem {
  description: string;
  responsibilities?: string | null;
  requirements?: string | null;
  niceToHave?: string | null;
  benefits: string[];
  vacancies: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  applyUrl?: string | null;
  employmentType: string;
  alternateSlugs: Record<string, string>;
  applicantCount?: number | null;
}

/**
 * Una opción de filtro con su número de ofertas.
 *
 * El backend **no devuelve las opciones a cero**: un filtro que lleva a «no hay resultados» es un callejón
 * sin salida.
 * @interface PublicJobFacet
 * @property {string} slug - Valor que va en la URL
 * @property {string} name - Texto visible
 * @property {number} count - Cuántas ofertas vigentes tiene
 */
interface PublicJobFacet {
  slug: string;
  name: string;
  count: number;
}

/**
 * Todas las opciones del buscador, en una sola llamada.
 * @interface PublicJobFilters
 * @property {PublicJobFacet[]} cities - Ciudades con ofertas
 * @property {PublicJobFacet[]} categories - Familias profesionales con ofertas
 * @property {PublicJobFacet[]} contractTypes - Tipos de contrato con ofertas
 * @property {PublicJobFacet[]} workModes - Modalidades presentes
 * @property {PublicJobFacet[]} experienceLevels - Niveles de experiencia presentes
 * @property {number} totalJobs - Cuántas ofertas vigentes hay en total
 */
interface PublicJobFilters {
  cities: PublicJobFacet[];
  categories: PublicJobFacet[];
  contractTypes: PublicJobFacet[];
  workModes: PublicJobFacet[];
  experienceLevels: PublicJobFacet[];
  totalJobs: number;
}

/**
 * Entrada del sitemap de una oferta.
 * @interface PublicJobSitemapEntry
 * @property {string} slug - Slug de la ficha
 * @property {string} updatedAt - Última modificación real de esa traducción
 * @property {string[]} citySlugs - Ciudades de la oferta, para saber qué páginas de ciudad existen
 */
interface PublicJobSitemapEntry {
  slug: string;
  updatedAt: string;
  citySlugs: string[];
}

/**
 * Lo que ve el candidato con su enlace de seguimiento.
 *
 * Tres cosas y nada más: en qué estado está, a qué se presentó y cuándo. Ni notas internas, ni valoración,
 * ni el motivo de descarte salvo que sea de los que se pueden compartir.
 * @interface JobApplicationTracking
 * @property {string} applicationCode - Referencia de la candidatura
 * @property {JobApplicationStatus} status - Estado en el proceso
 * @property {string | null} [jobTitle] - Puesto al que se presentó
 * @property {string | null} [jobSlug] - Slug de la oferta, si sigue publicada
 * @property {string | null} [rejectionReason] - Motivo del descarte, solo si es de los visibles
 * @property {string} submittedAt - Cuándo la envió
 * @property {string} statusChangedAt - Cuándo cambió por última vez
 * @property {boolean} talentPoolConsent - Si autorizó guardarla para futuros procesos
 */
interface JobApplicationTracking {
  applicationCode: string;
  status: JobApplicationStatus;
  jobTitle?: string | null;
  jobSlug?: string | null;
  rejectionReason?: string | null;
  submittedAt: string;
  statusChangedAt: string;
  talentPoolConsent: boolean;
}

/**
 * Valores del formulario de candidatura.
 *
 * `cv` es el fichero elegido: se valida en cliente antes de subir, porque dejar que se suban 20 MB para que
 * el servidor los rechace es gastar la conexión de quien se presenta.
 * @interface JobApplicationFormValues
 * @property {string} firstName - Nombre
 * @property {string} lastName - Apellidos
 * @property {string} email - Correo de contacto
 * @property {string} phone - Teléfono
 * @property {string} citySlug - Dónde puede trabajar
 * @property {string} coverLetter - Carta de presentación
 * @property {string} linkedinUrl - Perfil de LinkedIn
 * @property {File | null} cv - El currículum, en PDF
 * @property {boolean} privacyNoticeAcknowledged - Confirma que se le mostró la información
 * @property {boolean} talentPoolConsent - Guardar la candidatura para futuros procesos
 * @property {string} honeypot - Campo trampa
 */
interface JobApplicationFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  citySlug: string;
  coverLetter: string;
  linkedinUrl: string;
  cv: File | null;
  privacyNoticeAcknowledged: boolean;
  talentPoolConsent: boolean;
  honeypot: string;
}

/**
 * Lo que se manda al enviar una candidatura, ya listo para la API.
 *
 * Es el equivalente de `CreatePublicLeadPayload` en el formulario de contacto: el formulario entrega valores
 * tipados y **la acción** se encarga del transporte (aquí, un `multipart/form-data`, porque lleva el
 * fichero). El componente no monta la petición.
 * @interface JobApplicationPayload
 * @property {string} [jobCode] - Oferta a la que se presenta; sin él es una candidatura espontánea
 * @property {string} firstName - Nombre
 * @property {string} lastName - Apellidos
 * @property {string} email - Correo de contacto
 * @property {string} [phone] - Teléfono
 * @property {string} [citySlug] - Dónde puede trabajar
 * @property {string} [coverLetter] - Carta de presentación
 * @property {string} [linkedinUrl] - Perfil de LinkedIn
 * @property {File} cv - El currículum, en PDF
 * @property {string} privacyNoticeVersion - Versión de la información de privacidad que se mostró
 * @property {boolean} privacyNoticeAcknowledged - Confirma que se le mostró
 * @property {boolean} talentPoolConsent - Guardar la candidatura para futuros procesos
 * @property {string} [captchaToken] - Token de Turnstile, si el widget está activo
 * @property {string} [honeypot] - Campo trampa, solo si venía relleno
 */
interface JobApplicationPayload {
  jobCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  citySlug?: string;
  coverLetter?: string;
  linkedinUrl?: string;
  cv: File;
  privacyNoticeVersion: string;
  privacyNoticeAcknowledged: boolean;
  talentPoolConsent: boolean;
  captchaToken?: string;
  honeypot?: string;
}
