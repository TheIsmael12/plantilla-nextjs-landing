import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Se dobla la capa de transporte para quedarse con lo que la acción manda de verdad.
 *
 * Es la parte que antes vivía en el componente montando un `FormData` a mano (ver `requisitos-empleo.md`,
 * 10.10): al bajarla a la acción hay que dejarla cubierta, porque un campo que se olvida aquí es una
 * candidatura que la API rechaza con un 400 y nadie ve hasta producción.
 */
const fetchData = vi.fn(() => Promise.resolve({ status: 201 }));

vi.mock("@/actions/fetch", () => ({ fetchData }));

const { submitJobApplication } = await import("@/actions/careers/careers-actions");

/** Un CV de mentira, del tipo que la API acepta. */
const cv = new File([new Uint8Array(1024)], "cv-lucia.pdf", { type: "application/pdf" });

/** Un envío mínimo válido, al que cada caso le añade o le quita algo. */
const payload: JobApplicationPayload = {
  jobCode: "EMP-000001",
  firstName: "Lucía",
  lastName: "Ferrer Gómez",
  email: "lucia.ferrer@example.com",
  cv,
  privacyNoticeVersion: "2026-01-01",
  privacyNoticeAcknowledged: true,
  talentPoolConsent: false,
};

/**
 * Devuelve el `FormData` con el que se llamó al transporte.
 * @returns {FormData} El cuerpo enviado
 */
function sentFormData(): FormData {
  const [, , body] = fetchData.mock.calls[0] as unknown as [string, string, FormData];
  return body;
}

describe("submitJobApplication", () => {
  beforeEach(() => {
    fetchData.mockClear();
  });

  it("manda el endpoint público por POST", async () => {
    await submitJobApplication(payload);

    expect(fetchData.mock.calls[0][0]).toBe("public/careers/applications");
    expect(fetchData.mock.calls[0][1]).toBe("POST");
  });

  it("lleva los campos obligatorios y el fichero", async () => {
    await submitJobApplication(payload);

    const form = sentFormData();

    expect(form.get("firstName")).toBe("Lucía");
    expect(form.get("lastName")).toBe("Ferrer Gómez");
    expect(form.get("email")).toBe("lucia.ferrer@example.com");
    expect(form.get("privacyNoticeVersion")).toBe("2026-01-01");
    expect(form.get("cv")).toBeInstanceOf(File);
    expect((form.get("cv") as File).name).toBe("cv-lucia.pdf");
  });

  /**
   * Los booleanos van como `"true"`/`"false"` explícitos y no como la presencia del campo: el backend los
   * lee con un parser estricto que solo acepta un sí explícito, y es lo que evita que una casilla sin marcar
   * se convierta en un consentimiento.
   */
  it("manda los consentimientos como true/false explícitos", async () => {
    await submitJobApplication(payload);

    const form = sentFormData();

    expect(form.get("privacyNoticeAcknowledged")).toBe("true");
    expect(form.get("talentPoolConsent")).toBe("false");
  });

  /** Un campo vacío en un `multipart` llega como cadena vacía, y el backend valida lo que recibe. */
  it("omite los opcionales que no tienen valor", async () => {
    await submitJobApplication(payload);

    const form = sentFormData();

    for (const field of ["phone", "citySlug", "coverLetter", "linkedinUrl", "captchaToken", "honeypot"]) {
      expect(form.has(field)).toBe(false);
    }
  });

  it("incluye los opcionales cuando vienen", async () => {
    await submitJobApplication({
      ...payload,
      phone: "600111222",
      citySlug: "getafe",
      coverLetter: "Llevo tres años en portería.",
      linkedinUrl: "https://www.linkedin.com/in/lucia",
      captchaToken: "turnstile-token",
      honeypot: "relleno-por-un-bot",
    });

    const form = sentFormData();

    expect(form.get("phone")).toBe("600111222");
    expect(form.get("citySlug")).toBe("getafe");
    expect(form.get("coverLetter")).toBe("Llevo tres años en portería.");
    expect(form.get("linkedinUrl")).toBe("https://www.linkedin.com/in/lucia");
    expect(form.get("captchaToken")).toBe("turnstile-token");
    expect(form.get("honeypot")).toBe("relleno-por-un-bot");
  });

  /** Sin oferta es una candidatura espontánea, y el campo no debe viajar vacío. */
  it("sin jobCode no manda el campo", async () => {
    await submitJobApplication({ ...payload, jobCode: undefined });

    expect(sentFormData().has("jobCode")).toBe(false);
  });
});
