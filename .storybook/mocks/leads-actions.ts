import { fn } from "storybook/test";

import type { CreatePublicLeadPayload } from "@/types/leads/leads";
import type { FetchResponse } from "@/types/responses";

// Mock de Storybook/Vitest para `actions/leads/leads-actions.ts`, usado en
// vez del módulo real (ver el alias en `.storybook/main.ts`). `ContactForm`
// no llama a estas acciones directamente (recibe `onSubmit` por props), así
// que este mock solo hace falta si en algún momento se decide dar story a
// `ContactViewPage`/`UnsubscribeViewPage` (hoy sin story, mismo criterio que
// el resto de `*ViewPage` del proyecto).

export const submitContactLead = fn(
  async (_values: CreatePublicLeadPayload): Promise<FetchResponse<null>> => {
    throw new Error("submitContactLead: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("submitContactLead");

export const unsubscribeLead = fn(
  async (_token: string): Promise<FetchResponse<null>> => {
    throw new Error("unsubscribeLead: falta configurar un mockResolvedValueOnce en la historia.");
  },
).mockName("unsubscribeLead");
