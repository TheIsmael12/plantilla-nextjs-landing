import { describe, expect, it, vi } from "vitest";

/*
 * Se dobla `@/i18n/navigation` por el mismo motivo que en `routingUtils.test.ts`: next-intl no puede
 * resolver `next/navigation` desde su propia carpeta en el árbol de pnpm.
 *
 * El doble resuelve la ruta con el catálogo real (`config/pathnames.ts`) y aplica la regla de prefijo de
 * verdad (`localePrefix: "as-needed"`), que es lo que hace que la comprobación del canónico valga algo: lo
 * que se quiere ver es que apunta a `/empleo/ciudades/getafe` y no a `/careers/cities/getafe`.
 */
vi.mock("@/i18n/navigation", async () => {
  const { pathnames } = await import("@/config/pathnames");
  const { DEFAULT_LOCALE } = await import("@/config/locales");

  return {
    getPathname: ({
      href,
      locale,
    }: {
      href: string | { pathname: string; params?: Record<string, string> };
      locale: string;
    }) => {
      const key = typeof href === "string" ? href : href.pathname;
      const params = typeof href === "string" ? {} : (href.params ?? {});

      const entry = (pathnames as Record<string, string | Record<string, string>>)[key];
      const template = typeof entry === "string" ? entry : entry[locale];

      const localized = Object.entries(params).reduce<string>(
        (acc, [param, value]) => acc.replace(`[${param}]`, value),
        template,
      );

      return locale === DEFAULT_LOCALE ? localized : `/${locale}${localized}`;
    },
  };
});

const { generateMetadata: careersMetadata } = await import("@/app/[locale]/(public)/careers/page");

/**
 * Llama al `generateMetadata` del buscador con unos filtros dados.
 * @param {Record<string, string | string[]>} searchParams - Query de la URL
 * @returns {Promise<Metadata>} Los metadatos generados
 */
function metadataFor(searchParams: Record<string, string | string[]>) {
  return careersMetadata({
    params: Promise.resolve({ locale: "es" }),
    searchParams: Promise.resolve(searchParams),
  });
}

/**
 * El buscador con filtros es la fuente clásica de contenido duplicado: cada combinación de la query es una
 * URL distinta con el mismo contenido. Estas dos reglas son las que lo evitan.
 */
describe("metadatos del buscador de empleo", () => {
  /** Sin filtros manda el layout: el objeto vacío es justamente lo que deja el `index, follow` de la ruta. */
  it("sin filtros no toca nada", async () => {
    await expect(metadataFor({})).resolves.toEqual({});
  });

  it("con filtros va noindex, follow", async () => {
    const meta = await metadataFor({ workMode: "REMOTE" });

    expect(meta.robots).toBe("noindex, follow");
  });

  /** `follow` y no `nofollow`: las ofertas enlazadas desde la página filtrada sí se tienen que rastrear. */
  it("el noindex de los filtros deja seguir los enlaces", async () => {
    const meta = await metadataFor({ page: "2" });

    expect(meta.robots).toContain("follow");
    expect(meta.robots).not.toContain("nofollow");
  });

  /**
   * El caso que de verdad importa: filtrar por una ciudad es lo mismo que la página de ciudad, que es la
   * indexable y la que tiene contenido propio. El canónico tiene que llevar allí.
   */
  it("filtrando solo por ciudad, el canónico apunta a la página de ciudad", async () => {
    const meta = await metadataFor({ citySlug: "getafe" });

    expect(meta.alternates?.canonical).toContain("/empleo/ciudades/getafe");
  });

  /**
   * Con otro filtro encima ya no es el mismo contenido que la página de ciudad, así que apuntar el canónico
   * allí sería declarar duplicado algo que no lo es: se vuelve al buscador sin filtros.
   */
  it("con ciudad y otro filtro, el canónico vuelve al buscador", async () => {
    const meta = await metadataFor({ citySlug: "getafe", experience: "OVER_5" });

    expect(meta.alternates?.canonical).toMatch(/\/empleo$/);
  });

  /** Varias ciudades a la vez no son ninguna página de ciudad concreta. */
  it("con varias ciudades, el canónico vuelve al buscador", async () => {
    const meta = await metadataFor({ citySlug: ["getafe", "madrid"] });

    expect(meta.alternates?.canonical).toMatch(/\/empleo$/);
  });
});
