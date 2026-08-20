import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

vi.mock("@/i18n/navigation", () => ({
  getPathname: ({ href }: { href: { pathname: string; params: Record<string, string> } }) =>
    `/empleo/${href.params.slug}`,
}));

const { default: JobPostingJsonLd } = await import("@/components/seo/JobPostingJsonLd");

/**
 * Una oferta con lo justo que el componente lee.
 * @param {Partial<PublicJobDetail>} overrides - Lo que cambia respecto a la base
 * @returns {PublicJobDetail} La oferta
 */
function job(overrides: Partial<PublicJobDetail> = {}): PublicJobDetail {
  return {
    jobCode: "EMP-000001",
    slug: "conserje-en-getafe",
    title: "Conserje en Getafe",
    summary: "Turno de mañana.",
    description: "Descripción del puesto.",
    responsibilities: null,
    requirements: null,
    niceToHave: null,
    benefits: [],
    vacancies: 1,
    metaTitle: null,
    metaDescription: null,
    applyUrl: null,
    employmentType: "FULL_TIME",
    alternateSlugs: {},
    categoryName: "Conserjería",
    categorySlug: "conserjeria",
    contractTypeName: "Indefinido",
    contractTypeSlug: "indefinido",
    scheduleName: "Jornada completa",
    workMode: "ON_SITE",
    experienceLevel: "UP_TO_1",
    locations: [
      {
        name: "Getafe",
        slug: "getafe",
        province: "Madrid",
        region: "Comunidad de Madrid",
        country: "ES",
      },
    ],
    salary: { min: "18000.00", max: "21000.00", currency: "EUR", period: "YEAR" },
    isFeatured: false,
    acceptingApplications: true,
    publishedAt: "2026-08-01T08:00:00.000Z",
    expiresAt: "2026-09-30T08:00:00.000Z",
    ...overrides,
  } as PublicJobDetail;
}

/**
 * Lee el JSON-LD que pinta el componente.
 * @param {PublicJobDetail} value - La oferta a pintar
 * @returns {Record<string, unknown>} El objeto de datos estructurados
 */
function jsonLdOf(value: PublicJobDetail): Record<string, unknown> {
  const { container } = render(<JobPostingJsonLd job={value} locale="es" />);
  const script = container.querySelector('script[type="application/ld+json"]');

  return JSON.parse(script?.innerHTML ?? "{}") as Record<string, unknown>;
}

describe("JobPostingJsonLd", () => {
  it("emite un JobPosting con la referencia y las fechas", () => {
    const jsonLd = jsonLdOf(job());

    expect(jsonLd["@type"]).toBe("JobPosting");
    expect(jsonLd.datePosted).toBe("2026-08-01T08:00:00.000Z");
    expect(jsonLd.validThrough).toBe("2026-09-30T08:00:00.000Z");
    expect(jsonLd.identifier).toMatchObject({ value: "EMP-000001" });
  });

  /**
   * La regla más importante de todo el bloque: un dato estructurado que no coincide con lo que ve el
   * usuario es motivo de penalización, no un detalle. Cuando la oferta no publica el salario, el backend no
   * lo devuelve y aquí no puede aparecer ni aproximado ni a cero.
   */
  it("no incluye baseSalary cuando la oferta no publica el salario", () => {
    const jsonLd = jsonLdOf(job({ salary: null }));

    expect(jsonLd.baseSalary).toBeUndefined();
    expect(JSON.stringify(jsonLd)).not.toContain("MonetaryAmount");
  });

  it("incluye baseSalary con los importes reales cuando sí lo publica", () => {
    const jsonLd = jsonLdOf(job());

    expect(jsonLd.baseSalary).toMatchObject({
      "@type": "MonetaryAmount",
      currency: "EUR",
      value: { minValue: 18000, maxValue: 21000, unitText: "YEAR" },
    });
  });

  /** `directApply` en `true` solo cuando se puede presentar aquí mismo: con candidatura externa sería falso. */
  it("directApply depende de que la candidatura se gestione aquí", () => {
    expect(jsonLdOf(job()).directApply).toBe(true);
    expect(jsonLdOf(job({ applyUrl: "https://otro.example/oferta" })).directApply).toBe(false);
  });

  it("marca el teletrabajo con jobLocationType", () => {
    expect(jsonLdOf(job()).jobLocationType).toBeUndefined();
    expect(jsonLdOf(job({ workMode: "REMOTE" })).jobLocationType).toBe("TELECOMMUTE");
  });
});
