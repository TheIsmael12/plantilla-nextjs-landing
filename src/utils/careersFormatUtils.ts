/**
 * Importes de un salario ya formateados y listos para los mensajes `Careers.card.salary*`.
 * @interface FormattedJobSalary
 * @property {string} min - Importe mínimo
 * @property {string | null} max - Importe máximo, o `null` si la oferta solo publica el mínimo
 */
interface FormattedJobSalary {
  min: string;
  max: string | null;
}

/**
 * Formatea el salario de una oferta para enseñarlo.
 *
 * El backend manda los importes como cadenas decimales (`"18000.00"`), que es lo correcto para no perder
 * precisión por el camino pero **no** es lo que se puede pintar: sin pasar por `Intl`, la tarjeta enseñaba
 * literalmente «18000.00 - 21000.00 EUR».
 *
 * La divisa se pone en **un solo importe**, no en los dos: en un rango va en el máximo («18.000 - 21.000 €»)
 * y cuando solo hay mínimo, en ese («Desde 18.000 €»). Es como se lee un salario, y es lo que esperan los
 * mensajes de `views.json`, que ya no llevan un marcador de divisa aparte.
 *
 * Sin decimales a propósito: un salario anual con céntimos es ruido, y ninguna oferta los usa.
 * @param {PublicJobSalary | null | undefined} salary - Salario tal como llega de la API, si la oferta lo publica
 * @param {string} locale - Locale activo, para el separador de miles y la posición del símbolo
 * @returns {FormattedJobSalary | null} Los importes formateados, o `null` si no hay salario que enseñar
 */
export function formatJobSalary(
  salary: PublicJobSalary | null | undefined,
  locale: string,
): FormattedJobSalary | null {
  if (!salary) return null;

  const currency = salary.currency || "EUR";

  const asNumber = (value: string | null | undefined): number | null => {
    if (value === null || value === undefined || value === "") return null;

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const format = (value: number, withCurrency: boolean): string =>
    new Intl.NumberFormat(locale, {
      ...(withCurrency ? { style: "currency", currency } : {}),
      maximumFractionDigits: 0,
    }).format(value);

  const min = asNumber(salary.min);
  const max = asNumber(salary.max);

  // Una oferta que solo publica el máximo es raro, pero el backend lo permite: se enseña como si fuera el
  // único importe en vez de dejar la línea vacía.
  if (min === null) return max === null ? null : { min: format(max, true), max: null };

  return max === null
    ? { min: format(min, true), max: null }
    : { min: format(min, false), max: format(max, true) };
}
