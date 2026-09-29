import { describe, expect, it } from "vitest";

import {
  INVALID_API_PATH,
  apiPath,
  isSafeApiEndpoint,
  isSafePathSegment,
} from "@/utils/apiPathUtils";

describe("isSafePathSegment", () => {
  it.each([
    "3f2b8c1e-9d4a-4f6b-8e2a-1c3d5e7f9a0b",
    "EMP-000001",
    "conserje-en-getafe",
    "guía-de-limpieza",
    "Zm9vYmFy_-x",
    "es",
    42,
  ])("admite %s", (value) => {
    expect(isSafePathSegment(value)).toBe(true);
  });

  it.each([".", "..", "", "a/b", "a?b", "a#b", "a b", "%2e%2e", "a\\b", Number.NaN, null, undefined, {}])(
    "rechaza %s",
    (value) => {
      expect(isSafePathSegment(value)).toBe(false);
    },
  );
});

describe("apiPath", () => {
  it("codifica los valores interpolados", () => {
    const id = "3f2b8c1e-9d4a-4f6b-8e2a-1c3d5e7f9a0b";
    expect(apiPath`client/me/sessions/${id}`).toBe(`client/me/sessions/${id}`);
    expect(apiPath`blog/posts/${"guía"}?locale=${"es"}`).toBe("blog/posts/gu%C3%ADa?locale=es");
  });

  /*
   * El caso de la auditoría: `encodeURIComponent("..")` es `..`, y `client/me/sessions/..` se resuelve como
   * `client/me`. No basta con codificar.
   */
  it("rechaza `.` y `..` aunque se codifiquen", () => {
    expect(apiPath`client/me/sessions/${".."}`).toBe(INVALID_API_PATH);
    expect(apiPath`client/me/sessions/${"."}`).toBe(INVALID_API_PATH);
  });

  it("rechaza un valor con barras o query", () => {
    expect(apiPath`client/me/invoices/${"x/../../admin"}`).toBe(INVALID_API_PATH);
    expect(apiPath`client/me/invoices/${"x?admin=1"}`).toBe(INVALID_API_PATH);
  });

  it("lo que devuelve al rechazar tampoco pasa la red de seguridad, aunque se le concatene una query", () => {
    expect(isSafeApiEndpoint(INVALID_API_PATH)).toBe(false);
    expect(isSafeApiEndpoint(apiPath`client/me/invoices/${".."}` + "?page=2")).toBe(false);
  });
});

describe("isSafeApiEndpoint", () => {
  it.each([
    "client/me",
    "client/me/invoices?page=2&search=a/../b",
    "public/careers/applications/abc.def",
    "blog/posts/gu%C3%ADa?locale=es",
  ])("deja pasar %s", (endpoint) => {
    expect(isSafeApiEndpoint(endpoint)).toBe(true);
  });

  it.each([
    "client/me/sessions/..",
    "client/me/sessions/../admin",
    "client/me/./sessions",
    "client/me/%2e%2e/admin",
    "client/me/%2E%2e",
    "client/me\\..\\admin",
    "/client/me",
    "//evil.example/x",
    "https://evil.example/x",
    "client/%E0%A4%A",
    "",
  ])("rechaza %s", (endpoint) => {
    expect(isSafeApiEndpoint(endpoint)).toBe(false);
  });
});
