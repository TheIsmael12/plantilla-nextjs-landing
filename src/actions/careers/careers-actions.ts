"use server";

import { fetchData } from "@/actions/fetch";

import type { FetchResponse, PaginatedResult } from "@/types/responses";

/**
 * Caché de la ficha de una oferta y del sitemap.
 *
 * Un minuto, no los cinco del `Cache-Control` que manda el backend: lo que se guarda aquí es contenido
 * editable, y con cinco minutos corregir una falta en la descripción y recargar para comprobarlo no
 * enseñaba el cambio.
 *
 * El listado y las facetas van **sin caché**; el motivo está en `getPublicJobs`.
 */
const CAREERS_REVALIDATE_SECONDS = 60;

/**
 * Filtros del buscador de empleo, tal como llegan de la URL.
 * @interface PublicJobsQuery
 * @property {string} locale - Idioma de la oferta
 * @property {string[]} [citySlug] - Slugs de ciudad; admite varias
 * @property {string} [categorySlug] - Slug de la familia profesional
 * @property {string} [contractSlug] - Slug del tipo de contrato
 * @property {JobWorkMode} [workMode] - Modalidad
 * @property {JobExperienceLevel} [experience] - Nivel máximo pedido
 * @property {string} [salaryMin] - Salario mínimo
 * @property {string} [search] - Texto libre
 * @property {number} [page] - Página, base 1
 * @property {number} [limit] - Ofertas por página
 * @property {"recent" | "salary"} [sort] - Ordenación
 */
export interface PublicJobsQuery {
  locale: string;
  citySlug?: string[];
  categorySlug?: string;
  contractSlug?: string;
  workMode?: JobWorkMode;
  experience?: JobExperienceLevel;
  salaryMin?: string;
  search?: string;
  page?: number;
  limit?: number;
  sort?: "recent" | "salary";
}

/**
 * Construye el query string del buscador, omitiendo lo vacío.
 *
 * Las ciudades se mandan **repetidas** (`citySlug=getafe&citySlug=leganes`) y no separadas por comas: es lo
 * que espera el `@IsArray` del DTO del backend.
 * @param {PublicJobsQuery} params - Filtros activos
 * @returns {string} El query string, incluyendo el `?` inicial
 */
function buildJobsQuery(params: PublicJobsQuery): string {
  const query = new URLSearchParams();

  query.set("locale", params.locale);
  for (const city of params.citySlug ?? []) query.append("citySlug", city);
  if (params.categorySlug) query.set("categorySlug", params.categorySlug);
  if (params.contractSlug) query.set("contractSlug", params.contractSlug);
  if (params.workMode) query.set("workMode", params.workMode);
  if (params.experience) query.set("experience", params.experience);
  if (params.salaryMin) query.set("salaryMin", params.salaryMin);
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sort) query.set("sort", params.sort);

  return `?${query.toString()}`;
}

/**
 * Lista ofertas vigentes de un idioma, con los filtros activos.
 *
 * Una oferta sin traducción en ese idioma **no aparece**: el backend la deja fuera, y esta web no la
 * enseña en otro idioma para rellenar.
 * @param {PublicJobsQuery} params - Filtros de búsqueda
 * @returns {Promise<FetchResponse<PaginatedResult<PublicJobListItem>>>} La página de ofertas, o el error
 */
export async function getPublicJobs(
  params: PublicJobsQuery,
): Promise<FetchResponse<PaginatedResult<PublicJobListItem>>> {
  /*
   * **Sin caché a propósito**: al no pasar `revalidate`, `fetchData` manda `cache: "no-store"`.
   *
   * Con caché, una oferta recién publicada no aparecía en `/empleo` hasta que vencía el plazo —o hasta que
   * alguien pulsaba «Buscar», porque eso cambia la query y con ella la clave de caché—, y desde la intranet
   * eso se lee como que la publicación no ha funcionado.
   *
   * El precio es una llamada a la API por visita del listado: doce filas contra un endpoint que responde en
   * milisegundos. La ficha y el sitemap sí se cachean, que es donde el contenido pesa y no cambia cada
   * minuto.
   */
  return fetchData<PaginatedResult<PublicJobListItem>, never>(
    `public/careers/jobs${buildJobsQuery(params)}`,
    "GET",
  );
}

