/**
 * Catálogo de zonas de cobertura (requisitos-seo.md §4): 20 municipios de la Comunidad de
 * Madrid donde Imora presta servicio, confirmados por la empresa (2026-08-15) — no es una
 * lista candidata, es la cobertura real.
 *
 * Cada zona lleva datos **objetivos y verificables** (corona metropolitana, distancia
 * aproximada a Madrid capital, comunicaciones, perfil de vivienda predominante): información
 * pública de geografía/urbanismo, no datos de la actividad de Imora en esa zona — eso
 * (número de clientes, comunidades gestionadas allí, casos reales) solo lo puede aportar la
 * empresa y no se inventa aquí. Es lo que evita que `/zonas/[municipio]` sea la misma página
 * con el nombre cambiado: cada una parte de un contexto geográfico real y distinto.
 *
 * Los 3 primeros (`madrid`, `pozuelo-de-alarcon`, `alcorcon`) son los ya mencionados desde
 * antes en `About.cta.zones`; el resto completa la cobertura real confirmada por la empresa.
 */

/** Corona metropolitana a la que pertenece cada zona, para agrupar en el listado y en el copy. */
export type MetropolitanArea = "capital" | "noroeste" | "norte" | "sur" | "este";

/**
 * Una zona en la que se presta servicio, tal como se lista y se enlaza.
 * @interface ZoneData
 */
export interface ZoneData {
  /** Slug de la zona, único, usado en la URL y como clave de i18n (`Zones.items.<slug>`). */
  slug: string;
  /** Nombre del municipio tal y como se muestra (con tildes/mayúsculas correctas). */
  name: string;
  /** Corona metropolitana a la que pertenece, para agrupar zonas cercanas entre sí. */
  area: MetropolitanArea;
  /** Distancia aproximada por carretera al centro de Madrid, en kilómetros. */
  distanceKm: number;
  /** Coordenadas del municipio (centro aproximado), para el schema `Place`/`areaServed`. */
  latitude: number;
  longitude: number;
}

/**
 * Las 20 zonas, en el mismo orden que `requisitos-seo.md` §4 (confirmadas primero, luego
 * Nivel 1, 2 y 3). Las coordenadas son del centro urbano aproximado de cada municipio
 * (fuente: Instituto de Estadística de la Comunidad de Madrid / Nomenclátor geográfico
 * público), suficientes para `areaServed`/`Place` — no para navegación de precisión.
 */
export const ZONES: ZoneData[] = [
  // Ya confirmadas en la web (About.cta.zones)
  { slug: "madrid", name: "Madrid", area: "capital", distanceKm: 0, latitude: 40.4168, longitude: -3.7038 },
  { slug: "pozuelo-de-alarcon", name: "Pozuelo de Alarcón", area: "noroeste", distanceKm: 14, latitude: 40.4325, longitude: -3.8125 },
  { slug: "alcorcon", name: "Alcorcón", area: "sur", distanceKm: 14, latitude: 40.3459, longitude: -3.8228 },

  // Nivel 1 — corona noroeste, alto perfil de comunidades
  { slug: "majadahonda", name: "Majadahonda", area: "noroeste", distanceKm: 17, latitude: 40.4735, longitude: -3.8722 },
  { slug: "las-rozas", name: "Las Rozas de Madrid", area: "noroeste", distanceKm: 20, latitude: 40.4925, longitude: -3.8739 },
  { slug: "boadilla-del-monte", name: "Boadilla del Monte", area: "noroeste", distanceKm: 19, latitude: 40.4067, longitude: -3.8781 },
  { slug: "alcobendas", name: "Alcobendas", area: "norte", distanceKm: 15, latitude: 40.5395, longitude: -3.6419 },

  // Nivel 2 — corona norte y sur con volumen de comunidades
  { slug: "san-sebastian-de-los-reyes", name: "San Sebastián de los Reyes", area: "norte", distanceKm: 20, latitude: 40.5473, longitude: -3.6266 },
  { slug: "tres-cantos", name: "Tres Cantos", area: "norte", distanceKm: 24, latitude: 40.6006, longitude: -3.7108 },
  { slug: "getafe", name: "Getafe", area: "sur", distanceKm: 14, latitude: 40.3057, longitude: -3.7327 },
  { slug: "leganes", name: "Leganés", area: "sur", distanceKm: 13, latitude: 40.3272, longitude: -3.7635 },
  { slug: "fuenlabrada", name: "Fuenlabrada", area: "sur", distanceKm: 22, latitude: 40.2842, longitude: -3.7943 },
  { slug: "mostoles", name: "Móstoles", area: "sur", distanceKm: 18, latitude: 40.3223, longitude: -3.8649 },

  // Nivel 3 — resto de la corona metropolitana
  { slug: "torrejon-de-ardoz", name: "Torrejón de Ardoz", area: "este", distanceKm: 21, latitude: 40.4599, longitude: -3.4772 },
  { slug: "coslada", name: "Coslada", area: "este", distanceKm: 14, latitude: 40.4238, longitude: -3.5613 },
  { slug: "rivas-vaciamadrid", name: "Rivas-Vaciamadrid", area: "este", distanceKm: 18, latitude: 40.3313, longitude: -3.5328 },
  { slug: "colmenar-viejo", name: "Colmenar Viejo", area: "norte", distanceKm: 29, latitude: 40.6598, longitude: -3.7674 },
  { slug: "torrelodones", name: "Torrelodones", area: "noroeste", distanceKm: 27, latitude: 40.5847, longitude: -3.9317 },
  { slug: "collado-villalba", name: "Collado Villalba", area: "noroeste", distanceKm: 36, latitude: 40.6339, longitude: -4.0069 },
  { slug: "arganda-del-rey", name: "Arganda del Rey", area: "este", distanceKm: 27, latitude: 40.3013, longitude: -3.4364 },
];

/** Slug de zona válido, tal y como los define {@link ZONES}. */
export type ZoneSlug = (typeof ZONES)[number]["slug"];

/** Los 20 slugs, para `pathnames.ts`/`sitemap.ts`/`generateStaticParams`. */
export const ZONE_SLUGS = ZONES.map((zone) => zone.slug) as [ZoneSlug, ...ZoneSlug[]];

const ZONES_BY_SLUG = new Map(ZONES.map((zone) => [zone.slug, zone]));

/**
 * Busca una zona por su slug.
 * @param {string} slug - Slug de la zona
 * @returns {ZoneData | undefined} Los datos de la zona, o `undefined` si el slug no existe
 */
export function getZoneBySlug(slug: string): ZoneData | undefined {
  return ZONES_BY_SLUG.get(slug);
}

/**
 * Otras zonas de la misma corona metropolitana, para el enlazado interno "zonas cercanas"
 * (`ZoneNearby.tsx`) — refuerza el enlazado entre páginas de zona que pide `requisitos-seo.md`
 * §4, y ayuda a quien busca su municipio a descubrir que Imora también cubre los vecinos.
 * @param {string} slug - Slug de la zona actual, excluida del resultado
 * @param {number} [limit] - Máximo de zonas a devolver
 * @returns {ZoneData[]} Hasta `limit` zonas de la misma corona, en el orden del catálogo
 */
export function getNearbyZones(slug: string, limit = 4): ZoneData[] {
  const current = getZoneBySlug(slug);
  if (!current) return [];

  return ZONES.filter((zone) => zone.slug !== slug && zone.area === current.area).slice(0, limit);
}
