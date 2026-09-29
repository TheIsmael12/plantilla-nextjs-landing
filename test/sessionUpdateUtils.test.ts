import { describe, expect, it } from "vitest";

import type { PortalPreferences } from "@/types/client-portal/preferences";
import { sanitizeSessionUpdate } from "@/utils/sessionUpdateUtils";

/** Preferencias que ya tiene el token antes del `update()`. */
const current: PortalPreferences = {
  language: "es",
  timezone: "Europe/Madrid",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  firstDayOfWeek: "MONDAY",
  theme: "light",
  inAppNotifications: true,
};

describe("sanitizeSessionUpdate", () => {
  it("aplica las preferencias válidas que manda la pantalla de preferencias", () => {
    expect(
      sanitizeSessionUpdate(current, {
        preferences: { ...current, theme: "dark", language: "en", dateFormat: "YYYY-MM-DD" },
      }),
    ).toEqual({
      preferences: { ...current, theme: "dark", language: "en", dateFormat: "YYYY-MM-DD" },
    });
  });

  /*
   * El caso que abría la auditoría: `update()` lo puede llamar cualquier script con el cuerpo que quiera, y
   * con `{ ...token, ...session }` podía reescribir su identidad o su caducidad.
   */
  it("ignora cualquier campo que no sea `preferences`", () => {
    const result = sanitizeSessionUpdate(current, {
      id: "otro-cliente",
      clientCode: "CLI-999999",
      accessTokenExpires: Number.MAX_SAFE_INTEGER,
      backendTokens: { accessToken: "x", refreshToken: "y" },
      preferences: { theme: "dark" },
    });

    expect(result).toEqual({ preferences: { ...current, theme: "dark" } });
    expect(Object.keys(result ?? {})).toEqual(["preferences"]);
  });

  it("descarta los valores fuera de formato y conserva los que había", () => {
    expect(
      sanitizeSessionUpdate(current, {
        preferences: {
          theme: "neon",
          language: "fr",
          timezone: "Marte/Olympus",
          dateFormat: "<script>",
          timeFormat: "36h",
          firstDayOfWeek: "FRIDAY",
          inAppNotifications: "sí",
        },
      }),
    ).toEqual({ preferences: current });
  });

  it("no mete claves desconocidas dentro de las preferencias", () => {
    const result = sanitizeSessionUpdate(current, {
      preferences: { theme: "dark", isAdmin: true },
    });

    expect(result?.preferences).not.toHaveProperty("isAdmin");
  });

  it("devuelve `null` si no llega un objeto de preferencias", () => {
    expect(sanitizeSessionUpdate(current, undefined)).toBeNull();
    expect(sanitizeSessionUpdate(current, "texto")).toBeNull();
    expect(sanitizeSessionUpdate(current, { preferences: ["dark"] })).toBeNull();
    expect(sanitizeSessionUpdate(current, { theme: "dark" })).toBeNull();
  });

  it("sin preferencias previas, solo acepta un objeto completo", () => {
    expect(sanitizeSessionUpdate(null, { preferences: { theme: "dark" } })).toEqual({
      preferences: null,
    });
    expect(sanitizeSessionUpdate(null, { preferences: current })).toEqual({ preferences: current });
  });
});
