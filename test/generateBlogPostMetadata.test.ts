import { describe, expect, it } from "vitest";

import { generateBlogPostMetadata } from "@/lib/generateBlogPostMetadata";

import type { BlogPostDetail } from "@/types/blog/blog";

/**
 * Un post con lo justo que la función lee.
 * @param {Partial<BlogPostDetail>} overrides - Lo que cambia respecto a la base
 * @returns {BlogPostDetail} El post
 */
function post(overrides: Partial<BlogPostDetail> = {}): BlogPostDetail {
  return {
    slug: "obras-en-el-portal",
    title: "Obras en el portal",
    excerpt: "Lo que hay que saber antes de que empiecen.",
    seoTitle: null,
    seoDescription: null,
    canonicalUrl: null,
    coverUrl: null,
    ogImageUrl: null,
    noindex: false,
    author: { name: "Carmen Alonso" },
    availableLocales: [{ locale: "es", slug: "obras-en-el-portal" }],
    // `tags` no es opcional: la función hace `post.tags.map(...)` sin guarda, así que sin esto revienta.
    tags: [{ name: "obras" }, { name: "comunidad" }],
    coverImageAlt: null,
    firstPublishedAt: "2026-03-01T09:00:00.000Z",
    publishedAt: "2026-03-02T09:00:00.000Z",
    updatedAt: "2026-03-05T09:00:00.000Z",
    ...overrides,
  } as BlogPostDetail;
}

describe("generateBlogPostMetadata", () => {
  it("compone el título con el nombre de la aplicación", () => {
    const meta = generateBlogPostMetadata(post(), "es");

    expect(meta.title).toContain("Obras en el portal");
    expect(meta.description).toBe("Lo que hay que saber antes de que empiecen.");
  });

  /** Los campos de SEO ganan al título y al extracto visibles, que es para lo que existen. */
  it("el título y la descripción de SEO ganan a los visibles", () => {
    const meta = generateBlogPostMetadata(
      post({ seoTitle: "Obras 2026", seoDescription: "Calendario y accesos" }),
      "es",
    );

    expect(meta.title).toContain("Obras 2026");
    expect(meta.description).toBe("Calendario y accesos");
  });

  it("construye el canonical con el locale y el slug", () => {
    const meta = generateBlogPostMetadata(post(), "es");

    expect(meta.alternates?.canonical).toMatch(/\/es\/blog\/obras-en-el-portal$/);
  });

  /** Un canonical explícito manda: es lo que se usa al republicar contenido de otro sitio. */
  it("respeta el canonical que traiga el post", () => {
    const meta = generateBlogPostMetadata(
      post({ canonicalUrl: "https://otro-sitio.es/articulo" }),
      "es",
    );

    expect(meta.alternates?.canonical).toBe("https://otro-sitio.es/articulo");
  });

  /*
   * Los idiomas alternativos salen de `availableLocales`, **no** de los locales soportados por el sitio.
   *
   * Es la diferencia con las páginas estáticas, y está escrita en el módulo: un post puede existir solo en
   * español. Anunciar un `hreflang` en inglés que devuelve 404 es peor que no anunciarlo.
   */
  it("solo anuncia los idiomas en los que el post existe de verdad", () => {
    const meta = generateBlogPostMetadata(
      post({
        availableLocales: [
          { locale: "es", slug: "obras-en-el-portal" },
          { locale: "en", slug: "building-works" },
        ],
      }),
      "es",
    );

    const languages = meta.alternates?.languages ?? {};

    expect(Object.keys(languages)).toContain("es");
    expect(Object.keys(languages)).toContain("en");
    expect(languages.en).toMatch(/\/en\/blog\/building-works$/);
  });

  it("con un solo idioma, no inventa el otro", () => {
    const languages = generateBlogPostMetadata(post(), "es").alternates?.languages ?? {};

    expect(Object.keys(languages)).not.toContain("en");
  });

  /** `x-default` cae al canonical cuando el idioma por defecto no está entre los disponibles. */
  it("x-default cae al canonical si el post no existe en el idioma por defecto", () => {
    const meta = generateBlogPostMetadata(
      post({ availableLocales: [{ locale: "en", slug: "building-works" }] }),
      "en",
    );

    const languages = (meta.alternates?.languages ?? {}) as Record<string, string>;

    expect(languages["x-default"]).toBe(meta.alternates?.canonical);
  });

  it("marca noindex cuando el post lo pide", () => {
    expect(generateBlogPostMetadata(post({ noindex: true }), "es").robots).toBe("noindex, nofollow");
    expect(generateBlogPostMetadata(post(), "es").robots).toBe("index, follow");
  });

  /*
   * La imagen social se resuelve en cascada y **acaba siendo absoluta**.
   *
   * Las redes sociales descartan una `og:image` relativa sin decir nada: la tarjeta sale sin imagen y no hay
   * forma de saber por qué. Por eso se le antepone el dominio a las rutas propias y se deja tal cual las que ya
   * son absolutas.
   */
  it("la imagen social sale absoluta, venga de donde venga", () => {
    const propia = generateBlogPostMetadata(post({ coverUrl: "/uploads/portada.png" }), "es");
    expect(propia.openGraph?.images).toBeDefined();
    expect(JSON.stringify(propia.openGraph?.images)).toContain("https://");

    const externa = generateBlogPostMetadata(
      post({ ogImageUrl: "https://cdn.example.com/x.png" }),
      "es",
    );
    expect(JSON.stringify(externa.openGraph?.images)).toContain("https://cdn.example.com/x.png");
  });

  it("la imagen de OG del post gana a la portada", () => {
    const meta = generateBlogPostMetadata(
      post({ coverUrl: "/portada.png", ogImageUrl: "https://cdn.example.com/og.png" }),
      "es",
    );

    expect(JSON.stringify(meta.openGraph?.images)).toContain("cdn.example.com/og.png");
  });

  it("el autor del post es el creador de los metadatos", () => {
    const meta = generateBlogPostMetadata(post(), "es");

    expect(meta.creator).toBe("Carmen Alonso");
    expect(meta.authors).toEqual([{ name: "Carmen Alonso" }]);
  });
});
