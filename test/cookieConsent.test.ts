import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  COOKIE_CONSENT_CHANGED_EVENT,
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_STORAGE_KEY,
  getCookieConsentSnapshot,
  getServerCookieConsentSnapshot,
  readCookieConsent,
  subscribeToCookieConsent,
  writeCookieConsent,
  type CookieConsentData,
} from "@/lib/cookieConsent";

/*
 * La marca de tiempo es «ahora» y no una constante fija porque la decisión **caduca** a los 24
 * meses (`COOKIE_CONSENT_MAX_AGE_MS`). Con una fecha escrita a mano, estas pruebas se rompen solas
 * el día en que esa fecha queda fuera del plazo, y el fallo parece un fallo del código en vez de lo
 * que sería: una decisión vieja tratada como vieja, que es justo lo correcto.
 */
const ONLY_ANALYTICS: CookieConsentData = {
  analytics: true,
  functional: false,
  timestamp: Date.now(),
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

  /*
   * La guía de cookies de la AEPD pide renovar el consentimiento como mucho cada 24 meses, y la
   * política de cookies publica ese plazo. Una decisión más vieja se trata como si no existiera:
   * vuelve a salir el banner y, mientras tanto, no se activa nada opcional.
   */
  it("da por caducada una decisión de hace más de 24 meses", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ ...ONLY_ANALYTICS, timestamp: Date.now() - COOKIE_CONSENT_MAX_AGE_MS - 1 }),
    );

    expect(readCookieConsent()).toBeNull();
  });

  it("mantiene una decisión que aún está dentro del plazo", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ ...ONLY_ANALYTICS, timestamp: Date.now() - COOKIE_CONSENT_MAX_AGE_MS + 1000 }),
    );

    expect(readCookieConsent()).not.toBeNull();
  });

  /** Lo guardado por una versión anterior no llevaba marca de tiempo: sin ella no se puede saber si sigue valiendo. */
  it("da por caducada una decisión sin marca de tiempo", () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({ analytics: true, functional: true }),
    );

    expect(readCookieConsent()).toBeNull();
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

/*
 * El snapshot es lo que consume `useSyncExternalStore` en `useCookieConsent`, y ese hook compara la
 * **referencia** para decidir si repinta. Si cambiara en cada lectura, React entraría en bucle y
 * cortaría con «The result of getSnapshot should be cached»; si no cambiara al guardar, el mapa se
 * quedaría con el consentimiento viejo. Las dos mitades se comprueban aquí.
 */
describe("getCookieConsentSnapshot", () => {
  it("devuelve la misma referencia mientras no cambia nada", () => {
    writeCookieConsent(ONLY_ANALYTICS);

    expect(getCookieConsentSnapshot()).toBe(getCookieConsentSnapshot());
  });

  it("cambia de referencia cuando se guarda una decisión nueva", () => {
    writeCookieConsent(ONLY_ANALYTICS);
    const antes = getCookieConsentSnapshot();

    writeCookieConsent({ ...ONLY_ANALYTICS, analytics: false });

    expect(getCookieConsentSnapshot()).not.toBe(antes);
    expect(getCookieConsentSnapshot()?.analytics).toBe(false);
  });

  /*
   * El `catch` de `writeCookieConsent` existe para que la decisión valga en esta visita aunque no
   * se pueda persistir (modo privado, cuota). Si el snapshot releyera el almacenamiento, devolvería
   * lo de antes y esa promesa se rompería justo donde importa.
   */
  it("refleja la decisión aunque el almacenamiento falle", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("sin cuota");
    });

    writeCookieConsent(ONLY_ANALYTICS);

    expect(getCookieConsentSnapshot()).toEqual(ONLY_ANALYTICS);
  });

  it("recoge lo aceptado en otra pestaña", () => {
    writeCookieConsent(ONLY_ANALYTICS);
    const dejarDeEscuchar = subscribeToCookieConsent(() => {});

    const enLaOtra: CookieConsentData = { ...ONLY_ANALYTICS, functional: true };
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(enLaOtra));
    window.dispatchEvent(
      new StorageEvent("storage", { key: COOKIE_CONSENT_STORAGE_KEY }),
    );

    expect(getCookieConsentSnapshot()).toEqual(enLaOtra);
    dejarDeEscuchar();
  });

  /** En el servidor no hay decisión: es lo que evita el desajuste de hidratación. */
  it("desde el servidor no hay decisión", () => {
    expect(getServerCookieConsentSnapshot()).toBeNull();
  });
});
