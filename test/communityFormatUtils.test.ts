import { describe, expect, it } from "vitest";

import {
  ACCESS_RESULT_VARIANTS,
  CREDENTIAL_STATUS_VARIANTS,
  INCIDENT_PRIORITY_VARIANTS,
  INCIDENT_STATUS_ORDER,
  INCIDENT_STATUS_VARIANTS,
  INVITATION_STATUS_VARIANTS,
  KEY_MATRIX_STATE_GLYPHS,
  KEY_MATRIX_STATE_MODIFIERS,
  LOCK_STATUS_VARIANTS,
  MEMBERSHIP_STATUS_VARIANTS,
  formatCommunityDateTime,
  formatCommunityLabel,
} from "@/utils/communityFormatUtils";

describe("formatCommunityLabel", () => {
  it("junta el código con la dirección", () => {
    const label = formatCommunityLabel({
      serviceCode: "SERRANO-CONSERJERIA",
      address: {
        line1: "Calle Serrano 145",
        city: "Madrid",
        postalCode: "28006",
        country: "ES",
      },
    });

    expect(label).toBe("SERRANO-CONSERJERIA - Calle Serrano 145, 28006 Madrid");
  });

  /** Sin dirección se queda el código solo, sin el guion suelto colgando al final. */
  it("sin dirección deja solo el código", () => {
    expect(formatCommunityLabel({ serviceCode: "SERRANO-CONSERJERIA", address: undefined })).toBe(
      "SERRANO-CONSERJERIA",
    );
  });
});

describe("formatCommunityDateTime", () => {
  it("formatea una fecha en el locale que se le pase", () => {
    const formatted = formatCommunityDateTime("2026-03-14T09:30:00.000Z", "es-ES", "—");

    // No se compara la cadena exacta: depende de la zona y de la versión de ICU del entorno.
    expect(formatted).not.toBe("—");
    expect(formatted).toMatch(/2026/);
  });

  it.each([null, undefined, ""])("con %j devuelve el texto de reserva", (value) => {
    expect(formatCommunityDateTime(value, "es-ES", "Sin fecha")).toBe("Sin fecha");
  });

  /*
   * Una fecha que no se puede interpretar devuelve el reserva, no «Invalid Date».
   *
   * Es el caso real de un campo que llega mal desde la API: sin esta guarda, la tabla enseñaría literalmente
   * «Invalid Date» en la celda, que es peor que un guion.
   */
  it("una fecha inválida devuelve el texto de reserva", () => {
    expect(formatCommunityDateTime("no-soy-una-fecha", "es-ES", "—")).toBe("—");
  });
});

/*
 * Los mapas de variantes se comprueban **completos y con valores válidos**.
 *
 * Son `Record<Estado, BadgeVariant>`, así que TypeScript ya obliga a que estén todas las claves… mientras el tipo
 * del estado no cambie. El día que la API añada un estado nuevo, lo que falla es la compilación —bien— pero el
 * riesgo real es el contrario: que alguien añada la clave con una variante inventada que no existe en el `Badge`.
 * Eso TypeScript no lo pilla si el valor es un `string` cualquiera, y en pantalla sale una insignia sin estilo.
 */
const VALID_VARIANTS = [
  "success",
  "danger",
  "warning",
  "info",
  "neutral",
  "pending",
  "error",
];

describe("los mapas de variantes de insignia", () => {
  it.each([
    ["pertenencia", MEMBERSHIP_STATUS_VARIANTS],
    ["invitación", INVITATION_STATUS_VARIANTS],
    ["cerradura", LOCK_STATUS_VARIANTS],
    ["credencial", CREDENTIAL_STATUS_VARIANTS],
    ["prioridad de incidencia", INCIDENT_PRIORITY_VARIANTS],
    ["estado de incidencia", INCIDENT_STATUS_VARIANTS],
    ["resultado de acceso", ACCESS_RESULT_VARIANTS],
  ])("el de %s solo usa variantes que el Badge conoce", (_name, map) => {
    for (const [state, variant] of Object.entries(map)) {
      expect(VALID_VARIANTS, `${state} -> ${variant}`).toContain(variant);
    }
  });

  /** Lo denegado va en rojo o en neutro, nunca en verde: es la lectura de un vistazo del registro de accesos. */
  it("ningún acceso denegado se pinta como concedido", () => {
    for (const [result, variant] of Object.entries(ACCESS_RESULT_VARIANTS)) {
      if (result.startsWith("DENIED")) expect(variant, result).not.toBe("success");
    }
  });

  it("todo lo concedido se distingue de un error", () => {
    expect(ACCESS_RESULT_VARIANTS.GRANTED).toBe("success");
    expect(ACCESS_RESULT_VARIANTS.ERROR).toBe("error");
  });
});

describe("INCIDENT_STATUS_ORDER", () => {
  /*
   * El orden **es** la máquina de estados del backend, y por eso se fija.
   *
   * Se usa para ordenar columnas y agrupaciones; si alguien reordena la lista por gusto, los estados dejan de
   * seguir el ciclo de vida y una incidencia cerrada aparece antes que una en curso.
   */
  it("va del ciclo de vida, no alfabético", () => {
    expect(INCIDENT_STATUS_ORDER).toEqual([
      "NUEVA",
      "EN_CURSO",
      "ESPERANDO_TERCERO",
      "RESUELTA",
      "CERRADA",
      "RECHAZADA",
    ]);
  });

  it("cubre exactamente los estados que tienen variante", () => {
    expect([...INCIDENT_STATUS_ORDER].sort()).toEqual(Object.keys(INCIDENT_STATUS_VARIANTS).sort());
  });
});

describe("la matriz de llaves", () => {
  it("tiene un modificador y un glifo por estado", () => {
    expect(Object.keys(KEY_MATRIX_STATE_MODIFIERS).sort()).toEqual(
      Object.keys(KEY_MATRIX_STATE_GLYPHS).sort(),
    );
  });

  /*
   * Cada glifo es distinto, y eso importa más de lo que parece.
   *
   * La matriz es una rejilla donde el color hace casi todo el trabajo; el glifo es la segunda señal, la que lee
   * quien no distingue el verde del rojo. Dos estados con el mismo símbolo dejarían esa rejilla sin alternativa.
   */
  it("ningún glifo se repite", () => {
    const glyphs = Object.values(KEY_MATRIX_STATE_GLYPHS);

    expect(new Set(glyphs).size).toBe(glyphs.length);
  });
});
