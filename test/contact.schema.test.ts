import { describe, expect, it } from "vitest";

import { contactSchema } from "@/schemas/contact.schema";

/** Un envío válido mínimo, al que cada caso le quita o le cambia una cosa. */
const valid = {
  contactName: "Diego Peña",
  companyName: "",
  email: "diego@example.com",
  phone: "",
  message: "Quiero información sobre conserjería.",
  privacyNoticeAcknowledged: true,
  marketingConsent: false,
  attributionConsent: false,
  honeypot: "",
  // Cualificación sin contestar: es el caso normal, y tiene que seguir siendo válido.
  contactProfile: "",
  serviceInterest: "",
  zone: "",
  timeframe: "",
  managedPropertiesCount: "",
};

/**
 * Valida y devuelve las claves de error, que es lo que se compara.
 *
 * Se comparan **las claves** y no los textos porque el esquema devuelve claves de `Validations` a propósito: es
 * `Input` quien las traduce. Comparar textos ataría la prueba al fichero de mensajes.
 * @param {Record<string, unknown>} values - Lo que se envía
 * @returns {Promise<string[]>} Las claves de error, ordenadas
 */
async function errorsOf(values: Record<string, unknown>): Promise<string[]> {
  try {
    await contactSchema().validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    return ((error as { errors?: string[] }).errors ?? []).sort();
  }
}

describe("contactSchema", () => {
  it("acepta un envío correcto", async () => {
    await expect(errorsOf(valid)).resolves.toEqual([]);
  });

  it("exige el nombre", async () => {
    await expect(errorsOf({ ...valid, contactName: "" })).resolves.toContain(
      "contact.nameRequired",
    );
  });

  /** Solo espacios es lo mismo que vacío: el `trim` va antes que el `required`. */
  it("un nombre de solo espacios no vale", async () => {
    await expect(errorsOf({ ...valid, contactName: "   " })).resolves.toContain(
      "contact.nameRequired",
    );
  });

  it("exige aceptar el aviso de privacidad", async () => {
    await expect(errorsOf({ ...valid, privacyNoticeAcknowledged: false })).resolves.toContain(
      "contact.privacyRequired",
    );
  });

  it("rechaza un correo con mala pinta", async () => {
    await expect(errorsOf({ ...valid, email: "esto-no-es-un-correo" })).resolves.toContain(
      "contact.emailInvalid",
    );
  });

  /*
   * La regla que de verdad tiene sustancia: **correo o teléfono, pero alguno**.
   *
   * Replica lo que el backend valida en el servicio y no en el DTO. Sin ella el formulario dejaría enviar un
   * contacto por el que no se puede contactar, y el 400 llegaría después de que la persona haya escrito todo.
   */
  it("sin correo y sin teléfono, pide uno de los dos", async () => {
    await expect(errorsOf({ ...valid, email: "", phone: "" })).resolves.toContain(
      "contact.emailOrPhoneRequired",
    );
  });

  it("con teléfono y sin correo vale", async () => {
    await expect(errorsOf({ ...valid, email: "", phone: "600123456" })).resolves.toEqual([]);
  });

  it("con correo y sin teléfono vale", async () => {
    await expect(errorsOf({ ...valid, email: "diego@example.com", phone: "" })).resolves.toEqual([]);
  });

  /*
   * El teléfono no se valida de formato, solo de longitud, y es deliberado.
   *
   * El backend tampoco es más estricto que `Length(1, 16)`; exigir aquí un formato internacional dejaría fuera
   * números que la API sí acepta, que es peor que aceptar uno raro.
   */
  it("no se mete con el formato del teléfono", async () => {
    await expect(errorsOf({ ...valid, email: "", phone: "ext. 42" })).resolves.toEqual([]);
  });

  it.each([
    ["contactName", 256],
    ["email", 321],
    ["phone", 17],
    ["message", 5001],
  ])("%s se queja al pasarse de largo", async (field, length) => {
    const tooLong =
      field === "email" ? `${"a".repeat(length - 12)}@example.com` : "a".repeat(length);

    await expect(errorsOf({ ...valid, [field]: tooLong })).resolves.toContain("contact.maxLength");
  });
});

describe("contactSchema · cualificación", () => {
  it("acepta un envío cualificado por completo", async () => {
    await expect(
      errorsOf({
        ...valid,
        contactProfile: "PROPERTY_MANAGER",
        serviceInterest: "CLEANING",
        zone: "pozuelo-de-alarcon",
        timeframe: "ASAP",
        managedPropertiesCount: "18",
      }),
    ).resolves.toEqual([]);
  });

  it("acepta un envío sin ningún campo de cualificación", async () => {
    // Los cinco son opcionales: se piden para atender mejor, no para dejar preguntar.
    await expect(errorsOf(valid)).resolves.toEqual([]);
  });

  it("rechaza un perfil que no está en la lista", async () => {
    await expect(errorsOf({ ...valid, contactProfile: "LANDLORD" })).resolves.toEqual([
      "contact.invalidOption",
    ]);
  });

  it("rechaza un servicio que no está en la lista", async () => {
    await expect(errorsOf({ ...valid, serviceInterest: "PLUMBING" })).resolves.toEqual([
      "contact.invalidOption",
    ]);
  });

  /*
   * El municipio se valida contra la lista real de zonas, no contra la forma del slug: el desplegable
   * solo ofrece esos 20, y aceptar aquí cualquier slug bien formado dejaría que el envío llegara al
   * backend para que él decidiera — con el error saliendo como «no se ha podido enviar».
   */
  it("rechaza un municipio que no es de la zona de cobertura", async () => {
    await expect(errorsOf({ ...valid, zone: "barcelona" })).resolves.toEqual([
      "contact.invalidOption",
    ]);
  });

  it("acepta los municipios que ofrece la web", async () => {
    await expect(errorsOf({ ...valid, zone: "arganda-del-rey" })).resolves.toEqual([]);
  });

  it("rechaza un plazo que no está en la lista", async () => {
    await expect(errorsOf({ ...valid, timeframe: "NEXT_YEAR" })).resolves.toEqual([
      "contact.invalidOption",
    ]);
  });

  it("rechaza un número de fincas fuera de rango", async () => {
    await expect(
      errorsOf({
        ...valid,
        contactProfile: "PROPERTY_MANAGER",
        managedPropertiesCount: "99999",
      }),
    ).resolves.toEqual(["contact.invalidPropertiesCount"]);
  });

  it("rechaza un número de fincas que no es entero", async () => {
    await expect(
      errorsOf({
        ...valid,
        contactProfile: "PROPERTY_MANAGER",
        managedPropertiesCount: "2,5",
      }),
    ).resolves.toEqual(["contact.invalidPropertiesCount"]);
  });

  /*
   * El caso que motivó el `when`: se elige administrador, se escribe un número, y luego se cambia de
   * perfil. El campo desaparece de la vista pero se queda en Formik con lo último escrito, y sin la
   * condición ese resto bloquearía el envío por un campo que ya no existe en pantalla.
   */
  it("ignora el número de fincas si el perfil ya no es administrador", async () => {
    await expect(
      errorsOf({
        ...valid,
        contactProfile: "INDIVIDUAL",
        managedPropertiesCount: "99999",
      }),
    ).resolves.toEqual([]);
  });
});
