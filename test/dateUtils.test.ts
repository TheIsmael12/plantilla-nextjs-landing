import { describe, expect, it } from "vitest";

import {
  addMonths,
  dateKey,
  daysBetween,
  getDecadeStart,
  isBeforeDay,
  isSameDay,
  isWithinRange,
  startOfDay,
  startOfMonth,
  toDateOrNull,
  toLocalIsoDate,
} from "@/utils/dateUtils";

describe("toDateOrNull", () => {
  it.each([null, undefined])("con %j devuelve null", (value) => {
    expect(toDateOrNull(value)).toBeNull();
  });

  it("una fecha válida se normaliza al principio del día", () => {
    const result = toDateOrNull(new Date(2026, 2, 14, 18, 45, 30));

    expect(result).toEqual(new Date(2026, 2, 14));
  });

  it("una fecha inválida devuelve null en vez de propagarse", () => {
    expect(toDateOrNull(new Date("no-soy-una-fecha"))).toBeNull();
    expect(toDateOrNull("tampoco soy una fecha")).toBeNull();
  });

  /*
   * Una cadena `YYYY-MM-DD` se interpreta en **hora local**, y eso es todo el motivo de que exista la rama.
   *
   * `new Date("2026-03-14")` la trata como UTC, así que al oeste de Greenwich devuelve el día 13 a las 23:00 y el
   * calendario resalta el día anterior. Construyéndola con año, mes y día se queda donde debe.
   */
  it("una cadena YYYY-MM-DD no se desplaza por la zona horaria", () => {
    const result = toDateOrNull("2026-03-14");

    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(2);
    expect(result?.getDate()).toBe(14);
  });

  it("una marca de tiempo ISO completa también vale", () => {
    expect(toDateOrNull("2026-03-14T18:45:00.000Z")).toBeInstanceOf(Date);
  });
});

describe("startOfDay / startOfMonth", () => {
  it("startOfDay quita la hora", () => {
    expect(startOfDay(new Date(2026, 2, 14, 23, 59, 59))).toEqual(new Date(2026, 2, 14));
  });

  it("startOfMonth va al día 1", () => {
    expect(startOfMonth(new Date(2026, 2, 14))).toEqual(new Date(2026, 2, 1));
  });
});

/*
 * `addMonths` **siempre aterriza en el día 1**, y no es un efecto secundario: está pensada para mover la «vista de
 * mes» de un calendario, donde el día no pinta nada.
 *
 * Merece la pena fijarlo porque el nombre no lo dice —«añadir meses» suena a conservar el día— y quien la
 * reutilice para calcular un vencimiento a tres meses obtendría el día 1 en vez del mismo día. De paso, esto evita
 * el desbordamiento clásico del 31 de enero: al ir siempre al día 1, febrero nunca se salta.
 */
describe("addMonths", () => {
  it("suma y resta meses, y cae en el día 1", () => {
    expect(addMonths(new Date(2026, 2, 14), 1)).toEqual(new Date(2026, 3, 1));
    expect(addMonths(new Date(2026, 2, 14), -3)).toEqual(new Date(2025, 11, 1));
  });

  it("cruza el cambio de año", () => {
    expect(addMonths(new Date(2026, 11, 15), 1).getFullYear()).toBe(2027);
    expect(addMonths(new Date(2026, 11, 15), 1).getMonth()).toBe(0);
  });

  it("desde un día 31 no se salta el mes corto", () => {
    const result = addMonths(new Date(2026, 0, 31), 1);

    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(1);
  });
});

describe("isSameDay / isBeforeDay", () => {
  it("el mismo día a distinta hora es el mismo día", () => {
    expect(isSameDay(new Date(2026, 2, 14, 1), new Date(2026, 2, 14, 23))).toBe(true);
  });

  it("días distintos no lo son", () => {
    expect(isSameDay(new Date(2026, 2, 14), new Date(2026, 2, 15))).toBe(false);
  });

  it("isBeforeDay compara por día, no por hora", () => {
    expect(isBeforeDay(new Date(2026, 2, 14, 23), new Date(2026, 2, 15, 1))).toBe(true);
    // El mismo día no es «antes», aunque la hora sea menor.
    expect(isBeforeDay(new Date(2026, 2, 14, 1), new Date(2026, 2, 14, 23))).toBe(false);
  });
});

