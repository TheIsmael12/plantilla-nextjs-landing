import { describe, expect, it, vi } from "vitest";

import {
  NOTIFICATION_SEVERITY_VARIANTS,
  isPhrasableNotification,
  resolveNotificationText,
} from "@/utils/notificationFormatUtils";

import type { NotificationResponseDto } from "@/types/client-portal/notifications";

/**
 * Una notificación de la API, a la que cada caso le cambia lo que necesite.
 * @param {Partial<NotificationResponseDto>} overrides - Lo que cambia
 * @returns {NotificationResponseDto} La notificación
 */
function notification(overrides: Partial<NotificationResponseDto> = {}): NotificationResponseDto {
  return {
    id: "notif-1",
    type: "INVOICE_ISSUED",
    severity: "INFO",
    titleOverride: null,
    bodyOverride: null,
    data: {},
    readAt: null,
    createdAt: "2026-03-14T09:30:00.000Z",
    ...overrides,
  } as NotificationResponseDto;
}

describe("isPhrasableNotification", () => {
  it("lo es si el servidor manda el título ya escrito", () => {
    expect(isPhrasableNotification(notification({ titleOverride: "Su factura está lista" }))).toBe(
      true,
    );
  });

  it("lo es si el tipo está entre los que la app sabe redactar", () => {
    expect(isPhrasableNotification(notification({ type: "INVOICE_ISSUED" }))).toBe(true);
    expect(isPhrasableNotification(notification({ type: "QUOTE_SENT" }))).toBe(true);
  });

  /*
   * Un tipo desconocido **no** es redactable, y de eso depende que no se enseñe.
   *
   * El backend tiene decenas de tipos de notificación y el portal solo traduce los cinco que le incumben al
   * cliente. Sin este filtro, en la bandeja aparecerían filas con el código en crudo —«HOURS_POOL_EXHAUSTED»—,
   * que no significan nada para quien las lee.
   */
  it("un tipo que la app no traduce no es redactable", () => {
    expect(isPhrasableNotification(notification({ type: "HOURS_POOL_EXHAUSTED" }))).toBe(false);
  });

  /** Salvo que traiga título propio: entonces sí hay algo legible que enseñar, sea el tipo que sea. */
  it("un tipo desconocido con título propio sí es redactable", () => {
    expect(
      isPhrasableNotification(
        notification({ type: "HOURS_POOL_EXHAUSTED", titleOverride: "Horas agotadas" }),
      ),
    ).toBe(true);
  });
});

describe("resolveNotificationText", () => {
  it("el título del servidor gana a la traducción", () => {
    const translate = vi.fn(() => "no debería usarse");

    const text = resolveNotificationText(
      notification({ titleOverride: "Su factura está lista", bodyOverride: "Ya puede descargarla" }),
      translate,
    );

    expect(text).toEqual({ title: "Su factura está lista", body: "Ya puede descargarla" });
    expect(translate).not.toHaveBeenCalled();
  });

  it("traduce los tipos conocidos con sus valores", () => {
    const translate = vi.fn((key: string) => `traducido:${key}`);

    const text = resolveNotificationText(
      notification({ type: "INVOICE_ISSUED", data: { code: "FAC-1", total: 120.5 } }),
      translate,
    );

    expect(text.title).toBe("traducido:Types.INVOICE_ISSUED.title");
    expect(text.body).toBe("traducido:Types.INVOICE_ISSUED.body");
    expect(translate).toHaveBeenCalledWith("Types.INVOICE_ISSUED.title", {
      code: "FAC-1",
      total: 120.5,
    });
  });

  /*
   * De `data` solo pasan cadenas y números a la interpolación.
   *
   * El campo es un JSON libre del backend y puede traer objetos o arrays; pasárselos a next-intl provoca un error
   * de formato en tiempo de ejecución, así que se filtran. Es la clase de dato que aparece cuando alguien añade
   * un campo nuevo a una notificación del servidor sin avisar al portal.
   */
  it("descarta de data lo que no sea cadena o número", () => {
    const translate = vi.fn((key: string) => key);

    resolveNotificationText(
      notification({
        type: "QUOTE_SENT",
        data: { code: "PRE-1", lines: [1, 2], client: { id: "c1" }, ok: true, nada: null },
      }),
      translate,
    );

    expect(translate).toHaveBeenCalledWith("Types.QUOTE_SENT.title", { code: "PRE-1" });
  });

  /** De un tipo desconocido se devuelve el código tal cual: es feo, pero `isPhrasableNotification` ya lo filtra antes. */
  it("un tipo desconocido devuelve su propio código", () => {
    const text = resolveNotificationText(
      notification({ type: "HOURS_POOL_EXHAUSTED" }),
      (key) => key,
    );

    expect(text.title).toBe("HOURS_POOL_EXHAUSTED");
  });
});

describe("NOTIFICATION_SEVERITY_VARIANTS", () => {
  it("lo crítico se pinta en rojo y lo informativo no", () => {
    expect(NOTIFICATION_SEVERITY_VARIANTS.CRITICAL).toBe("danger");
    expect(NOTIFICATION_SEVERITY_VARIANTS.INFO).toBe("info");
    expect(NOTIFICATION_SEVERITY_VARIANTS.SUCCESS).toBe("success");
    expect(NOTIFICATION_SEVERITY_VARIANTS.WARNING).toBe("warning");
  });
});
