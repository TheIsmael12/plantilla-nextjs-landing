import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Las acciones públicas (contacto, reclamaciones, baja) son endpoints HTTP: se les puede llamar sin pasar por
 * el formulario. Se dobla el transporte para comprobar qué llega de verdad a la API.
 */
const fetchData = vi.fn((..._args: unknown[]) => Promise.resolve({ status: 201 }));

vi.mock("@/actions/fetch", () => ({ fetchData }));

vi.mock("next-intl/server", () => ({
  getTranslations: () => {
    const t = (key: string) => `Validations.${key}`;
    t.has = () => true;
    return Promise.resolve(t);
  },
}));

const { submitContactLead, unsubscribeLead } = await import("@/actions/leads/leads-actions");
const { submitComplaint } = await import("@/actions/complaints/complaints-actions");

/** Cuerpo enviado a la API en la primera llamada. */
const sentBody = () => fetchData.mock.calls[0]?.[2] as Record<string, unknown>;

const lead = {
  contactName: "Diego Peña",
  email: "diego@example.com",
  privacyNoticeVersion: "privacidad-2026-09-25",
  privacyNoticeAcknowledged: true,
  marketingConsent: false,
};

const complaint = {
  type: "ETHICS_COMPLIANCE" as const,
  description: "Descripción suficientemente larga del problema.",
  isAnonymous: true,
  privacyNoticeVersion: "privacidad-2026-09-25",
  privacyNoticeAcknowledged: true,
};

beforeEach(() => {
  fetchData.mockClear();
});

describe("submitContactLead", () => {
  it("reenvía un envío válido", async () => {
    await submitContactLead(lead);

    expect(fetchData).toHaveBeenCalledWith("public/leads", "POST", expect.any(Object));
    expect(sentBody()).toMatchObject({ contactName: "Diego Peña", email: "diego@example.com" });
  });

  it("no llama a la API si no pasa el esquema del formulario", async () => {
    const response = await submitContactLead({ ...lead, privacyNoticeAcknowledged: false });

    expect(fetchData).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(response.errors?.[0]?.field).toBe("privacyNoticeAcknowledged");
  });

  it("no reenvía campos que no espera", async () => {
    await submitContactLead({ ...lead, isAdmin: true, status: "WON" } as typeof lead);

    expect(sentBody()).not.toHaveProperty("isAdmin");
    expect(sentBody()).not.toHaveProperty("status");
  });

  it("sin consentimiento de atribución no manda los UTM", async () => {
    await submitContactLead({ ...lead, attributionConsent: false, utmSource: "google" });

    expect(sentBody()).not.toHaveProperty("utmSource");
  });

  it("con consentimiento sí", async () => {
    await submitContactLead({ ...lead, attributionConsent: true, utmSource: "google" });

    expect(sentBody()).toMatchObject({ utmSource: "google", attributionConsent: true });
  });

  it("el número de fincas solo viaja con perfil de administrador", async () => {
    await submitContactLead({
      ...lead,
      contactProfile: "COMPANY",
      managedPropertiesCount: 12,
    });

    expect(sentBody().managedPropertiesCount).toBeUndefined();
  });
});

describe("submitComplaint", () => {
  it("reenvía una reclamación válida", async () => {
    await submitComplaint(complaint);

    expect(fetchData).toHaveBeenCalledWith("public/complaints", "POST", expect.any(Object));
  });

  it("una anónima no se identifica aunque lleguen nombre y email", async () => {
    await submitComplaint({ ...complaint, contactName: "Ana", contactEmail: "ana@example.com" });

    expect(sentBody().contactName).toBeUndefined();
    expect(sentBody().contactEmail).toBeUndefined();
  });

  it("sin anonimato exige nombre y email", async () => {
    const response = await submitComplaint({ ...complaint, isAnonymous: false });

    expect(fetchData).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
  });

  it("la de calidad de servicio exige comunidad, fecha y servicio", async () => {
    const response = await submitComplaint({ ...complaint, type: "SERVICE_QUALITY" });

    expect(response.status).toBe(400);
    expect(response.errors?.map((error) => error.field)).toEqual(
      expect.arrayContaining(["affectedCommunityName", "serviceDate", "serviceDescription"]),
    );
  });
});

describe("unsubscribeLead", () => {
  it("reenvía un token con forma de token", async () => {
    await unsubscribeLead("abc.DEF_123-x");

    expect(sentBody()).toEqual({ token: "abc.DEF_123-x" });
  });

  it("no reenvía lo que no lo es", async () => {
    await expect(unsubscribeLead("<script>")).resolves.toEqual({ status: 400 });
    await expect(unsubscribeLead({} as unknown as string)).resolves.toEqual({ status: 400 });
    expect(fetchData).not.toHaveBeenCalled();
  });
});
