import { beforeEach, describe, expect, it } from "vitest";

import { COOKIE_CONSENT_STORAGE_KEY, type CookieConsentCategories } from "@/lib/cookieConsent";
import {
  buildGtmBootstrap,
  isValidGtmContainerId,
  pushConsentUpdate,
  pushToDataLayer,
  toGoogleConsentState,
} from "@/lib/gtm";

const NOTHING_ACCEPTED: CookieConsentCategories = {
  analytics: false,
  marketing: false,
  functional: false,
};

beforeEach(() => {
  delete window.dataLayer;
  delete window.gtag;
});

describe("isValidGtmContainerId", () => {
  it("acepta un identificador de contenedor real", () => {
    expect(isValidGtmContainerId("GTM-ABC1234")).toBe(true);
  });

  it("rechaza el hueco de una variable de entorno sin rellenar", () => {
    expect(isValidGtmContainerId("")).toBe(false);
  });

  it("rechaza un identificador de otro producto o con formato inventado", () => {
    expect(isValidGtmContainerId("G-ABC1234")).toBe(false);
    expect(isValidGtmContainerId("GTM-abc1234")).toBe(false);
    expect(isValidGtmContainerId("GTM-ABC'+alert(1)+'")).toBe(false);
  });
});

describe("toGoogleConsentState", () => {
  it("deniega todo lo opcional cuando no se ha aceptado nada", () => {
    expect(toGoogleConsentState(NOTHING_ACCEPTED)).toEqual({
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "granted",
    });
  });

  it("la analítica no arrastra a la publicidad", () => {
    const state = toGoogleConsentState({ ...NOTHING_ACCEPTED, analytics: true });

    expect(state.analytics_storage).toBe("granted");
    expect(state.ad_storage).toBe("denied");
    expect(state.ad_user_data).toBe("denied");
    expect(state.ad_personalization).toBe("denied");
  });

  it("marketing concede las tres señales de publicidad", () => {
    const state = toGoogleConsentState({ ...NOTHING_ACCEPTED, marketing: true });

    expect(state.ad_storage).toBe("granted");
    expect(state.ad_user_data).toBe("granted");
    expect(state.ad_personalization).toBe("granted");
    expect(state.analytics_storage).toBe("denied");
  });

  it("`security_storage` va concedida siempre, no es opcional", () => {
    expect(toGoogleConsentState(NOTHING_ACCEPTED).security_storage).toBe("granted");
  });
});

describe("pushToDataLayer", () => {
  it("crea la capa de datos si todavía no existe", () => {
    pushToDataLayer({ event: "page_view" });

    expect(window.dataLayer).toEqual([{ event: "page_view" }]);
  });

  it("respeta lo que ya hubiera en la capa", () => {
    window.dataLayer = [{ event: "gtm.js" }];

    pushToDataLayer({ event: "page_view" });

    expect(window.dataLayer).toHaveLength(2);
  });
});

describe("pushConsentUpdate", () => {
  it("manda el `consent update` a Google y deja el evento en la capa", () => {
    pushConsentUpdate({ analytics: true, marketing: false, functional: true });

    const [update, event] = window.dataLayer as [IArguments, Record<string, unknown>];

    expect(Array.from(update)).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" }),
    ]);
    expect(event).toMatchObject({ event: "cookie_consent_update" });
  });
});

describe("buildGtmBootstrap", () => {
  const bootstrap = buildGtmBootstrap("GTM-ABC1234");

  it("declara el consentimiento antes de pedir el contenedor", () => {
    expect(bootstrap.indexOf("'consent', 'default'")).toBeLessThan(
      bootstrap.indexOf("googletagmanager.com/gtm.js"),
    );
  });

  it("carga el contenedor indicado", () => {
    expect(bootstrap).toContain('"GTM-ABC1234"');
  });

  it("lee la decisión guardada por el banner, con su misma clave", () => {
    expect(bootstrap).toContain(JSON.stringify(COOKIE_CONSENT_STORAGE_KEY));
  });

  it("parte de denegado para quien todavía no ha decidido", () => {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);

    new Function(bootstrap)();
    const [consentDefault] = window.dataLayer as IArguments[];

    expect(Array.from(consentDefault)).toEqual([
      "consent",
      "default",
      expect.objectContaining({
        analytics_storage: "denied",
        ad_storage: "denied",
        security_storage: "granted",
      }),
    ]);
  });

  it("arranca ya concedido para quien aceptó en una visita anterior", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ analytics: true, marketing: false, functional: false, timestamp: 1 }),
    );

    new Function(bootstrap)();
    const [consentDefault] = window.dataLayer as IArguments[];

    expect(Array.from(consentDefault)).toEqual([
      "consent",
      "default",
      expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" }),
    ]);
  });

  it("no se atraganta con un consentimiento corrupto en el almacenamiento", () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "{no es json");

    expect(() => new Function(bootstrap)()).not.toThrow();

    const [consentDefault] = window.dataLayer as IArguments[];
    expect(Array.from(consentDefault)).toEqual([
      "consent",
      "default",
      expect.objectContaining({ analytics_storage: "denied" }),
    ]);
  });
});