describe("daysBetween", () => {
  it("cuenta los días entre dos fechas", () => {
    expect(daysBetween(new Date(2026, 2, 14), new Date(2026, 2, 21))).toBe(7);
  });

  it("hacia atrás cuenta en negativo", () => {
    expect(daysBetween(new Date(2026, 2, 21), new Date(2026, 2, 14))).toBe(-7);
  });

  it("el mismo día son cero", () => {
    expect(daysBetween(new Date(2026, 2, 14, 1), new Date(2026, 2, 14, 23))).toBe(0);
  });

  /*
   * El cambio de hora no descuadra la cuenta, y por eso hay un `Math.round`.
   *
   * En la madrugada del último domingo de marzo un día dura 23 horas; dividiendo sin redondear saldría 6,96 y el
   * truncado daría 6 días donde hay 7.
   */
  it("una semana con cambio de hora sigue siendo siete días", () => {
    expect(daysBetween(new Date(2026, 2, 25), new Date(2026, 3, 1))).toBe(7);
  });
});

describe("isWithinRange", () => {
  it("incluye los extremos", () => {
    const start = new Date(2026, 2, 10);
    const end = new Date(2026, 2, 20);

    expect(isWithinRange(start, start, end)).toBe(true);
    expect(isWithinRange(end, start, end)).toBe(true);
    expect(isWithinRange(new Date(2026, 2, 15), start, end)).toBe(true);
  });

  it("deja fuera lo que se sale", () => {
    expect(isWithinRange(new Date(2026, 2, 9), new Date(2026, 2, 10), new Date(2026, 2, 20))).toBe(false);
    expect(isWithinRange(new Date(2026, 2, 21), new Date(2026, 2, 10), new Date(2026, 2, 20))).toBe(false);
  });

  /*
   * Un rango al revés se ordena solo.
   *
   * Pasa al elegir fechas en un selector de rango: se pulsa primero el día final y luego el inicial. Sin
   * ordenarlos, el rango quedaría vacío y no se marcaría ni un día.
   */
  it("un rango con los extremos invertidos funciona igual", () => {
    expect(isWithinRange(new Date(2026, 2, 15), new Date(2026, 2, 20), new Date(2026, 2, 10))).toBe(true);
  });
});

describe("dateKey / toLocalIsoDate", () => {
  it("dateKey identifica un día sin la hora", () => {
    expect(dateKey(new Date(2026, 2, 14, 18))).toBe(dateKey(new Date(2026, 2, 14, 2)));
  });

  it("toLocalIsoDate rellena con ceros", () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(toLocalIsoDate(new Date(2026, 10, 25))).toBe("2026-11-25");
  });

  /*
   * `toLocalIsoDate` da el día **local**, y ese es su motivo de ser frente a `toISOString`.
   *
   * `toISOString()` convierte a UTC, así que una fecha de última hora de la tarde en España se escribiría con el
   * día siguiente. Al mandarla al backend como fecha de una factura, se registraría un día después.
   */
  it("no se desplaza al día siguiente por la zona horaria", () => {
    expect(toLocalIsoDate(new Date(2026, 2, 14, 23, 59))).toBe("2026-03-14");
  });
});

/*
 * «Década» aquí son **doce años, no diez**, y el nombre engaña a propósito poco.
 *
 * El tramo se elige para que quepa en la misma rejilla de 3×4 que los meses, así que va de doce en doce desde el
 * año 0 y no coincide con «los veinte» del calendario civil. Está explicado en el módulo; se fija aquí porque
 * quien lea solo el nombre esperaría 2020 para 2026, y lo que sale es 2016.
 */
describe("getDecadeStart", () => {
  it("baja al múltiplo de doce, no de diez", () => {
    expect(getDecadeStart(2026)).toBe(2016);
    expect(getDecadeStart(2016)).toBe(2016);
    expect(getDecadeStart(2027)).toBe(2016);
    expect(getDecadeStart(2028)).toBe(2028);
  });

  it("los tramos son contiguos y de doce años", () => {
    expect(getDecadeStart(2028) - getDecadeStart(2016)).toBe(12);
  });
});
