/**
 * Props de `CareersHero`.
 * @interface CareersHeroProps
 * @property {number} totalJobs - Ofertas vigentes en total
 * @property {number} totalCities - Ciudades con alguna oferta
 */
interface CareersHeroProps {
  totalJobs: number;
  totalCities: number;
}

/**
 * Props de `JobSearchBar`.
 * @interface JobSearchBarProps
 * @property {PublicJobFacet[]} cities - Ciudades con ofertas, para el selector
 * @property {string} [activeSearch] - Texto buscado ahora mismo
 * @property {string} [activeCity] - Ciudad filtrada ahora mismo
 */
interface JobSearchBarProps {
  cities: PublicJobFacet[];
  activeSearch?: string;
  activeCity?: string;
}

/**
 * Props de `JobFilters`.
 * @interface JobFiltersProps
 * @property {PublicJobFilters} filters - Facetas con su número de ofertas
 * @property {Record<string, string | string[] | undefined>} activeFilters - Filtros activos, tal como vienen de la URL
 * @property {number} resultCount - Cuántas ofertas está devolviendo la búsqueda
 */
interface JobFiltersProps {
  filters: PublicJobFilters;
  activeFilters: Record<string, string | string[] | undefined>;
  resultCount: number;
}

/**
 * Props de `JobCard`.
 * @interface JobCardProps
 * @property {PublicJobListItem} job - Oferta a pintar
 */
interface JobCardProps {
  job: PublicJobListItem;
}

/**
 * Props de `JobList`.
 * @interface JobListProps
 * @property {PublicJobListItem[]} jobs - Ofertas de la página actual
 */
interface JobListProps {
  jobs: PublicJobListItem[];
}

/**
 * Props de `JobEmptyState`.
 * @interface JobEmptyStateProps
 * @property {boolean} hasFilters - Si hay filtros activos, para distinguir «no hay nada» de «nada encaja»
 */
interface JobEmptyStateProps {
  hasFilters: boolean;
}

/**
 * Props de `JobPagination`.
 * @interface JobPaginationProps
 * @property {number} currentPage - Página actual, base 1
 * @property {number} totalPages - Total de páginas
 * @property {Record<string, string | string[] | undefined>} [searchParams] - Filtros a preservar en los enlaces
 * @property {string} [citySlug] - Ciudad, cuando la paginación es de una página de ciudad
 */
interface JobPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams?: Record<string, string | string[] | undefined>;
  citySlug?: string;
}

/**
 * Props de `JobCityLinks`.
 * @interface JobCityLinksProps
 * @property {PublicJobFacet[]} cities - Ciudades con ofertas, ya ordenadas por número
 * @property {number} [limit] - Cuántas enseñar; el resto se dejan fuera
 */
interface JobCityLinksProps {
  cities: PublicJobFacet[];
  limit?: number;
}

/**
 * Props de `JobDetailHeader`.
 * @interface JobDetailHeaderProps
 * @property {PublicJobDetail} job - Oferta que se está viendo
 */
interface JobDetailHeaderProps {
  job: PublicJobDetail;
}

/**
 * Props de `JobDetailBody`.
 * @interface JobDetailBodyProps
 * @property {PublicJobDetail} job - Oferta que se está viendo
 */
interface JobDetailBodyProps {
  job: PublicJobDetail;
}

/**
 * Props de `JobApplyForm`.
 *
 * Mismo contrato que `ContactFormProps`, y por el mismo motivo: el formulario valida con Formik + Yup y
 * **entrega los valores**; quien llama decide qué hacer con ellos y le devuelve el estado por props. Así el
 * componente no sabe nada de acciones de servidor ni de cómo viaja el fichero.
 * @interface JobApplyFormProps
 * @property {string} [jobCode] - Código de la oferta; sin él, el formulario es de candidatura espontánea
 * @property {PublicJobLocation[]} cities - Ciudades del catálogo, para el selector de disponibilidad. **No** las facetas del buscador: el campo pregunta dónde puede trabajar quien se presenta, no dónde hay vacante hoy
 * @property {boolean} [requireTalentPool] - Exige el consentimiento de bolsa de talento (candidatura espontánea)
 * @property {(values: JobApplicationFormValues, captchaToken?: string) => void} [onSubmit] - Recibe los valores validados y el token de Turnstile, si se resolvió
 * @property {boolean} [loading] - Mientras sube: el botón se deshabilita y cambia de texto
 * @property {boolean} [success] - Sustituye el formulario por la confirmación
 * @property {string} [error] - Mensaje de error a nivel de formulario
 * @property {boolean} [hideHeader] - Oculta el título y el subtítulo del formulario, para cuando quien lo contiene ya los pone (ver `JobApplyDialog`)
 */
