import { describe, expect, it, vi } from "vitest";

/*
 * Se dobla `@/i18n/navigation` por el mismo motivo que en `routingUtils.test.ts`: ese módulo crea la
 * navegación de next-intl con `createNavigation`, que importa `next/navigation`, y en el árbol de pnpm
 * next-intl no puede resolver ese import desde su propia carpeta.
 *
 * El doble resuelve la ruta leyendo **el mismo catálogo** que la aplicación (`config/pathnames.ts`) y añade
 * el prefijo de idioma con la regla real (`localePrefix: "as-needed"`: el idioma por defecto va sin
 * prefijo). Es justo lo que hace falta para comprobar lo nuestro —que el canónico y los `hreflang` usan la
 * ruta traducida y el slug de cada idioma— sin probar la librería.
 */
vi.mock("@/i18n/navigation", async () => {
  const { pathnames } = await import("@/config/pathnames");
  const { DEFAULT_LOCALE } = await import("@/config/locales");

  return {
    // Mismo contrato que el `getPathname` real: la ruta canónica y sus `params` llegan por separado, que es
    // justo lo que permite traducir el segmento estático antes de sustituir el slug.
    getPathname: ({
      href,
      locale,
    }: {
      href: { pathname: string; params: Record<string, string> };
      locale: string;
    }) => {
      const entry = (pathnames as Record<string, string | Record<string, string>>)[href.pathname];
      const template = typeof entry === "string" ? entry : entry[locale];

      const localized = Object.entries(href.params).reduce<string>(
        (acc, [key, value]) => acc.replace(`[${key}]`, value),
        template,
      );

      return locale === DEFAULT_LOCALE ? localized : `/${locale}${localized}`;
    },
  };
});

const { generateJobPostingMetadata } = await import("@/lib/generateJobPostingMetadata");

/**
 * Una oferta con lo justo que la función lee.
 * @param {Partial<PublicJobDetail>} overrides - Lo que cambia respecto a la base
 * @returns {PublicJobDetail} La oferta
 */
function job(overrides: Partial<PublicJobDetail> = {}): PublicJobDetail {
  return {
    jobCode: "EMP-000001",
    slug: "conserje-en-getafe",
    title: "Conserje en Getafe",
    summary: "Turno de mañana en una comunidad de 120 viviendas.",
    metaTitle: null,
    metaDescription: null,
    alternateSlugs: {},
    publishedAt: "2026-08-01T08:00:00.000Z",
    expiresAt: "2026-09-30T08:00:00.000Z",
    locations: [],
    benefits: [],
    vacancies: 1,
    description: "Descripción del puesto.",
    employmentType: "FULL_TIME",
    categoryName: "Conserjería",
    categorySlug: "conserjeria",
    contractTypeName: "Indefinido",
    contractTypeSlug: "indefinido",
    scheduleName: "Jornada completa",
    workMode: "ON_SITE",
    experienceLevel: "UP_TO_1",
    isFeatured: false,
    acceptingApplications: true,
    ...overrides,
  } as PublicJobDetail;
}

describe("generateJobPostingMetadata", () => {
  it("compone el título con el nombre de la aplicación", () => {
    const meta = generateJobPostingMetadata(job(), "es");

    expect(meta.title).toContain("Conserje en Getafe");
    expect(meta.description).toBe("Turno de mañana en una comunidad de 120 viviendas.");
  });

  /** Los campos de SEO ganan al título y al resumen visibles, que es para lo que existen. */
  it("el título y la descripción de SEO ganan a los visibles", () => {
    const meta = generateJobPostingMetadata(
      job({ metaTitle: "Trabajo de conserje en Getafe", metaDescription: "Incorporación inmediata." }),
      "es",
    );

    expect(meta.title).toContain("Trabajo de conserje en Getafe");
    expect(meta.description).toBe("Incorporación inmediata.");
  });

  /**
   * El canónico tiene que llevar la ruta **traducida**: el idioma por defecto va sin prefijo y con
   * `/empleo`, no con `/careers`.
   */
  it("el canónico usa la ruta localizada del idioma", () => {
    const meta = generateJobPostingMetadata(job(), "es");

    expect(meta.alternates?.canonical).toContain("/empleo/conserje-en-getafe");
  });

  /**
   * Es la razón de existir de `alternateSlugs`: en inglés cambian **la ruta y el slug** a la vez, así que
   * construir la URL a mano daría un 404.
   */
  it("cruza los idiomas con el slug de cada traducción", () => {
    const meta = generateJobPostingMetadata(
      job({ alternateSlugs: { en: "concierge-in-getafe" } }),
      "es",
    );

    const languages = meta.alternates?.languages as Record<string, string>;

    expect(languages.es).toContain("/empleo/conserje-en-getafe");
    expect(languages.en).toContain("/en/careers/concierge-in-getafe");
  });

  /** Un idioma sin traducción publicada no se declara: es preferible callarse a apuntar a un 404. */
  it("no declara un idioma que no tiene traducción", () => {
    const meta = generateJobPostingMetadata(job(), "es");

    const languages = meta.alternates?.languages as Record<string, string>;

    expect(languages.en).toBeUndefined();
    expect(languages["x-default"]).toContain("/empleo/conserje-en-getafe");
  });

  /** La caducidad viaja en el OpenGraph, igual que en el `validThrough` de los datos estructurados. */
  it("publica la fecha de caducidad de la oferta", () => {
    const meta = generateJobPostingMetadata(job(), "es");

    expect(meta.openGraph).toMatchObject({
      type: "article",
      expirationTime: "2026-09-30T08:00:00.000Z",
    });
  });
});
