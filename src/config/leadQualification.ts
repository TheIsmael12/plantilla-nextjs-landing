import { SERVICE_SLUGS, type ServiceSlug } from "@/config/routing";

/**
 * Los valores de cualificación que ofrece el formulario de contacto, y su correspondencia con los enums
 * del backend (`requisitos-leads.md`, 7.2.1).
 *
 * Están aquí y no dentro del componente porque los usan tres cosas: el desplegable, el esquema de Yup
 * que valida lo elegido, y el contenedor que monta el envío. Con la lista repetida en cada uno, añadir un
 * valor dejaba pasar por el formulario algo que el backend rechaza con un 400.
 *
 * Los textos **no** están aquí: van en `Contact.form.options` (i18n), como el resto de la copia.
 */

/** Qué es quien escribe. Mismo orden que en la sección «¿A quién ayudamos?» de la home. */
export const CONTACT_PROFILES = [
  "PROPERTY_OWNERS_ASSOCIATION",
  "PROPERTY_MANAGER",
  "COMPANY",
  "INDIVIDUAL",
] as const;

/**
 * Uno de los perfiles que ofrece el formulario.
 * @typedef {("PROPERTY_OWNERS_ASSOCIATION"|"PROPERTY_MANAGER"|"COMPANY"|"INDIVIDUAL")} ContactProfile
 */
export type ContactProfile = (typeof CONTACT_PROFILES)[number];

/** El perfil que además pregunta cuántas fincas gestiona (ver `ContactForm`). */
export const PROPERTY_MANAGER_PROFILE: ContactProfile = "PROPERTY_MANAGER";

/**
 * Los tramos de cartera de la landing de administradores, y cuántas fincas suponen.
 *
 * Existen porque esa página ya le pregunta a un administrador cuántas comunidades lleva —es lo que hace la
 * cuenta de `PropertyManagersMath`— y llegaba al formulario sin traerlo: se le preguntaba dos veces lo
 * mismo, la segunda con un campo vacío. El número es el que la propia sección usa para calcular, así que
 * lo que se rellena es exactamente lo que la persona acaba de ver en pantalla.
 *
 * Se traduce a un número y no a un rango porque el backend guarda un entero (`managedPropertiesCount`), y
 * porque quien llega con el campo ya puesto puede corregirlo: es una estimación de partida, no una
 * respuesta cerrada.
 */
export const PORTFOLIO_BUCKETS: Record<string, number> = {
  small: 5,
  medium: 20,
  large: 50,
  xlarge: 100,
};

/**
 * Servicios que se pueden elegir: los seis de la web, más «otro».
 *
 * Se derivan de `SERVICE_SLUGS` en vez de escribirse otra vez, y ese es el punto: los valores que espera
 * el backend son exactamente esos slugs en mayúsculas, así que un servicio nuevo en la web aparece aquí
 * solo, y no hay forma de que las dos listas discrepen.
 */
export const SERVICE_INTERESTS = [
  ...SERVICE_SLUGS.map((slug) => slug.toUpperCase()),
  "OTHER",
] as const;

/**
 * Uno de los servicios que ofrece el formulario: un slug de la web en mayúsculas, u `OTHER`.
 * @typedef {string} ServiceInterest
 */
export type ServiceInterest = Uppercase<ServiceSlug> | "OTHER";

/** Para cuándo lo necesita. Del más urgente al menos, que es el orden en que se lee. */
export const TIMEFRAMES = ["ASAP", "THIS_MONTH", "JUST_INFO"] as const;

/**
 * Uno de los plazos que ofrece el formulario.
 * @typedef {("ASAP"|"THIS_MONTH"|"JUST_INFO")} Timeframe
 */
export type Timeframe = (typeof TIMEFRAMES)[number];

/**
 * Tope del número de fincas, el mismo que valida el backend.
 *
 * No es un límite de negocio: es lo que evita que el campo, que rellena cualquiera desde internet, meta
 * dos mil millones en un número que luego se promedia en un informe.
 */
export const MAX_MANAGED_PROPERTIES = 5000;

/**
 * Comprobaciones de tipo para pasar de lo que devuelve un campo del formulario —una cadena— a los valores
 * que acepta la API.
 *
 * El esquema de Yup ya rechaza cualquier otra cosa, así que en la práctica nunca dicen `false`. Existen
 * porque son la **frontera de tipos**: sin ellas hay que afirmarle a TypeScript que la cadena es del enum,
 * y esa afirmación seguiría compilando el día que se añada un valor al formulario y no a la API. Aquí lo
 * que no reconoce se descarta, que es mejor que mandarlo para que la API lo rechace con un 400.
 * @param value - Valor tal como sale del formulario
 * @returns Si el valor es uno de los que acepta la API
 */
export function isContactProfile(value: string): value is ContactProfile {
  return (CONTACT_PROFILES as readonly string[]).includes(value);
}

/** Ver {@link isContactProfile}. */
export function isServiceInterest(value: string): value is ServiceInterest {
  return (SERVICE_INTERESTS as readonly string[]).includes(value);
}

/** Ver {@link isContactProfile}. */
export function isTimeframe(value: string): value is Timeframe {
  return (TIMEFRAMES as readonly string[]).includes(value);
}
