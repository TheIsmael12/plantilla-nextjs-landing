import { fn } from "storybook/test";

import type { TwoFactorDisablePayload, TwoFactorSetupData } from "@/types/profile/security";

// Mock de Storybook/Vitest para `actions/profile/security-actions.ts`,
// usado en vez del módulo real (ver el alias en `.storybook/main.ts`):
// `mocked()` (de `storybook/test`) solo ajusta el tipo para TypeScript sin
// tocar el valor en tiempo de ejecución, así que las historias necesitan
// que estos exports SEAN ya `fn()` reales (spies de Vitest) para poder
// llamar `mockReset`/`mockResolvedValueOnce`/etc. sobre ellos directamente.

/**
 * Mock de {@link setupTwoFactor}: cada historia decide su resolución con
 * `mockResolvedValueOnce`/`mockReturnValue` antes de renderizar.
 */
export const setupTwoFactor = fn(
  async (): Promise<{ status: number; message?: string; data?: TwoFactorSetupData }> => {
    throw new Error("setupTwoFactor: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("setupTwoFactor");

/**
 * Mock de {@link verifyTwoFactorSetup}: cada historia decide su resolución
 * con `mockResolvedValueOnce`/`mockReturnValue` antes de renderizar.
 */
export const verifyTwoFactorSetup = fn(
  async (_code: string): Promise<{ status: number; message?: string }> => {
    throw new Error("verifyTwoFactorSetup: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("verifyTwoFactorSetup");

/**
 * Mock de {@link disableTwoFactor}: cada historia decide su resolución con
 * `mockResolvedValueOnce`/`mockReturnValue` antes de renderizar.
 */
export const disableTwoFactor = fn(
  async (_values: TwoFactorDisablePayload): Promise<{ status: number; message?: string }> => {
    throw new Error("disableTwoFactor: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("disableTwoFactor");
