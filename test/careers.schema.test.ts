import { describe, expect, it } from "vitest";

import { jobApplicationSchema } from "@/schemas/careers.schema";

/** Un PDF de mentira del tamaño que se pida, para las pruebas del campo del CV. */
function pdf(sizeBytes = 1024, type = "application/pdf", name = "cv.pdf"): File {
  return new File([new Uint8Array(sizeBytes)], name, { type });
}

/** Una candidatura válida mínima, a la que cada caso le quita o le cambia una cosa. */
const valid = {
  firstName: "Lucía",
  lastName: "Ferrer Gómez",
  email: "lucia.ferrer@example.com",
  phone: "600111222",
  citySlug: "getafe",
  coverLetter: "Llevo tres años en portería.",
  linkedinUrl: "",
  cv: pdf(),
  privacyNoticeAcknowledged: true,
  talentPoolConsent: false,
  honeypot: "",
};

/**
 * Valida y devuelve las claves de error.
 *
 * Se comparan **las claves** y no los textos, igual que en `contact.schema.test.ts`: el esquema devuelve
 * claves de `Validations` a propósito y es `Input` quien las traduce.
 * @param {Record<string, unknown>} values - Lo que se envía
 * @returns {Promise<string[]>} Las claves de error, ordenadas
 */
async function errorsOf(values: Record<string, unknown>): Promise<string[]> {
  try {
    await jobApplicationSchema().validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    return ((error as { errors?: string[] }).errors ?? []).sort();
  }
}

describe("jobApplicationSchema", () => {
  it("acepta una candidatura completa", async () => {
    await expect(errorsOf(valid)).resolves.toEqual([]);
  });

  /*
   * Las dos comprobaciones del CV son la razón de que el esquema exista: dejar que se suban 20 MB para que
   * el servidor los rechace es gastar la conexión de quien se presenta, que muchas veces está en el móvil.
   */
  it("rechaza un fichero que no es PDF", async () => {
    const values = { ...valid, cv: pdf(1024, "image/png", "cv.png") };

    await expect(errorsOf(values)).resolves.toEqual(["careers.cvType"]);
  });

  it("rechaza un PDF de más de 5 MB", async () => {
    const values = { ...valid, cv: pdf(5 * 1024 * 1024 + 1) };

    await expect(errorsOf(values)).resolves.toEqual(["careers.cvSize"]);
  });

  /** Justo 5 MB entra: el límite es el mismo número que el del backend, no uno más apretado. */
  it("acepta un PDF de exactamente 5 MB", async () => {
    const values = { ...valid, cv: pdf(5 * 1024 * 1024) };

    await expect(errorsOf(values)).resolves.toEqual([]);
  });

  it("el CV es obligatorio", async () => {
    const values = { ...valid, cv: null };

    await expect(errorsOf(values)).resolves.toContain("careers.cvRequired");
  });

  /** Sin la confirmación no se ha informado a nadie de nada, y el backend responde 400. */
  it("exige la confirmación de la información de privacidad", async () => {
    const values = { ...valid, privacyNoticeAcknowledged: false };

    await expect(errorsOf(values)).resolves.toEqual(["careers.privacyRequired"]);
  });

  /**
   * La bolsa de talento **no** es obligatoria en el esquema: solo lo es en la candidatura espontánea, y de
   * eso se encarga la pantalla que no tiene oferta (`JobApplyForm` con `requireTalentPool`).
   */
  it("no exige el consentimiento de la bolsa de talento", async () => {
    await expect(errorsOf({ ...valid, talentPoolConsent: false })).resolves.toEqual([]);
  });

  it("pide nombre, apellidos y un correo válido", async () => {
    const values = { ...valid, firstName: "  ", lastName: "", email: "no-es-un-correo" };

    await expect(errorsOf(values)).resolves.toEqual([
      "careers.emailInvalid",
      "careers.firstNameRequired",
      "careers.lastNameRequired",
    ]);
  });

  /** El LinkedIn es opcional, pero si se pone tiene que ser una URL con protocolo. */
  it("acepta LinkedIn vacío y rechaza una dirección sin protocolo", async () => {
    await expect(errorsOf({ ...valid, linkedinUrl: "" })).resolves.toEqual([]);
    await expect(errorsOf({ ...valid, linkedinUrl: "www.linkedin.com/in/lucia" })).resolves.toEqual([
      "careers.urlInvalid",
    ]);
  });
});
