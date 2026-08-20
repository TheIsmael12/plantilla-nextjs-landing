import { fn } from "storybook/test";

import type { FetchResponse } from "@/types/responses";

/*
 * Mock de Storybook/Vitest para `actions/careers/careers-actions.ts`, usado en vez del módulo real (ver el
 * alias en `.storybook/main.ts`), igual que `blog-actions.ts` y `leads-actions.ts`.
 *
 * Aquí no es solo que el módulo real llamaría al backend: es que **no se puede ni importar** en el navegador.
 * Arrastra `actions/fetch.ts` → `lib/authOptions` → next-auth → openid-client, que usa `Buffer`, y la
 * historia entera fallaba al cargar con "Buffer is not defined" antes de pintar nada.
 *
 * Cada historia decide qué responde con `mockResolvedValueOnce`: es lo que permite ver a `JobApplySection`
 * pasar de "enviando" a "enviado" —o a error— sin un servidor detrás. El formulario en sí no necesita este
 * doble: recibe ese estado por props (ver `JobApplyForm.stories.tsx`).
 */

export const submitJobApplication = fn(
  async (_payload: JobApplicationPayload): Promise<FetchResponse<null>> => {
    throw new Error(
      "submitJobApplication: falta configurar un mockResolvedValueOnce en la historia.",
    );
  },
).mockName("submitJobApplication");

export const withdrawApplication = fn(
  async (_token: string): Promise<FetchResponse<null>> => {
    throw new Error("withdrawApplication: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("withdrawApplication");

export const getApplicationStatus = fn(
  async (_token: string, _locale: string): Promise<FetchResponse<JobApplicationTracking>> => {
    throw new Error("getApplicationStatus: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getApplicationStatus");

export const getPublicJobs = fn(
  async (): Promise<FetchResponse<{ items: PublicJobListItem[] }>> => {
    throw new Error("getPublicJobs: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getPublicJobs");

export const getPublicJobFilters = fn(
  async (): Promise<FetchResponse<PublicJobFilters>> => {
    throw new Error("getPublicJobFilters: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("getPublicJobFilters");