interface JobApplyFormProps {
  jobCode?: string;
  cities: PublicJobLocation[];
  requireTalentPool?: boolean;
  onSubmit?: (values: JobApplicationFormValues, captchaToken?: string) => void;
  loading?: boolean;
  success?: boolean;
  error?: string;
  hideHeader?: boolean;
}

/**
 * Props de `JobApplySection`.
 *
 * Los mismos que el formulario menos el estado, que es justo lo que aporta esta capa.
 * @interface JobApplySectionProps
 * @property {string} [jobCode] - Oferta a la que se presenta
 * @property {PublicJobLocation[]} cities - Ciudades del catálogo, para el selector
 * @property {boolean} [requireTalentPool] - Candidatura espontánea
 * @property {boolean} [hideHeader] - Se pasa tal cual al formulario (ver `JobApplyFormProps`)
 */
interface JobApplySectionProps {
  jobCode?: string;
  cities: PublicJobLocation[];
  requireTalentPool?: boolean;
  hideHeader?: boolean;
}

/**
 * Props de `ApplicationProgress`.
 * @interface ApplicationProgressProps
 * @property {{ key: string; label: string }[]} steps - Los estados por los que pasa el proceso, en orden y con su nombre ya traducido
 * @property {number} currentIndex - Índice (base 0) del estado actual; los anteriores se pintan como hechos y los siguientes como pendientes
 */
interface ApplicationProgressProps {
  steps: { key: string; label: string }[];
  currentIndex: number;
}

/**
 * Props de `ApplicationTracking`.
 * @interface ApplicationTrackingProps
 * @property {JobApplicationTracking} application - Estado de la candidatura
 * @property {string} token - Token del enlace, para poder retirarla
 */
interface ApplicationTrackingProps {
  application: JobApplicationTracking;
  token: string;
}

/**
 * Props de `JobPostingJsonLd`.
 * @interface JobPostingJsonLdProps
 * @property {PublicJobDetail} job - Oferta de la que se emiten los datos estructurados
 * @property {string} locale - Idioma de la página
 */
interface JobPostingJsonLdProps {
  job: PublicJobDetail;
  locale: string;
}

/**
 * Props de `JobDetailAside`.
 * @interface JobDetailAsideProps
 * @property {PublicJobDetail} job - Oferta que se está viendo
 * @property {PublicJobLocation[]} cities - Ciudades del catálogo, para el selector del formulario
 */
interface JobDetailAsideProps {
  job: PublicJobDetail;
  cities: PublicJobLocation[];
}

/**
 * Props de `JobApplyDialog`.
 *
 * Lleva `jobTitle` además del código porque el diálogo tapa la ficha: sin el título del puesto en su
 * cabecera, una vez abierto no hay forma de comprobar a qué oferta se está presentando.
 * @interface JobApplyDialogProps
 * @property {string} jobCode - Oferta a la que se presenta
 * @property {string} jobTitle - Título del puesto, para la cabecera del diálogo
 * @property {PublicJobLocation[]} cities - Ciudades del catálogo, para el selector
 * @property {boolean} isOpen - Si el diálogo está abierto
 * @property {() => void} onClose - Handler de cierre
 */
interface JobApplyDialogProps {
  jobCode: string;
  jobTitle: string;
  cities: PublicJobLocation[];
  isOpen: boolean;
  onClose: () => void;
}