/**
 * Opciones del buscador con su número de ofertas.
 *
 * Una sola llamada para las cinco listas: se pintan juntas y tienen que ser coherentes entre sí en el mismo
 * instante.
 * @param {string} locale - Idioma de los nombres
 * @returns {Promise<FetchResponse<PublicJobFilters>>} Las facetas y el total, o el error
 */
export async function getPublicJobFilters(
  locale: string,
): Promise<FetchResponse<PublicJobFilters>> {
  // Sin caché, por lo mismo que el listado: las ciudades y sus contadores salen de las ofertas vigentes.
  return fetchData<PublicJobFilters, never>(`public/careers/filters?locale=${locale}`, "GET");
}

/**
 * Las ciudades del catálogo: **todas las activas**, con ofertas abiertas o sin ellas.
 *
 * No son las `cities` de `getPublicJobFilters`, y la diferencia importa: esas son facetas del buscador
 * —salen de las ofertas vigentes— y el campo «dónde puedes trabajar» del formulario no pregunta dónde hay
 * vacante, pregunta dónde puede trabajar quien se presenta. Con las facetas, la candidatura espontánea
 * —que es justo la que se manda cuando **no** hay ninguna oferta abierta— se quedaba con el desplegable
 * vacío y sin nada que elegir.
 *
 * Con caché: es un catálogo, no un contador. Sin `locale` porque los topónimos no se traducen.
 * @returns {Promise<FetchResponse<PublicJobLocation[]>>} Las ciudades, o el error
 */
export async function getPublicJobLocations(): Promise<FetchResponse<PublicJobLocation[]>> {
  return fetchData<PublicJobLocation[], never>("public/careers/locations", "GET", undefined, {
    revalidate: CAREERS_REVALIDATE_SECONDS,
    tags: ["careers-locations"],
  });
}

/**
 * Ficha de una oferta por su slug.
 *
 * Puede responder tres cosas que la página trata distinto: la oferta, un `404` con el slug del otro idioma
 * dentro (para redirigir en vez de enseñar un error a quien solo cambió de idioma) y un `410` cuando la
 * oferta ya se cerró.
 * @param {string} slug - Slug de la oferta en ese idioma
 * @param {string} locale - Idioma pedido
 * @returns {Promise<FetchResponse<PublicJobDetail>>} La ficha, o el error con su código
 */
export async function getPublicJob(
  slug: string,
  locale: string,
): Promise<FetchResponse<PublicJobDetail>> {
  return fetchData<PublicJobDetail, never>(
    `public/careers/jobs/${encodeURIComponent(slug)}?locale=${locale}`,
    "GET",
    undefined,
    { revalidate: CAREERS_REVALIDATE_SECONDS, tags: ["careers-jobs"] },
  );
}

/**
 * Entradas de sitemap de las ofertas vigentes.
 *
 * Trae los slugs de ciudad de cada oferta porque con ellos se decide **qué páginas de ciudad existen**:
 * solo las que tienen ofertas.
 * @param {string} locale - Idioma
 * @returns {Promise<FetchResponse<PublicJobSitemapEntry[]>>} Las entradas, o el error
 */
export async function getCareersSitemapEntries(
  locale: string,
): Promise<FetchResponse<PublicJobSitemapEntry[]>> {
  return fetchData<PublicJobSitemapEntry[], never>(
    `public/careers/sitemap?locale=${locale}`,
    "GET",
    undefined,
    { revalidate: CAREERS_REVALIDATE_SECONDS, tags: ["careers-sitemap"] },
  );
}

/**
 * Estado de una candidatura a partir del token de su enlace.
 *
 * Sin caché: al no pasar `revalidate`, `fetchData` manda `cache: "no-store"`. Es información personal de
 * una sola persona, y el backend la sirve con `Cache-Control: no-store` por el mismo motivo.
 *
 * El `locale` va porque de él dependen el título **y el slug** de la oferta que se enseñan: sin él, la
 * página en español acababa enseñando el título en inglés y enlazando a un slug que en el sitio en español
 * no existe.
 * @param {string} token - Token recibido en la URL
 * @param {string} locale - Idioma de la página
 * @returns {Promise<FetchResponse<JobApplicationTracking>>} El estado, o el error
 */
