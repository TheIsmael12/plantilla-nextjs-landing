import { fn } from "storybook/test";

import type { ParsedUserAgent } from "@/utils/userAgentUtils";

// Mock de Storybook/Vitest para `utils/userAgentUtils.ts` (ver el alias en
// `.storybook/main.ts`): el real llama a `parseUserAgent` con el
// `navigator.userAgent` real del navegador de test, que no representa de
// forma fiable ninguna plataforma concreta; las historias necesitan
// controlar su valor de retorno con `mockReturnValue`/`mockReturnValueOnce`.

const DEFAULT_RESULT: ParsedUserAgent = { device: "desktop", browser: undefined, os: undefined };

/**
 * Mock de {@link parseUserAgent}: "desktop" por defecto para no afectar a
 * las historias que no dependen de la plataforma detectada; las historias
 * de plataforma lo sobrescriben con `mockReturnValueOnce`.
 */
export const parseUserAgent = fn((_userAgent?: string): ParsedUserAgent => DEFAULT_RESULT).mockName(
  "parseUserAgent",
);
