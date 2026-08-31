import { ENV } from '@/config/env';

/**
 * La dirección de la sede, escrita **de una sola manera**.
 *
 * Antes cada pantalla la montaba a su gusto a partir de las mismas cinco variables de `ENV`, y salían cinco
 * direcciones distintas para la misma oficina: el pie de página ponía «calle, ciudad, país»; la página de
 * contacto ponía «calle, código postal» y debajo «ciudad, provincia», que con la sede en la capital se leía
 * «Madrid, Madrid»; soporte y las páginas legales ponían «calle, ciudad» sin código postal; y la dirección
 * que se le mandaba al buscador de mapas no coincidía con ninguna de las que se veían en pantalla.
 *
 * Aquí hay dos formas y solo dos: la **corta**, para leer, y la **completa**, que es la que viaja a un
 * mapa. La provincia no está en ninguna: no forma parte de cómo se escribe una dirección en España, y con
 * la ciudad ya escrita al lado solo la repite.
 */

/** Calle y número, tal cual está configurado. */
export const COMPANY_STREET = ENV.COMPANY_ADDRESS;

/** «28029 Madrid»: el código postal delante del municipio, como se escribe una dirección aquí. */
export const COMPANY_LOCALITY = `${ENV.COMPANY_POSTAL_CODE} ${ENV.COMPANY_CITY}`;

/** «Calle Ejemplo, 123, 28029 Madrid». La que se pinta en pantalla. */
export const COMPANY_ADDRESS_SHORT = `${COMPANY_STREET}, ${COMPANY_LOCALITY}`;

/** La corta más el país. La que se le manda a un buscador de mapas, que necesita saber dónde buscar. */
export const COMPANY_ADDRESS_FULL = `${COMPANY_ADDRESS_SHORT}, ${ENV.COMPANY_COUNTRY}`;

/**
 * Las coordenadas de la sede, o `null` si no están configuradas.
 *
 * `null` es un estado normal, no un error: son dos variables de entorno que hay que rellenar con las de la
 * dirección definitiva, y hasta entonces **no se inventa un punto**. Quien las use tiene que saber
 * distinguir «no las tengo» de «las tengo», que es justo lo que no se podía hacer cuando faltando la
 * variable el código caía al centro de Madrid.
 */
export const COMPANY_COORDINATES: { latitude: number; longitude: number } | null =
  ENV.COMPANY_LATITUDE !== undefined && ENV.COMPANY_LONGITUDE !== undefined
    ? { latitude: ENV.COMPANY_LATITUDE, longitude: ENV.COMPANY_LONGITUDE }
    : null;

/**
 * Un teléfono como `href` de `tel:`, sin espacios.
 *
 * Los espacios de «+34 912 345 678» hacen falta para leerlo y **no valen dentro de un URI**: unos
 * navegadores los toleran y otros no marcan. Estaba resuelto en la página de contacto y olvidado en la de
 * soporte, con el mismo número.
 * @param {string} phone - El teléfono tal como se enseña
 * @returns {string} El `href` listo para un enlace
 */
export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`;
}