export async function getApplicationStatus(
  token: string,
  locale: string,
): Promise<FetchResponse<JobApplicationTracking>> {
  return fetchData<JobApplicationTracking, never>(
    `public/careers/applications/${encodeURIComponent(token)}?locale=${locale}`,
    "GET",
  );
}

/**
 * El candidato retira su candidatura.
 *
 * Es el derecho de supresión resuelto sin barreras: pasa a `WITHDRAWN`, **borra el CV** y anonimiza. Es
 * irreversible, y la pantalla lo dice antes de llamar aquí.
 * @param {string} token - Token del enlace
 * @returns {Promise<FetchResponse<null>>} Vacío si se retiró, o el error
 */
export async function withdrawApplication(token: string): Promise<FetchResponse<null>> {
  return fetchData<null, never>(
    `public/careers/applications/${encodeURIComponent(token)}/withdraw`,
    "POST",
  );
}

/**
 * Envía una candidatura al endpoint público (`POST /public/careers/applications`).
 *
 * Va por acción de servidor y no por una llamada directa del navegador, y es lo correcto aquí por dos
 * motivos concretos:
 *
 * - **La IP real se conserva igual**: `fetchUtils` reenvía `x-forwarded-for`, así que el límite por IP y la
 *   prueba del consentimiento siguen valiendo. Era la única razón para ir directo.
 * - **La URL de la API es solo de servidor** (`API_BASE_URL`). Llamar desde el navegador exigiría publicarla
 *   como `NEXT_PUBLIC_*` y abrir CORS a este origen, dos cosas de despliegue para no ganar nada.
 *
 * El precio es que el fichero hace dos saltos, y eso obliga a subir el `bodySizeLimit` de las acciones de
 * servidor (1 MB por defecto en Next, ver `next.config.ts`) por encima del máximo del CV.
 *
 * Responde `201` **también** cuando el envío se descarta por spam: el backend no distingue, a propósito.
 *
 * Recibe un objeto tipado, igual que `submitContactLead`, y **el `FormData` se monta aquí**: es transporte
 * —el endpoint es `multipart/form-data` porque lleva un fichero— y el transporte no es asunto del
 * formulario. Los dos booleanos van como `"true"`/`"false"` explícitos y no como la presencia del campo,
 * porque el backend los lee con un parser estricto que solo acepta un sí explícito: es lo que evita que una
 * casilla sin marcar se convierta en un consentimiento.
 * @param {JobApplicationPayload} payload - Datos de la candidatura y el fichero del CV
 * @returns {Promise<FetchResponse<null>>} Vacío en éxito, o el error de la API
 */
export async function submitJobApplication(
  payload: JobApplicationPayload,
): Promise<FetchResponse<null>> {
  const formData = new FormData();

  formData.set("firstName", payload.firstName);
  formData.set("lastName", payload.lastName);
  formData.set("email", payload.email);
  formData.set("privacyNoticeVersion", payload.privacyNoticeVersion);
  formData.set("privacyNoticeAcknowledged", String(payload.privacyNoticeAcknowledged));
  formData.set("talentPoolConsent", String(payload.talentPoolConsent));
  formData.set("cv", payload.cv);

  // Los opcionales solo viajan si tienen valor: un campo vacío en un `multipart` llega como cadena vacía,
  // y el backend valida longitudes y formato sobre lo que recibe.
  const optional = {
    jobCode: payload.jobCode,
    phone: payload.phone,
    citySlug: payload.citySlug,
    coverLetter: payload.coverLetter,
    linkedinUrl: payload.linkedinUrl,
    captchaToken: payload.captchaToken,
    honeypot: payload.honeypot,
  };

  for (const [field, value] of Object.entries(optional)) {
    if (value) formData.set(field, value);
  }

  return fetchData<null, FormData>("public/careers/applications", "POST", formData);
}
