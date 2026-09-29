import { describe, expect, it } from "vitest";

import { checkTurnstileConfig, isTurnstileDisabled } from "@/config/turnstile";

describe("checkTurnstileConfig", () => {
  it("con la site key puesta no hay nada que objetar", () => {
    expect(checkTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AAAAAAA" })).toEqual([]);
  });

  /** Fail-closed: sin clave y sin decir que es a propósito, es un olvido y en producción corta el build. */
  it("sin site key avisa", () => {
    expect(checkTurnstileConfig({})).toHaveLength(1);
    expect(checkTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_SITE_KEY: "   " })).toHaveLength(1);
  });

  it("desactivado a propósito, no exige la clave", () => {
    expect(checkTurnstileConfig({ NEXT_PUBLIC_TURNSTILE_DISABLED: "true" })).toEqual([]);
  });
});

describe("isTurnstileDisabled", () => {
  it("solo `true` lo desactiva", () => {
    expect(isTurnstileDisabled("true")).toBe(true);
    expect(isTurnstileDisabled(" TRUE ")).toBe(true);
  });

  it.each([undefined, "", "1", "yes", "false"])("%s lo deja activo", (value) => {
    expect(isTurnstileDisabled(value)).toBe(false);
  });
});
