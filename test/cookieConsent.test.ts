import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_STORAGE_KEY,
  readCookieConsent,
  subscribeToCookieConsent,
  writeCookieConsent,
  type CookieConsentData,
} from "@/lib/cookieConsent";

const ONLY_ANALYTICS: CookieConsentData = {
  analytics: true,
  marketing: false,
  functional: false,
  timestamp: 1_700_000_000_000,
};

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("readCookieConsent", () => {
  it("devuelve `null` mientras el visitante no ha decidido", () => {
    expect(readCookieConsent()).toBeNull();
  });

  it("devuelve `null` —y no revienta— si lo guardado no es válido", () => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, "{no es json");

    expect(readCookieConsent()).toBeNull();
  });

  it("recupera lo guardado", () => {
    writeCookieConsent(ONLY_ANALYTICS);

    expect(readCookieConsent()).toEqual(ONLY_ANALYTICS);
  });
});

describe("writeCookieConsent", () => {
  it("avisa del cambio con las preferencias nuevas", () => {
    const listener = vi.fn();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, listener);

    writeCookieConsent(ONLY_ANALYTICS);

    expect(listener).toHaveBeenCalledOnce();
    expect((listener.mock.calls[0][0] as CustomEvent<CookieConsentData>).detail).toEqual(
      ONLY_ANALYTICS,
    );

    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, listener);
  });

  it("avisa igualmente si el almacenamiento falla: la decisión vale para esta visita", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const listener = vi.fn();
    window.addEventListener(COOKIE_CONSENT_CHANGED_EVENT, listener);

    expect(() => writeCookieConsent(ONLY_ANALYTICS)).not.toThrow();
    expect(listener).toHaveBeenCalledOnce();

    window.removeEventListener(COOKIE_CONSENT_CHANGED_EVENT, listener);
  });
});

describe("subscribeToCookieConsent", () => {
  it("recibe los cambios de esta pestaña", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToCookieConsent(listener);

    writeCookieConsent(ONLY_ANALYTICS);

    expect(listener).toHaveBeenCalledWith(ONLY_ANALYTICS);
    unsubscribe();
  });

  it("recoge lo aceptado en otra pestaña del mismo navegador", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToCookieConsent(listener);

    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(ONLY_ANALYTICS));
    window.dispatchEvent(new StorageEvent("storage", { key: COOKIE_CONSENT_STORAGE_KEY }));

    expect(listener).toHaveBeenCalledWith(ONLY_ANALYTICS);
    unsubscribe();
  });

  it("ignora los cambios de otras claves del almacenamiento", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToCookieConsent(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: "theme" }));

    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("deja de escuchar al darse de baja", () => {
    const listener = vi.fn();
    subscribeToCookieConsent(listener)();

    writeCookieConsent(ONLY_ANALYTICS);

    expect(listener).not.toHaveBeenCalled();
  });
});
