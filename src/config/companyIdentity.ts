/**
 * La identidad legal de la empresa, y la comprobación de que es de verdad.
 *
 * Una auditoría externa encontró publicado en imora.es el CIF `B12345678` y la dirección
 * «Calle Ejemplo, 123» en las páginas legales y en el canal de reclamaciones, conviviendo con la dirección
 * real en el resto del sitio. Nadie lo escribió ahí: son los **valores por defecto** de `config/env.ts`,
 * que se publican solos cuando las variables no están puestas en el entorno del despliegue.
 *
 * Ese es el fallo de fondo, y no el texto concreto. Un dato legal no puede tener un valor de conveniencia:
 * si falta, lo que hay que hacer es enterarse, no rellenar el hueco con algo que parece un dato. Y son
 * variables `NEXT_PUBLIC_*`, que se incrustan **en el build**: puestas en Vercel después de desplegar no
 * cambian nada, así que el único momento en el que se puede comprobar es mientras se construye.
 *
 * De ahí que esto lo llame `next.config.ts` y no una pantalla: un despliegue con la identidad a medias
 * falla al construirse en vez de publicarse. Es el mismo criterio que ya se aplica a las coordenadas de la
 * sede —sin ellas no se pinta ningún mapa, en vez de caer al centro de Madrid— llevado a lo que no puede
 * simplemente desaparecer de la página: un aviso legal sin CIF tampoco vale.
 */

/** Los valores que en algún momento se dejaron como ejemplo y nunca deben llegar a publicarse. */
const PLACEHOLDERS = [
  "B12345678",
  "Calle Ejemplo",
  "+34 900 123 456",
  "+34 912 345 678",
  "example.com",
];

/**
 * Los datos que identifican a la empresa ante quien lee una página legal.
 *
 * No están todos los de `ENV`: solo aquellos por los que un cliente decide si esto es una empresa real. El
 * horario o las redes sociales pueden faltar sin que eso engañe a nadie.
 */
const REQUIRED = [
  "NEXT_PUBLIC_COMPANY_NAME",
  "NEXT_PUBLIC_COMPANY_CIF",
  "NEXT_PUBLIC_COMPANY_STREET_ADDRESS",
  "NEXT_PUBLIC_COMPANY_POSTAL_CODE",
  "NEXT_PUBLIC_COMPANY_CITY",
  "NEXT_PUBLIC_COMPANY_COUNTRY",
  "NEXT_PUBLIC_COMPANY_EMAIL",
  "NEXT_PUBLIC_COMPANY_PHONE",
] as const;

/**
 * Comprueba que la identidad legal está completa y no es de mentira.
 *
 * Se ejecuta al construir. Devuelve los problemas en vez de lanzar, para que quien la llama decida: en
 * producción cortan el build, y en desarrollo se avisa y se sigue —trabajar en una pantalla de servicios no
 * puede exigir tener el CIF a mano—.
 * @returns {string[]} Un problema por línea, vacío si todo está en orden
 */
export function checkCompanyIdentity(): string[] {
  const problemas: string[] = [];

  for (const variable of REQUIRED) {
    const valor = process.env[variable]?.trim();

    if (!valor) {
      problemas.push(`Falta ${variable}.`);
      continue;
    }

    const placeholder = PLACEHOLDERS.find((ejemplo) =>
      valor.toLowerCase().includes(ejemplo.toLowerCase()),
    );

    if (placeholder) {
      problemas.push(`${variable} sigue con un valor de ejemplo ("${placeholder}").`);
    }
  }

  return problemas;
}
