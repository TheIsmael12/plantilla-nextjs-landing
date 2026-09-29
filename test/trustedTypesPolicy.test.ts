import { afterEach, describe, expect, it } from "vitest";

import { buildTrustedTypesPolicyScript } from "@/lib/trustedTypesPolicy";

type Rules = {
  createHTML: (value: string) => string | null;
  createScript: (value: string) => string;
  createScriptURL: (value: string) => string | null;
};

/**
 * Ejecuta el script inline con un `trustedTypes` falso y devuelve las reglas que registró.
 * @param {string[]} origins - Orígenes admitidos
 * @returns {Rules} Las reglas de la política `default`
 */
function register(origins: string[]): Rules {
  let registered: Rules | null = null;
  (window as unknown as { trustedTypes: unknown }).trustedTypes = {
    createPolicy: (name: string, rules: Rules) => {
      expect(name).toBe("default");
      registered = rules;
    },
  };

  new Function(buildTrustedTypesPolicyScript(origins))();

  if (!registered) throw new Error("no se registró la política");
  return registered;
}

afterEach(() => {
  delete (window as unknown as { trustedTypes?: unknown }).trustedTypes;
});

describe("política Trusted Types `default`", () => {
  const origins = ["https://challenges.cloudflare.com", "https://*.google-analytics.com"];

  it("deja pasar HTML inocuo (controles de Leaflet, JSON-LD escapado)", () => {
    const { createHTML } = register(origins);

    expect(createHTML('<a href="https://leafletjs.com" title="A JavaScript library">Leaflet</a>')).not.toBeNull();
    expect(createHTML('<span aria-hidden="true">+</span>')).not.toBeNull();
    expect(createHTML('{"@type":"FAQPage","name":"\\u003cb\\u003e"}')).not.toBeNull();
  });

  it.each([
    "<script>alert(1)</script>",
    "<img src=x onerror=alert(1)>",
    '<a href="javascript:alert(1)">x</a>',
    '<iframe srcdoc="x"></iframe>',
    '<object data="data:text/html,x"></object>',
    "<svg/onload=alert(1)>",
  ])("rechaza %s", (html) => {
    expect(register(origins).createHTML(html)).toBeNull();
  });

  it("solo admite URLs de script propias o de los orígenes permitidos", () => {
    const { createScriptURL } = register(origins);

    expect(createScriptURL("/_next/static/chunks/app.js")).not.toBeNull();
    expect(createScriptURL(`${window.location.origin}/x.js`)).not.toBeNull();
    expect(createScriptURL("https://challenges.cloudflare.com/turnstile/v0/api.js")).not.toBeNull();
    expect(createScriptURL("https://region1.google-analytics.com/g.js")).not.toBeNull();

    expect(createScriptURL("https://evil.example/x.js")).toBeNull();
    expect(createScriptURL("https://google-analytics.com.evil.example/x.js")).toBeNull();
    expect(createScriptURL("javascript:alert(1)")).toBeNull();
    expect(createScriptURL("data:text/javascript,alert(1)")).toBeNull();
  });

  it("sin la API de Trusted Types no hace nada", () => {
    expect(() => new Function(buildTrustedTypesPolicyScript(origins))()).not.toThrow();
  });
});
