import { describe, expect, it } from "vitest";

import { createIncidentCommentSchema, createIncidentSchema } from "@/schemas/incident.schema";

import type { Schema } from "yup";

/**
 * Valida y devuelve las claves de error.
 *
 * El esquema entra como `Schema` de Yup —el tipo base— y no como una forma escrita a mano: los dos esquemas de este
 * fichero devuelven objetos distintos, y describir su firma «a ojo» hacía que `tsc` los rechazara por la varianza
 * del parámetro de opciones.
 * @param {Schema} schema - El esquema a usar
 * @param {Record<string, unknown>} values - Lo que se envía
 * @returns {Promise<string[]>} Las claves de error, ordenadas
 */
async function errorsOf(schema: Schema, values: Record<string, unknown>): Promise<string[]> {
  try {
    await schema.validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    return ((error as { errors?: string[] }).errors ?? []).sort();
  }
}

const validIncident = {
  title: "El ascensor se queda parado entre plantas",
  description: "Pasa desde el lunes, sobre todo al subir del garaje.",
  type: "AVERIA",
  priority: "",
  clientServiceId: "",
};

/*
 * Los topes replican los del `PortalCreateIncidentDto` del backend a propósito, así que las pruebas comprueban
 * **las fronteras exactas**: son el punto donde el navegador y la API pueden dejar de estar de acuerdo, y donde un
 * envío se rechazaría con un 400 después de que alguien haya escrito cinco mil caracteres.
 */
describe("createIncidentSchema", () => {
  it("acepta una incidencia correcta", async () => {
    await expect(errorsOf(createIncidentSchema(), validIncident)).resolves.toEqual([]);
  });

  it.each([
    ["title", "incident.titleRequired"],
    ["description", "incident.descriptionRequired"],
    ["type", "incident.typeRequired"],
  ])("exige %s", async (field, key) => {
    await expect(
      errorsOf(createIncidentSchema(), { ...validIncident, [field]: "" }),
    ).resolves.toContain(key);
  });

  it("un título de solo espacios no vale", async () => {
    await expect(
      errorsOf(createIncidentSchema(), { ...validIncident, title: "    " }),
    ).resolves.toContain("incident.titleRequired");
  });

  it("el título admite 255 y se queja con 256", async () => {
    await expect(
      errorsOf(createIncidentSchema(), { ...validIncident, title: "a".repeat(255) }),
    ).resolves.toEqual([]);

    await expect(
      errorsOf(createIncidentSchema(), { ...validIncident, title: "a".repeat(256) }),
    ).resolves.toContain("incident.titleMaxLength");
  });

  it("la descripción admite 5000 y se queja con 5001", async () => {
    await expect(
      errorsOf(createIncidentSchema(), { ...validIncident, description: "a".repeat(5000) }),
    ).resolves.toEqual([]);

    await expect(
      errorsOf(createIncidentSchema(), { ...validIncident, description: "a".repeat(5001) }),
    ).resolves.toContain("incident.descriptionMaxLength");
  });

  /** La prioridad la fija el backend, así que aquí es opcional: el vecino no la elige. */
  it("la prioridad y el servicio son opcionales", async () => {
    const { priority: _p, clientServiceId: _c, ...sinOpcionales } = validIncident;

    await expect(errorsOf(createIncidentSchema(), sinOpcionales)).resolves.toEqual([]);
  });
});

describe("createIncidentCommentSchema", () => {
  it("acepta un comentario normal", async () => {
    await expect(
      errorsOf(createIncidentCommentSchema(), { body: "Sigue igual esta mañana." }),
    ).resolves.toEqual([]);
  });

  it.each(["", "   "])("un comentario vacío (%j) no vale", async (body) => {
    await expect(errorsOf(createIncidentCommentSchema(), { body })).resolves.toContain(
      "incident.commentRequired",
    );
  });

  it("admite 5000 y se queja con 5001", async () => {
    await expect(
      errorsOf(createIncidentCommentSchema(), { body: "a".repeat(5000) }),
    ).resolves.toEqual([]);

    await expect(
      errorsOf(createIncidentCommentSchema(), { body: "a".repeat(5001) }),
    ).resolves.toContain("incident.commentMaxLength");
  });
});
