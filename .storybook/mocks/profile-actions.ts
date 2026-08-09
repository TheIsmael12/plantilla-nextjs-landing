import { fn } from "storybook/test";

import type { PortalClientMeResponseData } from "@/types/client-portal/profile";

// Mock de Storybook/Vitest para `actions/client-portal/profile-actions.ts`,
// usado en vez del módulo real (ver el alias en `.storybook/main.ts`).

export const getClientProfile = fn(
  async (): Promise<{ status: number; message?: string; data?: PortalClientMeResponseData }> => {
    throw new Error("getClientProfile: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getClientProfile");

export const getClientTwoFactorStatus = fn(
  async (): Promise<{ status: number; message?: string; data?: { enabled: boolean } }> => {
    throw new Error("getClientTwoFactorStatus: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getClientTwoFactorStatus");

export const regenerateClientTwoFactorRecoveryCodes = fn(
  async (): Promise<{ status: number; message?: string; data?: { recoveryCodes: string[] } }> => {
    throw new Error(
      "regenerateClientTwoFactorRecoveryCodes: falta configurar un mockResolvedValueOnce en la historia.",
    );
  },
).mockName("regenerateClientTwoFactorRecoveryCodes");
