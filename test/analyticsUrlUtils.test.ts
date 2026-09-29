import { describe, expect, it } from "vitest";

import {
  REDACTED,
  isAnalyticsExcludedPath,
  sanitizeAnalyticsPathname,
  sanitizeAnalyticsSearch,
  sanitizeAnalyticsUrl,
} from "@/utils/analyticsUrlUtils";

describe("isAnalyticsExcludedPath", () => {
  it.each([
    "/empleo/candidatura/abc123",
    "/en/careers/applications/abc123",
    "/careers/applications/abc123/",
    "/darse-de-baja",
    "/en/unsubscribe",
  ])("excluye %s", (pathname) => {
    expect(isAnalyticsExcludedPath(pathname)).toBe(true);
  });

  it.each(["/", "/empleo", "/empleo/conserje-en-getafe", "/en/careers", "/blog/darse-de-baja-x"])(
    "mide %s",
    (pathname) => {
      expect(isAnalyticsExcludedPath(pathname)).toBe(false);
    },
  );
});

describe("sanitizeAnalyticsPathname", () => {
  it("redacta el token de la candidatura, en los dos idiomas", () => {
    expect(sanitizeAnalyticsPathname("/empleo/candidatura/abc123")).toBe(
      `/empleo/candidatura/${REDACTED}`,
    );
    expect(sanitizeAnalyticsPathname("/en/careers/applications/abc123")).toBe(
      `/en/careers/applications/${REDACTED}`,
    );
  });

  it("no toca las rutas sin token", () => {
    expect(sanitizeAnalyticsPathname("/empleo/conserje-en-getafe")).toBe(
      "/empleo/conserje-en-getafe",
    );
  });
});

describe("sanitizeAnalyticsSearch", () => {
  it("redacta los parámetros sensibles y conserva el resto", () => {
    expect(sanitizeAnalyticsSearch("?token=abc&utm_source=email")).toBe(
      `?token=${REDACTED}&utm_source=email`,
    );
  });

  it("compara el nombre sin distinguir mayúsculas", () => {
    expect(sanitizeAnalyticsSearch("?Token=abc")).toBe(`?Token=${REDACTED}`);
  });

  it("deja igual una query sin nada sensible", () => {
    expect(sanitizeAnalyticsSearch("?utm_source=email")).toBe("?utm_source=email");
    expect(sanitizeAnalyticsSearch("")).toBe("");
  });
});

describe("sanitizeAnalyticsUrl", () => {
  it("redacta la baja por email", () => {
    expect(sanitizeAnalyticsUrl("https://imora.es/darse-de-baja?token=secreto")).toBe(
      `https://imora.es/darse-de-baja?token=${REDACTED}`,
    );
  });

  it("redacta la candidatura y quita el fragmento", () => {
    expect(sanitizeAnalyticsUrl("https://imora.es/empleo/candidatura/secreto#access_token=x")).toBe(
      `https://imora.es/empleo/candidatura/${REDACTED}`,
    );
  });

  it("admite URLs relativas", () => {
    expect(sanitizeAnalyticsUrl("/darse-de-baja?token=secreto")).toBe(
      `/darse-de-baja?token=${REDACTED}`,
    );
  });

  it("una URL normal sale igual", () => {
    expect(sanitizeAnalyticsUrl("https://imora.es/servicios?utm_source=x")).toBe(
      "https://imora.es/servicios?utm_source=x",
    );
  });

  it("devuelve vacío sin URL", () => {
    expect(sanitizeAnalyticsUrl("")).toBe("");
  });

  it("nunca deja el token en ninguna parte del resultado", () => {
    const output = sanitizeAnalyticsUrl(
      "https://imora.es/en/careers/applications/tok-1?token=tok-2&email=a@b.c#tok-3",
    );

    expect(output).not.toMatch(/tok-\d|a@b\.c/);
  });
});
