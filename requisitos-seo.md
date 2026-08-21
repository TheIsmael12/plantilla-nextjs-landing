# Estrategia SEO — Imora (Comunidad de Madrid)

> Roadmap para posicionar imora.es y captar clientes (comunidades de propietarios,
> administradores de fincas, empresas) en la Comunidad de Madrid. Basado en una auditoría
> externa (ChatGPT, crawling de imora.es) contrastada contra el estado real del código el
> 2026-08-15. Donde el análisis externo asumía que algo no existía y sí existe, se corrige
> aquí explícitamente — repetir trabajo ya hecho es peor que no documentarlo.

## 0. Estado real vs. auditoría externa

La auditoría se hizo por crawling (no vio el código), así que acierta en todo lo que es
**contenido** (falta bloque a bloque) pero se equivoca en varios puntos **técnicos** que ya
están resueltos:

| Lo que decía la auditoría | Estado real |
|---|---|
| "No pude verificar sitemap.xml/robots.txt" | Existen y funcionan: [sitemap.ts](src/app/sitemap.ts) genera entradas por ruta+locale con `hreflang` cruzado, más una entrada por post de blog leída del backend. [robots.ts](src/app/robots.ts) existe. |
| "Implementaría Schema Organization/LocalBusiness" | Ya existe: [OrganizationJsonLd.tsx](src/components/seo/OrganizationJsonLd.tsx), tipo `LocalBusiness`, con `address`, `geo`, `areaServed`, `openingHoursSpecification`, y `makesOffer` (un `Offer`/`Service` por cada servicio real, enlazando a su URL). Se renderiza en todas las páginas públicas vía `[locale]/layout.tsx`. |
| "Necesitáis páginas específicas por servicio" | Ya existen las 6: `/servicios/conserjeria`, `/limpieza`, `/mantenimiento`, `/jardineria`, `/piscinas`, `/seguridad` (ver `src/app/[locale]/(public)/services/`), cada una con su propio slug traducido en `config/pathnames.ts`. |
| "Título SEO de la home puede ser mejor" | Hay que revisarlo contra el texto real, no asumir — ver §3. |

Lo que la auditoría identifica bien y **sí es un problema real, verificado en el código**:

- **El blog está vacío o casi vacío.** No hay artículos publicados en cantidad.
- **Solo 3 zonas de cobertura declaradas**: Madrid capital, Pozuelo de Alarcón, Alcorcón
  (`src/i18n/locales/es/views.json`, clave `zones`). No hay páginas de zona. **Resuelto**: existen
  las 20 páginas de zona (§4/§21), y la FAQ de cobertura que aún citaba solo estas 3 se actualizó
  en §31.
- **Datos de contacto con fallback ficticio en el código**: `COMPANY_ADDRESS` cae a
  `"Calle Ejemplo, 123"` y `COMPANY_EMERGENCY_PHONE` a `"+34 900 123 456"` si las variables
  de entorno reales no están puestas (`src/config/env.ts`). Si el `.env` de producción en
  Vercel no las sobreescribe, esos placeholders se indexan tal cual.
- **No hay páginas dirigidas a administradores de fincas** como segmento propio (solo se habla
  de "comunidades" y "empresas" de forma genérica).
- **Certificaciones ISO mencionadas en la web sin ser reales todavía** (confirmado con el
  cliente, 2026-08-15) — ver §8, es bloqueante.

## 1. Bloqueantes — antes de publicar nada nuevo

Estos tres puntos son requisito previo a cualquier otra fase: publicar contenido nuevo
mientras la empresa muestra datos falsos es peor que no publicarlo (Google penaliza
inconsistencias NAP — Name/Address/Phone — entre la web y Google Business Profile).

- [ ] **TODO — Dirección real de la empresa.** Sustituir el fallback de `COMPANY_ADDRESS`/
      `COMPANY_POSTAL_CODE`/`COMPANY_CITY`/`COMPANY_STATE`/`COMPANY_LATITUDE`/
      `COMPANY_LONGITUDE` en el `.env` de producción (Vercel). Sin esto, `LocalBusiness`
      schema y Google Business Profile no pueden coincidir (requisito de SEO local).
- [ ] **TODO — Teléfono(s) reales.** Sustituir `COMPANY_PHONE` y, si aplica de verdad,
      `COMPANY_EMERGENCY_PHONE`. Si no hay línea de urgencias 24h real, quitar esa mención de
      la web en vez de dejar un teléfono inventado.
- [x] **Certificaciones ISO — confirmado placeholder puro (no en trámite), quitadas
      (2026-08-16).** Sacado el bloque de `TrustBarSection.tsx` (home) y toda la sección
      `AboutCertifications` de `/sobre-nosotros` (`AboutViewPage.tsx` ya no la importa). El
      componente y sus traducciones (`About.certifications`, `Home.trustBar.items.certifications`)
      se dejan sin borrar para reactivarlo cuando la empresa obtenga certificaciones reales —
      solo hay que volver a añadir `<AboutCertifications />`/el bloque de certs en
      `TrustBarSection.tsx` y quitar la clase `--stats-only` del grid. No crear la página
      `/certificaciones/` del §9 hasta entonces.
- [ ] **TODO — Código real de verificación de Google Search Console.** El código (§18,
      auditoría #6) ya está conectado y funcional — falta poner el valor real en
      `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` del `.env` de producción (Vercel). Sin esto no se
      puede verificar la propiedad en Search Console ni confirmar cómo indexa Google el resto
      del trabajo de este documento.

## 2. Keyword map (obligatorio antes de crear páginas o artículos)

La auditoría lo señala como el primer paso, y tiene razón: sin esto, cada página nueva
compite por las mismas búsquedas que otra ya existente (canibalización) y no hay forma de
saber qué URL debería ganar.

**[keyword-map.md](keyword-map.md)** — construido a partir del contenido real ya publicado
en cada página de servicio (`Services.items` en `src/i18n/locales/es/views.json`), no de
keywords genéricas inventadas. Cubre:

- Los 6 servicios ya existentes: keyword principal/secundarias por página, con nota de qué
  intenciones ya están cubiertas por el copy/FAQ actual y cuáles son candidatas a un FAQ nuevo.
- 15 artículos de blog candidatos, mapeados a su servicio de enlazado interno (base del lote
  inicial de 20-30 del §7 — **pendiente completar hasta ese número** antes de redactar nada).
- El patrón de keyword para zonas (servicio × municipio), sin generar la tabla completa hasta
  que el TODO de municipios reales del §4 esté resuelto.

**Antes de escribir un solo artículo o página nueva**, esa keyword debe tener su fila en
`keyword-map.md` con intención, URL destino y enlazado interno decididos — es la regla de
esta fase, sin excepción.

## 3. SEO on-page de lo que ya existe

Antes de crear páginas nuevas, revisar y corregir lo ya publicado:

- [x] **H1/title de la home decididos y aplicados** (auditoría SEO externa, §14/§21):
      `Home.hero.title` = "Servicios integrales para comunidades, empresas y edificios en
      Madrid" (coincide con lo propuesto), `Metadata.routes["/"].title` = "Servicios
      integrales para comunidades en Madrid" (el sufijo `| Imora` lo añade la plantilla
      global de metadata, no el texto de cada ruta).
- [x] **`alt` de imágenes: verificado, no hay el problema que señalaba la auditoría.**
      `ServiceDetailHero.tsx`/`ServicesGrid.tsx` usan `alt={itemT('title')}` (el título real
      de cada servicio: "Conserjería y control de accesos", "Seguridad y CCTV"...), no una
      frase genérica repetida entre servicios distintos — la única repetición real es la
      misma foto en dos sitios del sitio (hero + grid), que es correcta. Los `alt` de
      subservicios (`ServiceDetailSubservices.tsx`) ya son específicos:
      `"{subservicio} — {servicio}"`. No se necesitó ningún cambio.
- [x] **FAQ ampliado a 8 preguntas por servicio** (de 4). Las 4 nuevas de cada servicio
      derivan del contenido ya publicado (subservicios, descripciones) y de las keywords que
      `keyword-map.md` §1 marcaba como «candidata a añadir FAQ» (precio, cambio de empresa).
      `FAQPage` schema ya existía ([ServiceDetailFaq.tsx](src/components/ui/services/ServiceDetailFaq.tsx))
      y recoge automáticamente las preguntas nuevas — verificado con build de producción real
      (8 preguntas visibles, 8 en el schema).
- [x] **`BreadcrumbList` schema: implementado** (ver §12).

## 4. SEO local — arquitectura de zonas

**[x] Confirmado por la empresa (2026-08-15): los 20 municipios de la tabla de niveles son
cobertura real, no propuesta** — implementadas las 20 páginas de zona.

**Implementación**: 20 rutas estáticas `/zonas/[municipio]` (clave canónica
`/zones/[municipio]`, `config/pathnames.ts`) — no una ruta dinámica `[city]`, mismo criterio
que los servicios: `generateMetadata.ts`/`BreadcrumbJsonLd.tsx` excluyen explícitamente
cualquier pathname con `[`, y el nombre del municipio no se traduce entre idiomas (es un
topónimo). Catálogo de datos en [config/zones.ts](src/config/zones.ts) (corona metropolitana,
distancia a Madrid, coordenadas — todo dato público de geografía, no de la actividad de Imora).

Cada página de zona lleva, para evitar ser "la misma plantilla con el nombre cambiado":

- **Contexto geográfico real** por municipio (corona, distancia, perfil de vivienda
  predominante), redactado a mano — no relleno genérico. [ZoneContext.tsx](src/components/ui/zones/ZoneContext.tsx)
- **Los 6 servicios enlazados** con anchor text local ("Conserjería en Alcobendas").
  [ZoneServices.tsx](src/components/ui/zones/ZoneServices.tsx)
- **2 FAQ específicas por zona**, derivadas del perfil de vivienda de su corona (piscinas/
  jardinería en el noroeste de renta alta, mantenimiento técnico en el sur de más densidad),
  con `FAQPage` schema. [ZoneFaq.tsx](src/components/ui/zones/ZoneFaq.tsx)
- **Zonas cercanas** (misma corona metropolitana), para el enlazado interno
  zona↔zona. [ZoneNearby.tsx](src/components/ui/zones/ZoneNearby.tsx),
  [getNearbyZones](src/config/zones.ts)
- **`Service`/`areaServed` schema** con coordenadas reales del municipio, complementando el
  `LocalBusiness` general. [ZoneJsonLd.tsx](src/components/seo/ZoneJsonLd.tsx)

Priorización (para futuras campañas/enlazado destacado, ya no para decidir qué publicar —
las 20 están publicadas): `sitemap.ts` usa prioridad 0.7 para las 3 originales, 0.6 para
antiguo Nivel 1 (Majadahonda, Las Rozas, Boadilla del Monte, Alcobendas), 0.5 para Nivel 2,
0.4 para Nivel 3.

Verificado con build de producción real: 200 en ES/EN, title/H1/breadcrumb/FAQ/schema
correctos, enlazado a los 6 servicios y a zonas de la misma corona confirmado en varias zonas
de muestra (Alcobendas, Torrelodones).

El contenido de cada zona se generó una vez con un script de una sola vez (ya borrado tras su
uso — ver §18); el copy real vive ahora en `views.json`, que es la fuente única. Al añadir una
zona nueva más adelante, redactar el `context`/`heroSubtitle`/FAQ directamente ahí, siguiendo
el mismo criterio (datos geográficos objetivos, sin reutilizar frases de cierre entre zonas —
ver la lección de la auditoría #4, §16).

## 5. Páginas de servicio — ampliación de contenido

Las 6 páginas ya existen y funcionan. Ampliar cada una (sin crear URLs nuevas, son las
mismas rutas) con:

- Bloque `¿Qué incluye nuestro servicio de [X]?` con desglose por zona/tipo de espacio
  (portales, escaleras, garajes, cristales... para limpieza; fontanería, electricidad,
  cerrajería... para mantenimiento).
- Bloque de enlazado a zonas (una vez existan las páginas del §4).
- Revisar si el naming actual (`limpieza`, `mantenimiento`) capta mejor el término comercial
  `limpieza de comunidades`/`mantenimiento de comunidades` — decidir si se amplía el copy sin
  cambiar la URL (recomendado, evita romper enlaces/indexación ya existente) o si se justifica
  un slug más largo. Por defecto: **no tocar los slugs ya indexados** salvo motivo de peso.

## 6. Segmento administradores de fincas

Hoy la web solo habla de "comunidades" y "empresas" de forma genérica. Administradores de
fincas es un cliente B2B de mucho más valor (gestionan varias comunidades a la vez).

- [x] **Página implementada**: `/para/administradores-de-fincas` (clave canónica
      `/for/property-managers`, `config/pathnames.ts`). Hero, 4 beneficios (un único
      interlocutor, sustituciones garantizadas, departamento de inspección, mismo estándar en
      toda la cartera — todos derivados de contenido ya publicado en `About.values`, ninguno
      inventado) y CTA hacia `/contact`. No aparece en navbar/footer (landing de captación, no
      sección de menú, mismo criterio que `/careers`). Incluida en `sitemap.ts`. Verificado
      con build de producción real: 200 en ambos locales, title/H1/breadcrumb correctos.
      **Componentes**: `src/components/ui/property-managers/*`,
      `src/views/(public)/for/PropertyManagersViewPage.tsx`.
- [ ] Contenido de blog dirigido a este segmento: ya mapeado en `keyword-map.md` §2 (filas
      marcadas "administradores de fincas" — checklist, cómo elegir empresa, contrato de
      mantenimiento, servicios externalizados, reducir incidencias). Redacción pendiente,
      va por la intranet (§7).

## 7. Blog — plan de contenido

Estado actual: prácticamente vacío. Esto es lo que más frena el posicionamiento hoy.

**La redacción y publicación de los artículos no se hace en este repositorio.** El blog vive
en el backend (`plantilla-nestjs`) y se gestiona desde la intranet — este repo (el landing)
solo lo consume y renderiza (`getBlogSitemapEntries`, `src/actions/blog/blog-actions.ts`).
El trabajo de código relevante aquí se limita a: la plantilla de renderizado del post
(`/blog/[slug]`), su SEO técnico (metadata, `Article` schema si falta — ver §12), y el
enlazado interno desde las páginas de servicio hacia el blog. El keyword map de artículos
([keyword-map.md](keyword-map.md) §2) sigue siendo la referencia de qué redactar, pero la
redacción y publicación se hacen desde la intranet, no como archivos de este repo.

- **No publicar artículos genéricos de relleno.** Cada uno debe mapear a una fila del keyword
  map (§2) con intención de búsqueda real.
- **Volumen inicial**: 20-30 artículos antes de considerar la fase de contenido "lanzada", no
  2-3 sueltos. (27 ya mapeados en `keyword-map.md` §2, listos para redactarse desde la
  intranet.)
- **Cadencia sostenida**: 4-8 artículos/mes después del lanzamiento inicial.
- **Categorías de intención** (no mezclar en el mismo artículo):
  - Guías (`¿Qué incluye una empresa de mantenimiento de comunidades?`)
  - Precios (`¿Cuánto cuesta un conserje para una comunidad en Madrid?`)
  - Problemas/decisión (`Cómo cambiar de empresa de limpieza en una comunidad`)
- Cada artículo debe enlazar internamente a: la página de servicio relacionada, la página de
  zona si aplica, y `/contact`.
- Marcar los posts con `Article` schema si no lo llevan ya (pendiente de auditar el código del
  blog).

## 8. Certificaciones (bloqueado — ver §1)

No crear `/certificaciones/` ni mencionar ISO 9001/14001/45001/27001 como vigentes hasta que
la empresa confirme el estado real de cada una. Si alguna está en trámite genuino, se puede
comunicar como tal explícitamente («en proceso de certificación ISO 9001»), nunca como ya
obtenida.

## 9. Prueba social / casos reales

- [ ] Redactar 2-3 casos de uso anonimizados (sin nombre de cliente/comunidad) con estructura
      problema → solución → resultado, como propone la auditoría. Requiere información real
      de la empresa sobre clientes/proyectos — no inventar cifras ni testimonios.
- [ ] **TODO — extender esto a las 20 páginas de zona (§21/§31) cuando haya datos reales.** El
      usuario confirmó (2026-08-17) que el contenido actual de zona (perfil urbano + 6 notas de
      servicio + FAQ) está bien para ahora ("no lo cambiaría ahora") pero quiere, en el futuro,
      añadir por municipio: casos reales, fotografías propias (hoy todas las zonas comparten la
      misma imagen genérica de `ZoneHero.tsx`, ver su docstring), particularidades reales del
      trabajo hecho allí, testimonios y proyectos concretos — para pasar de 8,7/10 a 10/10 según
      su propia valoración. Bloqueado por lo mismo que el resto de este punto: sin datos/fotos
      reales de la empresa, no hay nada que redactar sin inventar contenido.
- [ ] Configurar y optimizar Google Business Profile (nombre legal exacto, dirección real
      coincidente con la web, teléfono real, categorías, fotos, horario) — es prioritario:
      la auditoría lo señala como potencialmente más rentable a corto plazo que el SEO
      orgánico puro. Requiere acceso a la cuenta de Google Business de la empresa (fuera del
      alcance de este repositorio).

## 10. Naming — evitar depender de la marca

`Imora` compite en búsqueda con resultados no relacionados (un hotel en Jaén, según la
auditoría). No optimizar para `Imora` a secas: combinar siempre con servicio+ubicación
(`Imora limpieza comunidades Madrid`) y priorizar términos sin marca (`empresa limpieza
comunidades Madrid`) en el keyword map del §2.

## 11. Core Web Vitals / rendimiento

Cubierto en trabajo previo de esta rama de proyecto (ver commits de `next.config.ts`,
`config/csp.ts`: CSP con nonce, `next/image` con `sizes`/`quality` corregidos). Seguir
monitorizando con PageSpeed Insights / Search Console tras cada despliegue grande de
contenido nuevo — más páginas indexadas puede exponer problemas de rendimiento que hoy no se
ven por bajo tráfico.

## 12. Checklist técnico — verificado contra el código (2026-08-15)

- [x] **`FAQPage` schema: ya existe.** [ServiceDetailFaq.tsx](src/components/ui/services/ServiceDetailFaq.tsx)
      lo genera correctamente en las páginas de servicio.
- [x] **`BreadcrumbList` schema: implementado.**
      [BreadcrumbJsonLd.tsx](src/components/seo/BreadcrumbJsonLd.tsx), montado en
      `[locale]/layout.tsx` junto a `OrganizationJsonLd`. Lee `x-canonical-pathname` (mismo
      header que usa `generateMetadata.ts`) y resuelve cada tramo con `Routes.*`
      (`navigation.json`) o, si no está ahí, `Metadata.routes.*.title`. Se omite en la home
      (un solo tramo no aporta nada) y en rutas dinámicas. Verificado con build de producción
      real en `/`, `/servicios/limpieza`, `/sobre-nosotros`, `/contacto`.
- [x] **`Article` schema: implementado.** [ArticleJsonLd.tsx](src/components/seo/ArticleJsonLd.tsx),
      montado en `BlogPostViewPage.tsx`. Reutiliza la misma resolución de URL/imagen que
      `generateBlogPostMetadata.ts` (canonical, `ogImageUrl`/`coverUrl`,
      `firstPublishedAt`/`publishedAt`) para no divergir del metadata ya publicado en la
      misma página. Incluye `headline`, `datePublished`, `dateModified`, `author` (`Person`),
      `publisher` (`Organization` con logo), y `wordCount`/`keywords` cuando el post los trae.
      Verificado por tipos (`tsc`); no se pudo probar con datos reales porque el blog depende
      del backend (§7: la redacción va por la intranet), pero el componente compila y su forma
      coincide con la del metadata ya en producción.
- [x] **`WebSite` schema: implementado**, sin `SearchAction`.
      [WebSiteJsonLd.tsx](src/components/seo/WebSiteJsonLd.tsx) — se confirmó que
      `BlogFilters.tsx` solo filtra por categoría/tag, no tiene buscador de texto libre, así
      que declarar `SearchAction` sería una promesa falsa a los rich results. `publisher`
      referencia el mismo `@id` que `LocalBusiness` en `OrganizationJsonLd.tsx`. Verificado
      con build de producción real.
- [ ] Google Search Console — ¿está la propiedad verificada? ¿Qué dice de indexación/errores
      hoy? (requiere acceso a la cuenta, fuera de este repositorio)
- [x] **GA4: implementado.** [GoogleAnalytics.tsx](src/components/seo/GoogleAnalytics.tsx)
      carga `gtag.js` con `next/script` (`strategy="afterInteractive"`, con el nonce de la
      CSP) solo si `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` está configurado — sin ID, no renderiza
      nada. `config/csp.ts` añade automáticamente los orígenes de Google Analytics a
      `script-src`/`connect-src` cuando la variable está presente. Verificado con build de
      producción real, con y sin la variable puesta.
      **Nota**: al implementarlo se descubrió que el `.env` local tenía el placeholder
      `G-XXXXXXXXXX` de `.env.example` sin resolver — ya corregido con el Measurement ID real
      de la propiedad GA4 de Imora. **Revisar que el `.env` de producción en Vercel tenga
      también el ID real** y no ese mismo placeholder heredado (mismo tipo de problema que la
      dirección/teléfono ficticios del §1).
      **Obsoleto desde §38**: `GoogleAnalytics.tsx` ya no existe. Era una segunda instalación de
      GA4 en paralelo al contenedor de GTM, sin `consent default` y sin escuchar el banner, y se
      borró junto con `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`. La medición va entera por el contenedor.

## Roadmap de ejecución

1. **Fase 0 — Bloqueantes** (§1): datos reales de empresa, decisión sobre ISO.
2. **Fase 1 — Auditoría técnica pendiente** (§12): confirmar qué falta de verdad antes de
   construir nada nuevo encima.
3. **Fase 2 — Keyword map** (§2, [keyword-map.md](keyword-map.md)): completo para los 6
   servicios y 27 artículos de blog (dentro del rango 20-30 de §7) — listo para empezar a
   redactar. Las combinaciones de zona quedan sin generar hasta confirmar los municipios
   reales (§4). Sin una fila en este documento, no se crea ninguna URL nueva.
4. **Fase 3 — On-page de lo existente** (§3, §5): mejorar antes de expandir.
5. **Fase 4 — SEO local** (§4): completa — 20 páginas de zona con contenido real por municipio.
6. **Fase 5 — Segmento administradores de fincas** (§6).
7. **Fase 6 — Blog** (§7): 27 artículos ya mapeados en `keyword-map.md` §2, listos para
   redactarse desde la intranet (no en este repo) — luego cadencia mensual.
8. **Fase 7 — Prueba social + Google Business Profile** (§9).

Cada fase se aborda como su propio bloque de trabajo (probablemente varias sesiones) — este
documento es la referencia viva a actualizar según avance, no un plan cerrado de una sola vez.

## 13. Auditoría post-implementación (2026-08-15)

Tras completar las Fases 1, 2, 4 y parte de la 6/12, revisión de lo ya construido en busca de
huecos — encontrados y corregidos:

- [x] **Bug real: `robots.ts` apuntaba a un sitemap que no existe.** Referenciaba
      `${BASE_URL}/blog-sitemap.xml`, una URL que nunca existió en el proyecto (el sitemap
      único de `sitemap.ts` ya combina páginas estáticas y posts del blog). Corregido a un
      único `sitemap.xml`.
- [x] **Crítico: las 21 páginas nuevas (20 zonas + administradores de fincas) no tenían
      ningún enlace interno real** — solo alcanzables vía sitemap, sin nada que las
      enlazara desde páginas de alto tráfico. Corregido:
      - `ExpansionMapSection.tsx` (home): antes listaba 3 zonas como texto plano sin enlazar,
        leídas de una copia desincronizada (`Home.expansion.zones`). Ahora enlaza a las 20
        páginas de zona reales, leídas de `ZONES` (`config/zones.ts`) — única fuente, no
        puede volver a desincronizarse.
      - `/for/property-managers`: `shownInFooter` pasó de `false` a `true` en `routing.ts`
        (el comentario original decía "enlazada desde el blog", pero el blog aún no tiene
        artículos publicados — era una promesa sin cumplir).
- [x] **`llms.txt` no incluía zonas ni administradores de fincas.** Quedó desactualizado en
      cuanto se crearon esas páginas; ahora lista las 20 zonas (de `ZONES`, mismo criterio de
      fuente única) y la landing de administradores de fincas.

Verificado con build de producción real: `robots.txt` sin la URL rota, home con 20 `<a
href="/zonas/...">`, footer con el enlace a administradores de fincas, `llms.txt` con ambas
secciones nuevas.

## 14. Auditoría #2 post-implementación (2026-08-15)

Segunda pasada, sin dar por buena la primera — encontrados 2 problemas reales más, corregidos:

- [x] **Grave: `title`/`description` de las 20 zonas era una plantilla idéntica** (solo
      cambiaba el nombre del municipio: *"Servicios para comunidades en {zona}"* / misma
      descripción con find-replace) — justo lo que este documento prohíbe en §4, aunque el
      contenido visible (`context`/`heroSubtitle`/FAQ) sí fuera único desde el principio. Es
      lo que Google muestra en resultados de búsqueda, así que importaba más que el body.
      Corregido con un script de una sola vez (ya borrado tras su uso — ver §18):
      title/description/keywords redactados a mano por zona, derivados del mismo ángulo ya
      usado en su `context` (perfil de vivienda, servicios más relevantes de esa corona) —
      verificado: 20 descripciones, 20 únicas.
- [x] **`/zonas` (índice) daba 404.** No existía ninguna página que listara las 20 zonas
      juntas — quien quitara el último segmento de cualquier URL de zona, o buscara "zonas de
      cobertura Imora", se encontraba con un error. Creada
      [ZonesIndexViewPage.tsx](src/views/(public)/zones/ZonesIndexViewPage.tsx): agrupa las
      20 por corona metropolitana (más fácil de escanear que una lista plana), con hero
      ligero sin foto (para no reutilizar otra vez `about/hero.jpg`, ya usada en 20+1
      páginas). Enlazada desde el footer.

Verificado con build de producción real: `/zonas` (ES) y `/zones` (EN) devuelven 200,
agrupación por corona correcta, 20 enlaces, metadata de zona individual ya con
title/description distintos entre sí.

**Descartado en esta pasada** (falsa alarma propia): pensé que faltaba `hreflang` en las
páginas de zona — sí está presente y correcto, solo lo busqué mal (React sirve el atributo
como `hrefLang`, no `hreflang`, en el HTML).

**Sigue pendiente**: la misma imagen (`about/hero.jpg`) se repite en `/about` y en las 20
zonas — decisión consciente documentada en el código, no un bug, pero limita la
diferenciación visual de cada página si se audita con una herramienta de imágenes.

### Enlazado servicio→zona — cerrado

[x] Enlazado bidireccional completo. [ServiceDetailZones.tsx](src/components/ui/services/ServiceDetailZones.tsx)
muestra, en las 6 fichas de servicio, las 6 zonas de mayor prioridad (las 3 confirmadas +
Nivel 1 completo — mismo orden que usa `sitemap.ts`) más un enlace al índice `/zonas`
completo. No las 20 en cada ficha a propósito: sería ruido visual y diluiría el valor de cada
enlace individual. Verificado con build de producción real en `/servicios/limpieza` y
`/servicios/seguridad`: 6 enlaces a zona + 1 al índice, en ambas.

## 15. Auditoría #3 post-implementación (2026-08-15)

Tercera pasada, sin dar por buenos los fixes previos — **no encontró bugs nuevos**: todo lo de
las auditorías #1 y #2 seguía funcionando, incluido un efecto colateral bueno no planeado —
el breadcrumb de cada zona individual ganó automáticamente un tercer nivel (Inicio → Zonas de
cobertura → Municipio) en cuanto `/zones` quedó traducido en `Routes` para el índice.

Encontrados 3 hallazgos menores (ninguno bloqueante, todos de calidad/consistencia), corregidos:

- [x] **Título de sección repetido en las 6 fichas de servicio.** "Disponible en estas zonas
      de Madrid" era literal e idéntico en `ServiceDetailZones.tsx` — texto de UI, no
      metadata indexable (el `<title>`/`description` real de cada servicio ya era único
      desde antes), pero repetido sin necesidad. Corregido: recibe el `slug` del servicio y
      compone `"{servicio} disponible en estas zonas de Madrid"` — verificado con build real
      en `/servicios/limpieza` y `/servicios/conserjeria`, ya distintos.
- [x] **`Service` de `ZoneJsonLd.tsx` sin `name`.** Válido en schema.org pero más débil —
      una entidad de servicio sin nombrar. Corregido reutilizando el `title` de
      `Metadata.routes["/zones/<slug>"]` (ya único por zona desde el fix del metadata
      plantilla, §14) en vez de redactar un tercer texto — verificado en Alcobendas: `"name":
      "Conserjería y seguridad para empresas y comunidades en Alcobendas"`.
- [x] **Índice `/zonas` sin schema propio.** Solo llevaba el `LocalBusiness`/`WebSite`
      genérico de toda la web, nada que dijera explícitamente "esto es un listado".
      Añadido [ZonesIndexJsonLd.tsx](src/components/seo/ZonesIndexJsonLd.tsx):
      `CollectionPage` con `ItemList` de las 20 zonas (`Place` con coordenadas reales) —
      verificado: 20 `Place` en el JSON-LD del índice.

Verificado con build de producción real los 3 fixes juntos.

## 16. Auditoría #4 post-implementación, estricta (2026-08-15)

Cuarta pasada, con verificación programática en vez de solo lectura manual — comprobó
integridad de datos y buscó similitud textual entre las 20 zonas, no solo huecos evidentes.

**Verificación de integridad**: los 20 slugs de [config/zones.ts](src/config/zones.ts)
coinciden exactamente (ni de más ni de menos) en las 8 fuentes que deberían reflejarlos:
`pathnames.ts`, `Metadata.routes` (ES/EN), `Routes` (ES/EN), `Zones.items` (ES/EN), las
carpetas de página, y `sitemap.ts`. Sin bugs de sincronización.

**Verificación de Open Graph / robots**: `og:title`/`og:description` heredan el metadata ya
único por zona; las 21 páginas nuevas (20 zonas + administradores de fincas) llevan
`robots: index, follow`, correcto para páginas SEO públicas.

- [x] **Grave: 3 pares de zonas con frases de cierre casi idénticas en `context`.** Análisis
      de similitud léxica (Jaccard) entre los 20 `context` encontró Getafe/Coslada (57%),
      Tres Cantos/Rivas-Vaciamadrid (51%) y Colmenar Viejo/Arganda del Rey (55%) — frases
      como *"son los servicios que más estabilidad aportan a..."* o *"tienen un peso
      especialmente alto en el perfil de servicio de la zona"* reutilizadas casi literales al
      redactar por corona metropolitana, sin darme cuenta en el momento. Es el mismo problema
      que el metadata plantilla de §14, esta vez en el **contenido visible** (más grave: es
      lo que un usuario real lee, no solo lo que ve Google en resultados). Corregidas las 6
      zonas (ES y EN) con redacciones propias que mantienen los mismos hechos geográficos
      reales — verificado: 0 pares por encima del 50% de similitud tras el fix.

**Descartado** (no era problema): la similitud en `heroSubtitle` (hasta 75% entre algunos
pares) es esperada y aceptable — son frases cortas de patrón fijo a propósito
("[Servicios] para comunidades de [Municipio], a X km al [dirección] de Madrid"), cada una
con datos objetivos distintos (distancia, dirección cardinal), no contenido de análisis
reutilizado. Las FAQ no mostraron ningún par por encima del 60%.

**Lección para futuras zonas**: si se añade un municipio nuevo al catálogo, redactar su
`context` de forma aislada y volver a correr el análisis de similitud antes de darlo por
bueno — es fácil reutilizar sin querer una frase de cierre al redactar varias zonas seguidas
de la misma corona.

## 17. Auditoría #5 post-implementación, app completa (2026-08-15)

Quinta pasada, con el alcance ampliado de "las zonas" a **toda la aplicación** — buscó
problemas fuera del trabajo de esta rama, no solo revalidó lo ya tocado.

- [x] **Grave: 18 páginas con `title`/`description` que excedían los límites de Google**
      (~60 caracteres título, ~160 descripción) — se truncarían con "..." en los resultados de
      búsqueda. 12 eran de las zonas (redactadas en la auditoría #2 sin verificar longitud) y
      **6 eran metadata preexistente del proyecto**, de antes de esta rama SEO (`/`, `/about`,
      `/services`, `/services/concierge`, `/services/maintenance`, más la propia
      `/for/property-managers`). Recortadas las 18 manteniendo el mensaje real, con
      dos scripts de una sola vez (ya borrados tras su uso — ver §18) — verificado
      programáticamente: 0 excesos en ninguna página pública (excluida `/private-area`, que
      es UI de app con `noindex`, no le aplican los mismos límites).
- [x] **Grave, preexistente: enlace roto real en el footer de todas las páginas.**
      `Footer.tsx` enlazaba `/empleo` ("/careers") en la columna de contacto — la página nunca
      se construyó (404 confirmado en producción real). El propio `sitemap.ts` ya lo sabía y
      excluía esa ruta a propósito ("no existe todavía"), pero el footer no se había
      actualizado a la vez, así que el 404 estaba presente en cada página del sitio. Quitado
      el enlace hasta que la página exista de verdad. **Cerrado el 2026-08-20** (ver §36): la
      página existe, el enlace está restaurado y `/empleo` entra en el sitemap.
- [x] **Verificación de integridad de datos, ampliada.** Confirmado con build de producción
      real: `og:title`/`og:description` heredan el metadata ya corregido; `/login` y el resto
      de páginas de autenticación llevan `robots: noindex, nofollow` correctamente; el peso
      del bundle (`4.4 MB`/192 chunks) no muestra crecimiento anómalo tras añadir 21 páginas
      nuevas; el bloqueante de datos ficticios (`Calle Ejemplo`) sigue correctamente marcado
      como pendiente en §1, no se ha "perdido" entre las auditorías.

**Descartado** (falsos positivos del primer barrido): varias rutas de `/private-area/*`
salieron marcadas por "title corto" en el análisis automático (p. ej. `"Mi perfil"`,
`"Facturas"`) — son correctas, es UI de área privada con `noindex`, no páginas SEO; los
límites de longitud no les aplican.

## 18. Auditoría #6 post-implementación, app completa (2026-08-15)

Sexta pasada, enfocada en "encontrabilidad real": no solo que el código esté bien formado,
sino que un cliente potencial pueda realmente llegar a la web y confirmar que Google puede
verificar el trabajo hecho en las 5 auditorías anteriores.

- [x] **Grave: la verificación de Google Search Console estaba muerta en código.**
      `ENV.GOOGLE_SITE_VERIFICATION` (`src/config/env.ts`) se leía del `.env` pero nunca se
      conectaba a ningún `<meta>` — igual que le pasó a GA4 antes de conectarlo al principio
      de esta rama. Aunque el usuario pusiera un código real de Search Console en producción,
      no habría pasado nada: sin el meta tag, no hay forma de verificar la propiedad ni de
      confirmar cómo está indexando Google todo el trabajo de SEO de las auditorías #1-#5.
      Corregido en [generateMetadata.ts](src/lib/generateMetadata.ts): añade
      `verification: { google: ... } }` al objeto `Metadata`, mostrado condicionalmente (solo
      si la variable tiene valor, para que nunca se emita un `<meta>` vacío).
- [x] **El `.env` local tenía el placeholder literal `your-google-site-verification-code`
      (heredado de `.env.example`), no vacío.** Con el fix de arriba, eso se habría emitido
      como si fuera un código real — peor que no tener nada, porque es un dato falso visible
      en el HTML de producción. Vaciado en `.env` (no en `.env.example`, que debe conservar el
      placeholder como documentación del formato esperado).

Verificado con build de producción real, en ambos sentidos: con `.env` vacío, no aparece
ningún `<meta name="google-site-verification">` en el HTML servido; forzando la variable a un
valor de prueba (`test-verification-code-123`), el meta tag aparece con el valor correcto.
Confirma que basta con que el usuario ponga su código real de Search Console en el `.env` de
producción (Vercel) para que quede verificado — no requiere ningún cambio de código adicional.

**Pendiente de que el usuario aporte el dato** (mismo patrón que los bloqueantes de §1, no se
inventa): código real de verificación de Google Search Console, en `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
del `.env` de producción.

**Revisado y descartado** (sin bugs encontrados):
- Favicon/`icon.png`/OG image: los tres responden `200` en HTTP real. `metadata.icons` apunta
  a `/icon.png`/`/favicon.ico`, servidos por convención de App Router desde `src/app/`
  (`favicon.ico`, `icon.png`) — coincide con la URL declarada, sin conflicto.
- `sitemap.xml`: usa `ENV.APP_URL` dinámicamente (en local resuelve a `localhost:3002`, en
  producción resolverá a `https://imora.es` con el `.env` de Vercel) — comportamiento
  esperado, no un bug. hreflang ES↔EN de zonas correcto (`/zonas/madrid` ↔ `/zones/madrid`,
  `x-default` apuntando a la versión española), 21 URLs de zona sin duplicados.
- `OrganizationJsonLd.tsx`: `sameAs` con redes sociales ya es condicional (`socials.length > 0`),
  no emite el campo si no hay ninguna red configurada.
- CTAs de página de zona (`ZoneCta.tsx`): enlazan a `/contact`, sin datos de contacto
  inventados renderizados — ya evitado a propósito desde antes de esta auditoría.
- Contenido traducido (`views.json`, `metadata.json`): sin restos de `lorem ipsum`, `TODO`,
  "próximamente" u otro texto de relleno visible al usuario.

**Limpieza**: borrados los 4 scripts de una sola vez de `scripts/seo/` (generación y recorte
de contenido/metadata de zonas) — ya cumplieron su función, su resultado está persistido en
`views.json`/`metadata.json`, y volver a ejecutarlos hoy sobrescribiría ajustes manuales
posteriores (recortes por longitud, reescritura de las 6 zonas por similitud). Los enlaces a
ellos en §5/§14/§17 de este documento se actualizaron para no apuntar a ficheros borrados.

## 19. Fix de maquetación del footer (2026-08-15)

Encontrado por el usuario, no por auditoría automática: "Zonas de cobertura" y
"Administradores de fincas" quedaban como columnas del footer con solo el título enlazado y
nada debajo (sin `subRoutes`), mientras "Servicios" tenía 6 líneas y "Ayuda" 2 — con
`grid-template-columns: repeat(4, 1fr)` fijo, esas columnas cortas dejaban huecos vacíos y
descompensaban visualmente el footer en pantallas grandes.

- [x] **`/zones` gana `subRoutes` con las 5 zonas de mayor prioridad**
      (`config/routing.ts`, mismo criterio que `ServiceDetailZones.tsx`: las 3 confirmadas +
      Nivel 1, `ZONES.slice(0, 5)`), enlazando a `/zones/[slug]`. La columna del footer pasa
      de un título huérfano a una lista real, igual que "Servicios" o "Ayuda".
- [x] **`/for/property-managers` deja de tener columna propia** (`shownInFooter: false`,
      no tiene subrutas naturales) y se enlaza en su lugar como línea extra dentro de la
      columna "Servicios" (`Footer.tsx`), su sitio natural por ser un segmento de cliente
      relacionado. Sigue enlazada internamente (ya no depende solo del sitemap), solo cambia
      de columna.
- [x] **Grid de columnas de ancho fijo en vez de un número de columnas fijo**
      (`footer.scss`): `repeat(4, 1fr)`/`repeat(3, 1fr)` dejaba huecos en cuanto el número de
      grupos visibles cambiaba (ahora son 3: Servicios/Zonas/Ayuda, antes eran 4). Cambiado a
      `repeat(auto-fit, minmax(9rem, 1fr))` a partir de `sm` (en móvil se mantiene 1 columna),
      que reparte el espacio entre los grupos que haya sin depender de un número fijo.

Verificado con build de producción real: HTML del footer con 3 columnas
(Servicios: 7 líneas incluida "Administradores de fincas" · Zonas de cobertura: 5 municipios ·
Ayuda: 2 líneas), ninguna columna con solo el título sin lista debajo.

## 20. Rediseño de "zonas donde se presta" en la ficha de servicio (2026-08-15)

Encontrado por el usuario: en cada ficha de servicio, "Zonas donde se presta"
(`ServiceDetailZones.tsx`) y "Servicios relacionados" (`ServiceDetailOthers.tsx`) —
renderizados uno justo después del otro — compartían exactamente el mismo CSS
(`services__others-*`) y por tanto la misma pinta de chips en fila, pese a enlazar a cosas
distintas (zonas vs. servicios). Visualmente parecía la misma sección repetida dos veces.

- [x] **`ServiceDetailZones.tsx` reescrito con mini-mapa de puntos**, a petición explícita del
      usuario (elegido frente a "tarjetas con corona y distancia" y "lista con franja de
      color"). Un SVG propio (sin librería de mapas externa) con las 6 zonas destacadas
      posicionadas por sus coordenadas reales de `config/zones.ts` — la proyección lat/lng→SVG
      se calcula en runtime a partir del rango real de las 20 zonas del catálogo, no de un
      bounding box fijo, así que se auto-ajusta si se añade una zona nueva más lejana en vez de
      dejarla fuera del lienzo. Madrid capital se destaca con un punto mayor y un pulso
      decorativo. Junto al mapa, una lista compacta con las mismas 6 zonas como enlaces
      (accesibilidad: el mapa por sí solo no es suficiente para navegación por teclado/lector
      de pantalla). CSS nuevo en
      [serviceDetailZones.scss](src/styles/04-components/services/serviceDetailZones.scss),
      independiente de `serviceDetailOthers.scss` — ya no comparten clases.
      `ServiceDetailOthers.tsx` no se tocó, sigue con su estilo de chips original.

Verificado con build de producción real en `/servicios/limpieza`: 6 puntos en el mapa (7
círculos contando el pulso de Madrid) con coordenadas distintas dentro del viewBox, 6 enlaces
en la lista lateral, "Servicios relacionados" sin cambios visuales.

## 21. Auditoría SEO externa (16 puntos) — puntos 7, 10, 11 y 15 (2026-08-16)

Auditoría externa pegada íntegra por el usuario con 16 puntos numerados. Los puntos 1-6, 8-9,
12-14 y 16 ya estaban cubiertos por auditorías anteriores de este documento o son bloqueantes ya
documentados (§1, código real de Search Console). Este apartado cubre los puntos pendientes.

**Punto 7 — contenido propio de "servicio × zona"**: `ZoneServices.tsx` mostraba el mismo
`summary` genérico del servicio (`Services.items.<slug>.summary`) en las 20 páginas de zona sin
variación — la única diferencia entre zonas era el nombre del municipio en el título del enlace.

- [x] **`ZoneServices.tsx` cambiado para leer `Zones.items.<slug>.serviceNotes.<servicio>`**
      en lugar del `summary` genérico, key nueva por zona.
- [x] **120 párrafos redactados** (20 zonas × 6 servicios: `concierge`, `security`, `pools`,
      `cleaning`, `gardening`, `maintenance`), en `views.json` ES y EN, usando como fuente el
      `context` ya redactado de cada zona (perfil real de vivienda/urbanismo: bloque denso,
      urbanización con piscina, parque empresarial, distancia a Madrid capital...) para que cada
      párrafo combine el servicio con un ángulo genuinamente distinto según la zona, sin
      inventar datos de actividad de la empresa (mismo criterio de "no inventar" que el resto
      de bloqueantes documentados en §1).
- [x] **Verificado con análisis de similitud léxica (Jaccard)** agrupando por servicio y
      comparando las 20 zonas entre sí (no solo el `context` general): tras dos rondas de
      reescritura de los pares con mayor solapamiento (frases de plantilla como "suele/suelen
      estar en las zonas de expansión más reciente, con mantenimiento según el calendario
      habitual" o "cubre tanto instalaciones comunes... como avisos de las viviendas"), el
      máximo de similitud entre cualquier par de zonas para un mismo servicio bajó a 59,1% (ES/EN
      combinados), con la mayoría de pares entre 35-53% — en línea con la similitud ya aceptada
      en auditorías anteriores de este documento para contenido con vocabulario de dominio
      compartido inevitable (ej. "socorrista titulado", "calendario habitual de temporada").

**Punto 10 — CTAs variados por servicio**: revisado, ya estaba resuelto de una auditoría
anterior — los 6 servicios en `Services.items.*.cta` ya tienen texto personalizado por servicio
(ej. "Preparar mi piscina para la temporada", "Consultar plan de limpieza"), no un CTA genérico
repetido.

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real
(`rm -rf .next && next build` sin errores) y HTML servido: confirmado en `/zonas/alcorcon` (nuevo
párrafo de `pools`) y en `/en/zones/boadilla-del-monte` (nuevo párrafo de `maintenance`) que el
contenido de `serviceNotes` se renderiza correctamente en producción.

**Punto 11 — campos "servicio que necesitas" y "localidad" en el formulario de contacto**:
descartado a petición explícita del usuario tras plantear las dos formas de guardarlo en el
backend (texto libre vs. enum sincronizado) — no se implementa.

**Punto 15 — cobertura de Schema.org (JSON-LD)**: auditado el estado de los 6 tipos que pide el
punto (Organization, WebSite, Service, BreadcrumbList, LocalBusiness, FAQPage) contra las 6
páginas de servicio, las 20 de zona, `/help/faq` y el resto de páginas públicas. Ya cubierto de
auditorías anteriores: `LocalBusiness` + `areaServed` general (`OrganizationJsonLd.tsx`,
site-wide), `WebSite` (`WebSiteJsonLd.tsx`, site-wide), `BreadcrumbList` (`BreadcrumbJsonLd.tsx`,
site-wide), `Service`/`areaServed` por zona (`ZoneJsonLd.tsx`) y `FAQPage` en zonas y en cada
ficha de servicio (`ZoneFaq.tsx`/`ServiceDetailFaq.tsx`). Dos huecos reales encontrados:

- [x] **Ninguna ficha de servicio individual tenía `Service` schema propio.** El único `Service`
      relacionado con `/services/<slug>` vivía dentro del array `makesOffer` de
      `OrganizationJsonLd.tsx` (site-wide) — útil como catálogo conjunto, pero sin `@id`/URL
      propios que un buscador pueda asociar directamente a esa página. Creado
      [ServiceJsonLd.tsx](src/components/seo/ServiceJsonLd.tsx), calcado de `ZoneJsonLd.tsx`:
      `Service` con `name` (reutiliza el title de `Metadata.routes`), `provider` (`@id` a la
      organización), `areaServed` (las 20 zonas) y `url` propia de la página. Añadido a las 6
      `*ViewPage.tsx` de servicio (`Cleaning`/`Concierge`/`Gardening`/`Maintenance`/`Pools`/
      `SecurityViewPage.tsx`), que pasaron de no recibir `locale` a aceptarlo como prop — mismo
      patrón que `ZoneViewPage.tsx` — y sus 6 `page.tsx` correspondientes, que ahora resuelven
      `params.locale` y se lo pasan.
- [x] **`/help/faq` (`FaqAccordion.tsx`) no emitía `FAQPage`**, la única página con preguntas
      frecuentes visibles sin datos estructurados (zonas y fichas de servicio ya lo tenían).
      Añadido el mismo bloque `<script type="application/ld+json">` que `ZoneFaq.tsx`, agregando
      con `flatMap` las preguntas de las 4 categorías (servicios, cobertura y horarios,
      presupuestos, empresa y garantías) en un único `mainEntity`.

Verificado con `tsc --noEmit` limpio, build de producción real sin errores, y HTML servido: en
`/servicios/limpieza` aparece un bloque `Service` de primer nivel con
`name: "Empresa de Limpieza de Comunidades en Madrid"`, `areaServed` con las 20 ciudades y `url`
propia (distinto del `Service` genérico dentro de `makesOffer`, que también sigue presente); en
`/ayuda/preguntas-frecuentes` aparece `"@type":"FAQPage"` con todas las preguntas.

## 22. Segunda pasada de una auditoría SEO externa (2026-08-16)

El usuario pegó una segunda valoración externa (8,7/10) sobre la web ya en producción, con 4
acciones concretas. Al contrastarlas con el repo, **2 de las 4 ya estaban resueltas en el código**
(commit `3d3cb25`, rama `dev`): el H1 de la home (`Home.hero.title` = "Servicios integrales para
comunidades, empresas y edificios en Madrid") y los anchors del footer para limpieza/mantenimiento
(`Services.items.cleaning/maintenance.title`, que el footer lee directamente vía
`servicesT(\`${slug}.title\`)}`). La auditoría externa evaluó una versión de producción anterior a
estos cambios — **no existe rama `main` en el remoto** (solo `dev`, sin mergear/desplegar a
donde sea que apunte producción), así que el desfase es de despliegue, no de código. No se tocó
git ni el proceso de deploy: queda a decisión del usuario.

Punto #3 de la auditoría ("dar más protagonismo a Administradores de Fincas, convertirla en una
landing comercial potentísima"): la página (`/for/property-managers`) ya tenía hero, servicios,
beneficios y CTA con copy específico del segmento (auditoría §6/§21). Prueba social real
(testimonios, número de fincas gestionadas) sigue bloqueada por falta de datos reales, mismo
criterio que el resto de bloqueantes de §1. Añadido lo que sí se puede construir sin inventar
datos:

- [x] **`PropertyManagersFaq.tsx`** (nuevo, junto a `PropertyManagersCta.tsx`): 8 preguntas
      frecuentes propias de un administrador de fincas — facturación por finca (no una única
      factura de cartera), un contrato por comunidad, a quién avisar si una incidencia afecta a
      varias fincas, alta de una finca nueva sin renegociar las demás, qué pasa si una comunidad
      ya tiene un proveedor para un servicio concreto, informe conjunto de toda la cartera,
      alcance del departamento de inspección, y cómo se presenta la propuesta comercial. Ninguna
      coincide con las de `Faq.categories` (dirigidas a un presidente de comunidad individual,
      no a quien gestiona varias fincas a la vez). `FAQPage` schema con el mismo patrón que
      `ZoneFaq.tsx`/`ServiceDetailFaq.tsx`, reutilizando sus clases `services__faq-*`. Insertado
      en `PropertyManagersViewPage.tsx` entre `PropertyManagersBenefits` y `PropertyManagersCta`.
      Contenido nuevo en `ForPropertyManagers.faqTitle`/`ForPropertyManagers.faq` (ES/EN).

Punto #4 de la auditoría (revisar Search Console) sigue bloqueado por la falta del código real de
verificación, ya documentado en §1/§18.

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real
(con un reintento por un fallo interno transitorio de Turbopack — `TurbopackInternalError:
failed to receive message`, sin relación con el código, resuelto al reintentar) y HTML servido:
en `/for/property-managers` aparece `"@type":"FAQPage"` y el texto de la primera pregunta.

Puntos #8 y #10 de la misma auditoría, ambos sobre la home:

- [x] **Punto #8 — el "0€" de la cinta de confianza es ambiguo.** `Home.trustBar.items.coverage`
      mostraba `value: "0€"` con `label: "Sustituciones garantizadas sin coste añadido"` — un
      número grande junto a "sin coste" puede leerse a primera vista como "servicio gratuito".
      Reetiquetado a "Coste adicional por sustituciones garantizadas" (ES) / "Extra cost for
      guaranteed substitutions" (EN), que deja claro que el "0€" es el coste añadido, no el
      precio del servicio — la sugerencia más inequívoca de las dos que planteó la auditoría.
      Sin cambios en `TrustBarSection.tsx` (el componente ya renderiza `value`/`label` desde
      `views.json`, solo cambió el texto).
- [x] **Punto #10 — sección "¿A quién ayudamos?" en la home.** No existía ningún bloque que
      segmentara explícitamente por tipo de cliente en la home (solo aparecía indirectamente
      dentro de servicios/zonas). Creado
      [WhoWeHelpSection.tsx](src/components/ui/home/WhoWeHelpSection.tsx): tres tarjetas
      (comunidades de propietarios, administradores de fincas, empresas y edificios), mismo
      patrón `about__values-grid` que `ZoneServices.tsx`/`PropertyManagersServices.tsx` —
      icono, título enlazado y descripción corta, sin sección nueva de CSS. La tarjeta de
      administradores de fincas enlaza a `/for/property-managers` (refuerza también el punto
      #3 de la auditoría anterior, dándole más visibilidad desde la home); las otras dos
      enlazan a `/services`. Insertada en `HomeViewPage.tsx` entre `ServicesCarouselSectionLazy`
      y `FeatureMosaicSection` (después de "qué ofrecemos", antes de "por qué confiar en
      nosotros"). Contenido nuevo en `Home.whoWeHelp` (ES/EN).

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real
(con un segundo reintento por el mismo fallo transitorio de Turbopack) y HTML servido: en `/es`
aparecen el título "Servicios pensados para cada tipo de cliente", las tres tarjetas (incluida
"Administradores de fincas") y el nuevo label "Coste adicional por sustituciones garantizadas"
en la cinta de confianza, sin rastro del texto anterior en esa sección.

## 23. Tercera pasada de la misma auditoría externa — bug real de anchor duplicado (2026-08-16)

El usuario pegó una tercera valoración (8,8/10) tras el redespliegue de los cambios anteriores.
La mayoría de puntos confirman correcciones ya hechas en sesiones previas (H1 de home, `/servicios`,
limpieza, mantenimiento, FAQ general). Dos hallazgos nuevos, ambos con la misma causa raíz:

- [x] **Bug real: `/zonas/madrid` mostraba "Limpieza de comunidades y edificios en Madrid en
      Madrid"** (y lo mismo con mantenimiento). Causa: `ZoneServices.tsx` construye el anchor
      como `{itemsT('${slug}.title')} {tZones('inZone', {zone})}` — pero
      `Services.items.cleaning.title`/`maintenance.title` ya llevaban el sufijo fijo "en Madrid"
      desde la ronda de metadata SEO de §14, mientras los otros 4 servicios no. El resultado era
      "en Madrid" duplicado solo en esos dos, y solo en la zona de Madrid capital (en el resto de
      zonas se leía como "...en Madrid en Alcobendas", igual de incorrecto pero menos obvio).
      Corregido quitando el sufijo "en Madrid" de `Services.items.cleaning.title`/
      `maintenance.title` (ES/EN): pasan a "Limpieza de comunidades y edificios"/"Mantenimiento
      de comunidades y edificios", sin ciudad fija — igual que los otros 4 servicios. El
      `<title>` SEO de esas páginas (`Metadata.routes["/services/cleaning|maintenance"].title`,
      "Empresa de Limpieza/Mantenimiento... en Madrid") vive en un namespace completamente
      distinto y no se tocó, así que la keyword geolocalizada en la pestaña del navegador se
      mantiene intacta.
- [x] **"Otros servicios que también gestionamos" (`ServiceDetailOthers.tsx`) con anchors
      antiguos "Limpieza integral"/"Mantenimiento de edificios"**: verificado que ese componente
      ya lee `Services.items.<slug>.title` (el mismo texto corregido en el punto anterior), así
      que no había ningún título hardcodeado desactualizado en el código — el único "Limpieza
      integral" real que queda en `views.json` está dentro de `summary` (texto descriptivo, no
      un anchor). El arreglo del punto anterior corrige automáticamente este anchor en las 6
      páginas de servicio sin tocar `ServiceDetailOthers.tsx`.

Como en auditorías anteriores, es probable que la versión que el usuario/ChatGPT rastreó en vivo
esté por detrás del código de este repo (rama `dev` no desplegada a producción, ver §22) — pero
el bug de la duplicación "en Madrid en Madrid" sí era un bug real y reproducible en el código
antes de esta corrección, no solo un desfase de despliegue.

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real
(exitoso al primer intento) y HTML servido: en `/zonas/madrid` ya no aparece "en Madrid en
Madrid" en ningún sitio; el H1 de `/services/cleaning` es "Limpieza de comunidades y edificios";
en `/services/security`, la sección "otros servicios" muestra "Limpieza de comunidades y
edificios" y "Mantenimiento de comunidades y edificios" como anchor (las 3 apariciones
restantes de "Limpieza integral" en esa página son dentro de `summary`/JSON-LD `description`,
no un título ni un enlace).

## 24. PageSpeed/Lighthouse real de producción (2026-08-16)

El usuario pegó un reporte técnico real de PageSpeed sobre `imora.es` (no una valoración de
ChatGPT), con tres hallazgos concretos: ~19 archivos CSS de 1-3,6 KiB bloqueando el renderizado
(~650ms de ahorro estimado en LCP), ~14 KiB de polyfills de JavaScript innecesarios para
navegadores modernos, y ~90 KiB de JS sin usar (68,4 KiB de Google Tag Manager, 21,6 KiB propio).

- [x] **CSS chunking**: `next.config.ts` no tenía ningún ajuste de
      `experimental.cssChunking` — cada componente hace su propio
      `import '@/styles/....scss'` (patrón establecido en todo el proyecto), y el chunking por
      defecto de Turbopack no los fusionaba lo suficiente. Se actualizó Next.js de 16.2.9 a
      **16.3.1** (única forma de acceder al modo `cssChunking: { type: 'graph', requestCost }`,
      que no existe como shape de objeto en 16.2.9 — ahí solo hay `true`/`'strict'`, y
      `'strict'` genera *más* peticiones, no menos). Probado con `requestCost` en 60000 y en
      200000 (10x el valor por defecto): en ningún caso bajó el número de archivos CSS servidos
      en la home (22 en todos los casos, incluido sin el flag). **Conclusión: el flag no tiene
      efecto medible aquí** — el algoritmo de `'graph'` fusiona por árbol de dependencias de
      import, y con ~20 componentes importando cada uno su propio `.scss` sin compartir un
      padre común en el árbol de imports, no encuentra grupos que fusionar por mucho que suba
      el coste de una petición extra. Se deja el flag activo (no empeora nada, y Next.js podría
      mejorar el algoritmo en el futuro), pero el problema de fondo — reducir el número real de
      hojas de estilo importadas — es un cambio de arquitectura de CSS bastante más grande, no
      abordado en esta sesión.
      - **Efecto secundario del flag**: `cssChunking: 'graph'` solo es válido bajo Turbopack;
        `@storybook/nextjs-vite` importa `next.config.ts` para su propio pipeline Vite (usado
        también por `@storybook/addon-vitest` en `vitest.config.ts`), y Next lo rechazaba fuera
        de un contexto Turbopack real, rompiendo `pnpm test` (`vitest run --project=unit`
        evalúa toda la config compartida, incluido el proyecto de Storybook, aunque filtre por
        "unit"). Corregido envolviendo el bloque `cssChunking` en
        `...(process.env.TURBOPACK ? {...} : {})` — `TURBOPACK` es una variable que el propio
        `next dev`/`next build` define internamente al arrancar con Turbopack
        (`node_modules/next/dist/lib/bundler.js`), ausente cuando Storybook/Vitest solo
        importan el fichero de configuración.
- [x] **JavaScript "antiguo" (polyfills, 14 KiB)**: `browserslist` en `package.json` era una
      lista heredada (`"> 0.5%", "last 2 versions", "Firefox ESR", "not dead", "not IE 11"`) que
      forzaba transpilación/polyfills de funciones Baseline ampliamente disponibles
      (`Array.prototype.at`/`flat`/`flatMap`, `Object.fromEntries`/`hasOwn`,
      `String.prototype.trimStart`/`trimEnd`). Sustituida por `["baseline widely available"]`,
      la query oficial del proyecto Baseline (web.dev + WebDX Community Group) para "navegadores
      con soporte interoperable desde hace 30+ meses" — más precisa que un listado de
      porcentajes/versiones sueltas, sin perder ningún navegador real con tráfico relevante.
      **Verificado tras el cambio que persiste un polyfill de `Object.hasOwn` en el chunk
      vendor**: no viene de código propio (SWC no genera ese patrón), sino de una dependencia de
      `node_modules` que ya trae el polyfill embebido en su propio bundle — `browserslist` del
      proyecto no afecta a cómo una dependencia transpiló su propio código antes de publicarlo
      en npm (limitación conocida y documentada de Next.js/SWC, no arreglable sin
      `transpilePackages` apuntando al paquete exacto, no identificado por el bajo impacto — 14
      KiB — frente al riesgo de tocarlo sin confirmar la causa exacta).
- [x] **JS de terceros sin usar (Google Tag Manager, 68,4 KiB)**: revisado
      `GoogleAnalytics.tsx` — ya usa `strategy="afterInteractive"` (no bloquea el hilo
      principal durante el LCP) y solo se inyecta si `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` está
      configurado. El peso en sí es del script `gtag.js` que sirve Google, no reducible desde el
      código del sitio — la única palanca adicional sería diferir su carga más allá de
      `afterInteractive` (p. ej. tras la primera interacción real del usuario), no aplicado en
      esta sesión por ser un cambio de comportamiento de medición, no solo de config.

Verificado con `tsc --noEmit` limpio, `pnpm test` (unit) sin regresiones nuevas (el único test en
rojo, `generateBlogPostMetadata.test.ts`, ya fallaba antes de estos cambios — confirmado
reproduciéndolo con `git stash`, no relacionado), build de producción real y HTML servido: sitio
funcionando con cabeceras de seguridad y CSP intactas tras el upgrade de Next.js.

## 25. Revisión de un informe de estrategia SEO/contenido — honeypot y matiz legal de Seguridad (2026-08-16)

El usuario pegó un informe extenso (15 puntos) valorando arquitectura, prioridad de contenido y
extensión de cada página. La mayoría son decisiones de negocio/redacción (cuánto ampliar cada
ficha de servicio, si Administradores de Fincas merece más profundidad, mensajes de "24h" a
distinguir entre atención vs. respuesta comercial) que no se abordan aquí — quedan como criterio
a decidir por el usuario, no como bugs. Dos puntos sí se verificaron contra el código real:

- [x] **Punto #14 del informe — campo "Website" del honeypot visible al usuario**: revisado
      `ContactForm.tsx` y `contactForm.scss` — el campo ya está correctamente oculto
      (`aria-hidden="true"`, `tabIndex={-1}`, `clip: rect(0 0 0 0)` en vez de `display:none` a
      propósito, para no ser detectado por bots de spam que sí comprueban esa propiedad).
      Confirmado en HTML servido real de `/contact`: el campo no es visible para un usuario con
      CSS activado. **No había ningún bug que corregir** — el informe probablemente lo detectó
      inspeccionando el DOM/árbol de accesibilidad (donde el `<label>Website</label>` existe
      textualmente aunque oculto visualmente), no viéndolo renderizado en pantalla.
- [x] **Matiz legal de "Seguridad y CCTV" (Ley 5/2014 de Seguridad Privada)**: investigado el
      criterio legal real antes de tocar nada. El art. 6.4 de la Ley 5/2014 excluye
      explícitamente de su ámbito de aplicación la venta, instalación y mantenimiento de equipos
      de seguridad **no conectados a una Central Receptora de Alarmas (CRA) o a un centro de
      control/videovigilancia externo** — solo la monitorización/respuesta ante intrusión
      conectada a una CRA exige ser empresa de seguridad habilitada (art. 5.1.f, 5.2, 42). El
      contenido actual de `Services.items.security` no menciona CRA ni monitorización externa en
      ningún punto, así que el encuadre general ya es correcto. El único párrafo con ambigüedad
      real era el subservicio "Respuesta ante incidencias" (`icon: Siren`) y su FAQ relacionada:
      "el aviso se trata como **incidencia de seguridad**... la prioridad pasa a ser inmediata"
      podía leerse como respuesta de vigilancia ante una intrusión real, en vez de una avería
      técnica del equipo. Renombrado a "Soporte técnico ante averías" (ES) / "Technical fault
      support" (EN), y reescrita la descripción y la FAQ para dejar claro que es una reparación
      prioritaria de un fallo de equipo (cámara caída, lector que no funciona), sin usar
      "seguridad"/"security incident" para referirse al propio aviso. Ningún otro subservicio
      (CCTV, control de accesos, mantenimiento de equipos) usaba lenguaje de vigilancia/CRA, no
      se tocaron.
      **Esto es una revisión preliminar contra el texto de la ley, no una opinión legal** — el
      propio informe original lo señala correctamente como algo a confirmar con revisión
      jurídica real antes de la versión definitiva, especialmente si el alcance real del
      servicio cambia en el futuro (p. ej. si se empieza a ofrecer monitorización conectada).

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real y
HTML servido: `/services/security` muestra "Soporte técnico ante averías" y "avería prioritaria,
no como mantenimiento ordinario", sin rastro de "incidencia de seguridad" en la página.

## 26. `robots.txt` no bloqueaba en realidad ninguna ruta privada (2026-08-16)

Al revisar el punto #12 del mismo informe (portal de clientes/soporte deberían llevar `noindex`
si son privados), se comprobó `src/app/robots.ts` directamente en vez de fiarse de la valoración:
llevaba un comentario `// Rutas privadas y sus variantes traducidas` dentro del array `disallow`
de la regla `userAgent: "*"`, **pero la línea con el patrón real nunca se escribió** — el
comentario documentaba una intención que no tenía código detrás. Confirmado con
`grep -rn "noindex" src/app` (0 resultados en todo el proyecto) que no había ninguna otra capa
que compensara el hueco.

- [x] **`(auth)` (`/login`, `/forgot-password`, `/reset-password`, `/change-password`,
      `/verify-email` y sus slugs traducidos), `(client-area)/private-area` (portal de cliente
      completo) y `(resident)` (enlaces de un solo uso para vecinos de la app móvil) no estaban
      bloqueados en `robots.txt`** — cualquier buscador podía indexarlos, incluida una pantalla
      de login, justo el tipo de URL que conviene mantener fuera de resultados de búsqueda.
      Añadida la constante `PRIVATE_ROUTE_PATTERNS` con los 13 patrones (comodín de locale
      delante de cada uno, `/*/private-area/`, `/*/login`, etc., para cubrir `/es/` y `/en/` sin
      enumerar cada idioma), aplicada a la regla `userAgent: "*"` y replicada en `Googlebot`/
      `Bingbot` (antes solo tenían `disallow: ["/api/"]`) — los dos user-agents que de verdad
      deciden qué aparece en resultados de búsqueda reales. Los bots de IA con fines GEO
      (`GPTBot`, `Claude-Web`, etc.) se dejaron sin cambios: su propósito es responder preguntas
      sobre la empresa a partir de contenido público, no indexar para tráfico de búsqueda, y
      tampoco tiene sentido que "descubran" una pantalla de login.
      **`/help/support`, señalado con dudas en el mismo informe, se confirmó genuinamente
      público** (vive bajo `(public)`, sin comprobación de sesión en el código) — no necesita
      `noindex`, a diferencia de lo que sugería el informe.
      Revisado también `sitemap.ts`: no incluía ninguna ruta privada (`grep` sin resultados), así
      que no había contradicción por ese lado — el problema era solo la ausencia en `robots.txt`.

Verificado con `tsc --noEmit` limpio, build de producción real y `robots.txt` servido real: las
tres reglas (`*`, `Googlebot`, `Bingbot`) muestran los 13 `Disallow` de rutas privadas; `GPTBot`
y el resto de bots GEO siguen solo con `/api/`, sin cambios.

## 27. Revisión de la ambigüedad "24h" señalada en el mismo informe (2026-08-16)

El informe apuntaba que "Atención 24 horas, 365 días" (home) podía confundirse con "te
responderemos en menos de 24h" (contacto) — la misma cifra prometiendo dos cosas distintas
(disponibilidad de servicio vs. plazo de respuesta comercial). Antes de tocar nada se mapearon
los ~20 usos de "24h"/"365 días" en `views.json`: la mayoría ya tenían un label específico que
evitaba la ambigüedad ("Primera respuesta a tu mensaje", "Urgencias 24h" pegado a un teléfono
clicable, y la propia home ya distinguía "24h" de "48h — Presupuesto cerrado tras la visita" en
la misma cinta de confianza). No se encontró ningún texto que indujera a error de forma clara,
pero se reforzaron dos labels como medida preventiva, a petición explícita del usuario:

- [x] **`Home.trustBar.items.availability.label`**: "Atención los 365 días del año" →
      "Disponibilidad de atención, los 365 días del año" (ES) / "Support every day of the year"
      → "Support availability, every day of the year" (EN) — dice explícitamente que la cifra es
      sobre disponibilidad, no sobre plazo de respuesta.
- [x] **`Contact.hero.subtitle`**: "te responderemos en menos de 24 h" → "te responderemos a tu
      consulta en menos de 24 h laborables" (ES) / "we'll get back to you within 24 h" → "we'll
      get back to your enquiry within 24 working hours" (EN) — "a tu consulta"/"your enquiry" +
      "laborables"/"working hours" deja claro que es el plazo de respuesta al formulario de
      contacto, no una promesa de atención de urgencias.
      **Nota técnica**: ambos textos originales usaban ` ` (espacio de no separación) antes
      de la "h" en vez de un espacio normal — el `Edit` estándar fallaba al no coincidir el
      string, hubo que localizar el carácter exacto con un script Node y sustituirlo así.

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real y
HTML servido: `/` muestra "Disponibilidad de atención, los 365 días del año" y `/contact`
muestra "te responderemos a tu consulta en menos de 24" en el subtítulo del hero.

## 28. "Tipos de cliente" en las 6 fichas de servicio (2026-08-16)

Punto de mayor volumen del mismo informe (prioridad 🔴 Máxima en Limpieza/Mantenimiento, 🟠 Alta
en el resto): ampliar el contenido de las 6 páginas de servicio. Antes de escribir nada se
auditó la estructura real de una ficha de servicio (`ServiceDetailHero`/`Trust`/`Subservices`
con 4 sub-servicios y foto propia/`Faq` con 8 preguntas/`Process`/`Cta`/`Zones`/`Others`): casi
todo lo que pedía el informe ("proceso, ventajas, FAQs, zonas, CTA, enlaces internos") ya existía.
La única pieza ausente en las 6 fichas era una sección explícita de "tipos de cliente" — cómo
cambia el mismo servicio según quién lo contrata.

- [x] **[ServiceDetailAudience.tsx](src/components/ui/services/ServiceDetailAudience.tsx)**
      (nuevo): 3 tarjetas por servicio (comunidades de propietarios, administradores de fincas,
      empresas y centros comerciales), mismo patrón `about__values-grid` que
      `ZoneServices.tsx`/`WhoWeHelpSection.tsx`/`PropertyManagersServices.tsx`. Insertado entre
      `ServiceDetailSubservices` y `ServiceDetailFaq` en las 6 `*ViewPage.tsx` de servicio (tras
      explicar qué incluye el servicio, antes de las preguntas frecuentes).
- [x] **18 bloques de contenido redactados** (6 servicios × 3 tipos de cliente) en `views.json`
      ES/EN, bajo `Services.items.<slug>.audience.<communities|propertyManagers|businesses>`, más
      el eyebrow/título compartido en `Services.detail.audienceEyebrow`/`audienceTitle`. Cada
      bloque es específico del servicio real (no una plantilla que solo cambia el nombre del
      cliente): por ejemplo, en Piscinas el ángulo "administrador de fincas" habla de coordinar
      el calendario de temporada de varias piscinas de la cartera con un mismo equipo, mientras
      que en Conserjería habla de mismo criterio de horarios y sustituciones en varias fincas —
      contenido derivado de cómo cambia genuinamente el servicio según el cliente, sin inventar
      datos de actividad de la empresa (mismo criterio de "no inventar" que el resto de
      bloqueantes documentados en §1).
- [x] **Verificado con análisis de similitud léxica (Jaccard)**, agrupando por tipo de cliente y
      comparando los 6 servicios entre sí (para detectar si, p. ej., el bloque "administradores
      de fincas" se repetía casi igual en las 6 fichas): máximo de similitud 38,2% (ES/EN
      combinados, par cleaning/maintenance en "businesses"), el resto entre 11-33% — sin ningún
      par por encima del umbral que en auditorías anteriores de este documento se consideró
      señal de plantilla duplicada.

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real y
HTML servido: `/services/cleaning` muestra "Cómo se adapta este servicio según quién lo
contrata" y el bloque de administradores de fincas específico de limpieza; `/en/services/
maintenance` muestra "How this service adapts to who's hiring it" y el bloque de empresas
específico de mantenimiento (climatización comercial, no un texto genérico).

## 29. Proceso propio en la landing de Administradores de Fincas (2026-08-16)

Último punto de máxima prioridad del mismo informe: dar más peso a `/for/property-managers`.
La página ya tenía hero, 6 servicios, 4 beneficios (interlocutor único, sustituciones,
inspección, mismo criterio por finca), FAQ propio del segmento (§21) y CTA — de la lista que
pedía el informe ("gestión de múltiples comunidades, interlocutor único, sustituciones, control
de calidad, documentación, incidencias, facturación...") faltaban explícitamente **incidencias**
y **documentación/facturación**, ninguno cubierto todavía en ningún bloque de la página.

- [x] **[PropertyManagersProcess.tsx](src/components/ui/property-managers/PropertyManagersProcess.tsx)**
      (nuevo, junto a `PropertyManagersFaq.tsx`): 4 pasos del ciclo de trabajar con Imora
      gestionando una cartera — alta de una finca nueva, reporte de incidencias centralizado
      (mismo interlocutor con independencia del servicio afectado), facturación separada por
      comunidad (cada finca con su propia factura, lista para la junta de vecinos), y cómo
      escala al incorporar más fincas (mismo proceso, sin curva de aprendizaje nueva). Distinto
      del proceso genérico de contratación (`ServiceDetailProcess.tsx`, 3 pasos pensados para
      una única comunidad): aquí cubre el ciclo completo de gestión de cartera, no un alta
      puntual. Reutiliza las clases `services__process-*` (mismo criterio cross-namespace que
      `PropertyManagersFaq.tsx` con `services__faq-*`). Insertado en `PropertyManagersViewPage.tsx`
      entre `PropertyManagersBenefits` y `PropertyManagersFaq`.
      Contenido nuevo en `ForPropertyManagers.process` (eyebrow, título, 4 pasos) en ES/EN.

Verificado con `tsc --noEmit` limpio, JSON válido en ambos locales, build de producción real y
HTML servido: `/for/property-managers` muestra "El día a día de gestionar tu cartera con Imora",
"Reporte de incidencias centralizado" y "Facturación separada por comunidad" — los dos conceptos
que faltaban frente al informe ya están cubiertos.

## 30. Certificaciones ISO retiradas (§1) y "nuestra historia" real en `/sobre-nosotros` (2026-08-16)

Último punto del informe con datos reales confirmados por los fundadores. Antes de escribir la
historia de la empresa se detectó una contradicción con el bloqueante ya documentado en §1
(ISO 9001/14001/45001/27001 confirmadas como placeholder puro, no en trámite): la web seguía
mostrándolas como reales en 4 sitios distintos, dando la impresión de una empresa ya operando
con historial, justo lo opuesto de lo que iba a decir la nueva sección de historia.

- [x] **Certificaciones ISO retiradas de los 4 sitios donde se mostraban como reales**
      (§1 actualizado de `[ ]` a `[x]`):
      - `TrustBarSection.tsx` (home): quitado el bloque de logos ISO y su columna del grid;
        ajustado `trustBarSection.scss` con `--stats-only` para que los 3 datos restantes
        (24h/48h/0€) ocupen el ancho completo centrados, sin dejar un hueco vacío.
      - `AboutViewPage.tsx`: ya no importa `AboutCertifications` (sección completa fuera de
        `/sobre-nosotros`).
      - `Faq.categories.trust.items.certifications` (ES/EN): quitada la pregunta "¿Estáis
        certificados? Sí, contamos con certificaciones ISO 9001..." de `/help/faq` — afirmaba
        tener certificaciones que no existen, la más grave de las 4 apariciones por ser una
        respuesta directa y afirmativa a la pregunta explícita.
      - `Metadata.routes["/about"]` (ES/EN): quitada la mención de "certificaciones ISO" de
        `description` y `keywords`, verificada la longitud tras el cambio (105/46 caracteres,
        dentro de los límites ya establecidos en el proyecto).
      El componente `AboutCertifications.tsx` y las traducciones (`About.certifications`,
      `Home.trustBar.items.certifications`) se dejan sin borrar para reactivarlo todo cuando la
      empresa obtenga certificaciones reales.
- [x] **[AboutStory.tsx](src/components/ui/about/AboutStory.tsx)** (nuevo): "nuestra historia",
      con los datos reales confirmados directamente por los fundadores (no inventados) — Imora
      nace de aplicar tecnología a un sector tradicionalmente poco digitalizado, fundada por dos
      socios con roles complementarios (desarrollo de producto y gestión de cartera/personal),
      lanzamiento entre septiembre de 2026 y enero de 2027. El texto dice explícitamente que es
      una empresa nueva ("no tenemos décadas de trayectoria"), sin lenguaje que sugiera
      trayectoria inexistente.
      **De paso corregido**: `About.values.title` decía "por qué comunidades... **siguen
      confiando** en Imora" (ES) / "**keep trusting**" (EN) — verbo que asume historial de
      clientes recurrentes que una empresa aún sin lanzar no tiene. Cambiado a "eligen Imora" /
      "choose Imora", presente sin implicar continuidad.

**Ajuste posterior a petición del usuario (mismo día)**: dos correcciones sobre lo anterior.

- [x] **Posición**: `AboutStory` movida al sitio exacto donde iba `AboutCertifications` (entre
      `AboutApproach` y `AboutValues`), no justo después del hero — mismo hueco que dejó la
      sección retirada, en vez de una posición nueva.
- [x] **"con previsión de arrancar" sonaba condicional** — cambiado a una afirmación directa de
      la fecha ("arrancamos entre septiembre de 2026 y enero de 2027" / "we launch between...").
- [x] **Rediseño**: de dos párrafos de texto plano a un layout con la misma jerarquía visual que
      tenía `AboutCertifications` en ese hueco (header centrado + grid de tarjetas debajo) en
      vez de dejarlo más pobre que lo que sustituía. Ahora: párrafo de contexto arriba, grid de
      2 tarjetas de fundador (`about__value-card`/`about__value-icon` reutilizados — icono,
      nombre, rol: "Ismael — Desarrollo de la tecnología y el producto", "Mustafa — Gestión de
      cartera y del equipo de campo") junto a un badge de lanzamiento en `--primary-color` con
      icono de cohete, y una nota de cierre centrada. CSS nuevo en `aboutStory.scss` con este
      grid de 2fr/1fr en desktop.

Verificado con `tsc --noEmit` limpio, JSON válido en los 4 archivos tocados, build de producción
real y HTML servido: `/about` muestra "Ismael"/"Mustafa" con sus roles, el badge "Entre
septiembre de 2026 y enero de 2027", sin rastro de "previsión de arrancar", y en el orden
correcto (Approach → Story → Values). Sin "ISO" en ningún encabezado o párrafo visible (solo en
el JSON de traducciones embebido para el cliente, invisible a indexación de contenido textual),
`<meta name="description">` de `/about` sin mención de ISO, `/help/faq` sin la pregunta de
certificaciones.

## 31. Auditoría SEO/UX externa (21 puntos) — todo menos el blog (2026-08-17)

Respuesta a una nueva auditoría externa de 21 puntos, con alcance explícito "todo menos el
blog". Cubre financiación falsa, consistencia 24h/48h, contenido legal genérico de plantilla
SaaS, páginas de zona demasiado parecidas entre sí, y SEO técnico (robots/sitemap/hreflang).

- [x] **Financiación eliminada.** "Financiación sin intereses" (aplazamiento del 40% de la
      factura) no es una condición comercial real todavía — quitada de dos sitios donde
      aparecía: el mosaico de la home (`FeatureMosaicSection.tsx`, tarjeta `cards.purchase` →
      sustituida por `cards.quote`, "presupuesto cerrado, sin sorpresas") y una segunda
      aparición no detectada en el primer pase, `Faq.categories.quotes.items.financing`
      ("¿Ofrecéis facilidades de pago? Sí, aplazamos el 40%...") — eliminada por completo, no
      suavizada. Verificado con grep exhaustivo (`financ|aplazamos|sin intereses|interest-free`)
      tras el fix: solo queda en un comentario JSDoc, no en contenido servido.
- [x] **Consistencia 24h/48h.** `Services.detail.ctaUrgentLabel` ("¿Es urgente?" → "Urgencias
      24h") y `Home.ctaPrimary.pillC`/`cardLabel` ("Respuesta en 48h" → "Presupuesto en 48h" /
      "Presupuesto cerrado en menos de 48 horas tras la visita") unificados bajo una única
      definición: 24h = primera respuesta de contacto, 48h = presupuesto cerrado tras la visita.
- [x] **FAQ de cobertura actualizada.** `Faq.categories.coverageSchedule.items.coverage`
      mencionaba solo "Madrid capital, Pozuelo de Alarcón, Alcorcón" (obsoleto desde que existen
      las 20 zonas de §4/§21). Actualizado a "Madrid capital y 19 municipios más... (coronas
      noroeste, norte, sur y este)", con enlace a `/zonas`.
- [x] **Título de "Seguridad" ajustado.** `Services.items.security.title`: "Seguridad y CCTV" →
      "Videovigilancia y control de accesos" (ES) / "Security and CCTV" → "CCTV and Access
      Control" (EN), y su `Metadata.routes["/services/security"].title` a juego. Mismo matiz
      legal ya resuelto en auditorías anteriores (Ley 5/2014, Imora no es una empresa de
      seguridad privada) — el título ya no usa la palabra "Seguridad" sola, que sugería esa
      categoría regulada.
- [x] **Categoría "marketing" de cookies retirada por completo**, no solo su ejemplo
      (`Plausible`, nunca implementado): `CookieConsentController.tsx` (interfaz, estado por
      defecto, `acceptAll`/`rejectAll`, el toggle JSX entero), `cookies.json` (ES/EN) y la tabla
      de `legal.json` → `Cookies.sections.tipos.items` (ES/EN). La categoría "Analíticas" se
      queda (Google Analytics es real y condicional a `GOOGLE_ANALYTICS_ID`).
- [x] **Términos y condiciones — error propio corregido en la misma sesión.** Se llegó a
      eliminar por completo "Cuenta de usuario" y "Pagos y facturación" de `TermsView.tsx`
      asumiendo que la landing no tenía cuentas ni facturación reales — **incorrecto**: el
      portal de cliente (`(client-area)`, `next-auth` real) y la sección de facturas
      (`private-area/invoices`) sí existen. Restauradas ambas secciones completas, ajustando
      solo lo que seguía siendo falso incluso con cuentas/facturas reales:
      - `Terms.sections.cuenta.securityText` (ES/EN): quitada la mención de autenticación de dos
        factores (no verificado si existe de verdad a nivel de cuenta — el 2FA que sí existe en
        `ProfileSecurityViewPage.tsx`/`TwoFactorSection.tsx` es otra capa, no lo que este párrafo
        afirmaba).
      - `Terms.sections.pagos` (ES/EN), título "Pagos y facturación" → "Facturación"/"Billing":
        el `list` genérico de pasarela de pago/suscripciones/renovación automática (sin
        Stripe/checkout real en todo el código, verificado por grep) sustituido por el flujo
        real: precio por contrato tras presupuesto cerrado, facturas consultables en el área
        privada, pago por el medio acordado en contrato (no pasarela integrada), reclamaciones
        por los canales de contacto habituales.
      - **Bug encontrado en la restauración**: el `toc` de `Terms` seguía diciendo "6. Pagos y
        facturación"/"6. Payments" aunque el título de la sección ya se había cambiado a
        "Facturación"/"Billing" — corregido para que coincidan.
      Lección aplicada: verificar contra el código real (portal de cliente, `next-auth`,
      facturas) antes de borrar contenido legal como "no aplica", no asumir que una landing no
      tiene backend conectado.
    - [x] **Política de Privacidad — mismo criterio.** Dos afirmaciones verificadas como falsas
      contra el editor de perfil real (`PersonalDataSection.tsx`, sin campo de foto/biografía):
      quitado el ítem "Información de perfil: foto, biografía..." de
      `Privacy.sections.recopilacion.list1` (ES/EN). Y "Delegado de Protección de Datos"/"Data
      Protection Officer" (afirma un rol legal formal RGPD no verificable desde el código)
      rebajado a "Responsable de Privacidad"/"Privacy Officer" — mantiene el contacto real
      (`privacy@imora.es`) sin afirmar una figura DPO formalmente designada.
- [x] **Punto #17 — noindex para páginas de ayuda sin valor SEO.** Nueva función
      `isNoIndexPathname` en `routingUtils.ts` (mismo patrón que `isAuthPathname`/
      `isPrivateRoute`), consumida por `generateMetadata.ts`. Marcadas `noindex, nofollow`:
      `/help` (hub, solo menú), `/help/support` (duplica contacto/footer), `/help/complaints` y
      `/complaints-channel` (canal legal sin intención de posicionar). **`/help/faq` se deja
      fuera a propósito** — tiene contenido propio de cola larga (zonas, precios, servicios) con
      valor de búsqueda real. Las 3 rutas ahora noindexed se quitaron también de `sitemap.ts`
      (listar una página `noindex` en el sitemap es la inconsistencia clásica que un crawler
      penaliza). Verificado en HTML servido: `<meta name="robots" content="noindex, nofollow">`
      en las 4 rutas, `index, follow` sin cambios en el resto; `sitemap.xml` sin esas 3 URLs.
- [x] **Punto #16 (mayor preocupación del informe) — las 20 páginas de zona reescritas de
      cero.** El muestreo inicial ya mostraba contenido específico por zona (no relleno con el
      nombre cambiado), pero varias parejas compartían casi la misma plantilla de frase con
      sustantivos intercambiados: San Sebastián de los Reyes/Leganés (ambas "Limpieza y
      mantenimiento en X"), Getafe/Colmenar Viejo (ambas "Conserjería y mantenimiento en X"),
      Coslada/Collado Villalba (mismo framing de "equipo propio/coordinación" en mantenimiento
      técnico). Reescritos `heroSubtitle`, `context`, `serviceNotes` (6 por zona), `faq` (2 por
      zona) y metadata (`title`/`description`/`keywords`) de las 20 zonas en ES+EN, ahora
      cada una anclada a un hecho/ángulo distinto y verificable del municipio real (parque
      empresarial de Alcobendas, nudo logístico ferroviario de Coslada, base aérea histórica de
      Torrejón, dehesa/casco histórico de Colmenar Viejo, campus de la Carlos III en Leganés,
      21 distritos heterogéneos de Madrid capital...). Cinco zonas comparten "seguridad" como
      ángulo principal del título (Majadahonda, Getafe, Torrejón, Coslada, Torrelodones) pero
      por motivos claramente distintos entre sí (urbanización cerrada, campus universitario,
      base aérea, nudo ferroviario, renta alta), no por plantilla repetida.
      **Bug encontrado de paso**: `collado-villalba.areaLabel` decía "Corona noroeste" pero
      `config/zones.ts` la agrupa como `area: "sur"` — corregido en ES/EN.
- [x] **Punto #21 (SEO técnico) — verificado en vivo, no solo leído.** El informe lo marcaba
      como "no pude verificarlo desde el crawler", así que se comprobó contra el sitio servido
      real (`next build` + `next start` + `curl`), no solo el código:
      - `robots.txt`: correcto — permite rastreo general, bloquea `/api/` y rutas privadas,
        publica `sitemap.xml`. La exclusión de `/help`, `/help/support`, `/complaints-channel`
        es **solo** vía `noindex` (no bloqueadas en `robots.txt`), a propósito: bloquearlas en
        `robots.txt` impediría que el crawler llegara a leer la etiqueta `noindex`, que es la
        práctica recomendada por Google para este caso.
      - `hreflang`: presente y correcto, pero se sirve como cabecera HTTP `Link:
        rel="alternate"` en vez de `<link>` dentro de `<head>` — comportamiento de Next.js 16
        cuando `generateMetadata` vive en `[locale]/layout.tsx` (arquitectura centralizada de
        metadatos de este proyecto, ver `generateMetadata.ts`). Válido según la documentación de
        Google (hreflang por cabecera HTTP está soportado), y `sitemap.xml` ya lleva el mismo
        cruce de idiomas de forma redundante — no es un bug, pero algunas herramientas de
        auditoría SEO solo miran el `<head>` y no la cabecera, así que puede seguir apareciendo
        como "hreflang no encontrado" en análisis futuros aunque sí esté presente.
      - **Hallazgo nuevo, no estaba en el informe**: todas las páginas públicas (home, zonas,
        servicios...) se sirven con `Cache-Control: private, no-cache, no-store, max-age=0`,
        confirmado por `curl -I` en `/`, `/services` y `/zonas/leganes` por igual. Causa: el
        layout raíz (`[locale]/layout.tsx`) llama `getServerSession()` para resolver el tema
        (`forcedTheme`) si hay sesión activa, lo que fuerza renderizado dinámico sin caché en
        **todo** el sitio, incluidas las páginas 100% públicas de marketing sin ningún dato de
        sesión. Puede penalizar TTFB/Core Web Vitals y evita el cacheo en CDN. **No corregido a
        propósito** (decisión del usuario, 2026-08-17): desacoplar la lectura de sesión del
        layout público es un cambio de arquitectura con riesgo real de romper el tema
        personalizado, no algo para tocar deprisa dentro de esta ronda. Queda documentado como
        TODO para abordar con más tiempo.
      - [ ] **TODO — cachear páginas 100% públicas.** Investigar mover `getServerSession` (y el
            `forcedTheme` que depende de él) fuera del layout compartido por rutas públicas y
            privadas, para que `/`, `/zonas/*`, `/services/*` etc. puedan servirse con
            `Cache-Control` cacheable sin perder el tema personalizado en el portal de cliente.

Verificado en cada punto con el patrón ya establecido en este documento: `tsc --noEmit` limpio,
JSON válido en los 4 locales tocados, `rm -rf .next && next build` real, servidor levantado en un
puerto nuevo cada vez y comprobado con `curl` contra el HTML/headers servidos (no solo el código
fuente), y `npx vitest run --project=unit` con el mismo resultado de siempre (361 passed, 1
failed — `generateBlogPostMetadata.test.ts`, fallo preexistente no relacionado con nada de este
punto).

## 32. Tres hallazgos reales de Lighthouse/DevTools en producción (2026-08-17)

El usuario pegó tres hallazgos literales de una auditoría de Lighthouse/DevTools contra
imora.es en producción (no del crawler de contenido de las secciones anteriores).

- [x] **Enlaces idénticos con destinos distintos.** `Routes["/help/complaints"]` y
      `Routes["/complaints-channel"]` compartían el mismo texto "Canal de reclamaciones" en
      `navigation.json` (ES/EN) apuntando a dos páginas reales y distintas: `/ayuda/reclamaciones`
      es el asistente donde se presenta la reclamación de verdad (`ComplaintsCreateWizard.tsx`,
      `POST /public/complaints`), y `/canal-de-reclamaciones` es la página legal/informativa que
      explica qué es el canal y enlaza al asistente. Renombrado a petición explícita del usuario:
      `/help/complaints` → "Denuncias" (ES) / "File a complaint" (EN); `/complaints-channel` se
      queda como "Canal de reclamaciones" (la página formal/legal). De paso, mismo ajuste en el
      `title` de `Metadata.routes["/help/complaints"]` (ES/EN), que tenía el mismo problema de
      fondo aunque Lighthouse no lo señalara explícitamente.
- [x] **CSP sin fallback retrocompatible en `script-src`.** Añadido `'unsafe-inline'` al final de
      la directiva en `csp.ts`. No reabre la protección real: cualquier navegador que reconoce
      `nonce-*` (CSP Level 3) ignora `'unsafe-inline'` por completo cuando hay un nonce válido en
      la misma directiva — el añadido solo evita que un navegador antiguo sin soporte de nonces se
      quede sin ninguna política de scripts en vez de una parcial, que es justo lo que pedía
      Lighthouse.
- [x] **Imagen del mosaico de home sobredimensionada** (`mosaic-feature.jpg`,
      `FeatureMosaicSection.tsx`): Lighthouse midió una descarga de 449×427 para un hueco mostrado
      de 364×243, con 20 KiB de ahorro estimado. Causa raíz: el `sizes="(min-width: 1024px) 256px,
      90vw"` original declaraba el 90% del viewport como ancho del hueco en mobile/tablet, pero el
      contenedor real (`.home__tile-feature-media` dentro de `.home__container` con su padding y
      el padding propio del tile) nunca llega a ocupar el 90vw — con `sizes` conteniendo una
      unidad relativa, Next.js activa el modo de candidatos "responsive" (`imageSizes +
      deviceSizes` combinados) y ese 90vw sobreestimado hacía que eligiera un candidato de
      `deviceSizes` innecesariamente grande. Corregido a
      `sizes="(min-width: 1024px) 256px, (min-width: 640px) 45vw, 70vw"`, más ajustado al ancho
      real del contenedor en los tramos intermedios. **Primer intento descartado**: subir
      `width`/`height` de 256×181 a 364×243 en vez de tocar `sizes` — verificado con `curl` que
      esto empeoraba el problema (Next pasaba a usar solo `deviceSizes`, cuyo candidato más
      pequeño es 640px de ancho, peor que los 384px disponibles en `imageSizes` con `width={256}`
      fijo); revertido antes de dar el fix por bueno.

Mismo patrón de verificación de siempre: `tsc --noEmit` limpio, `next build` real, servidor en
puerto nuevo y `curl` contra el HTML/headers servidos — confirmado el `<title>`/texto de enlace
distinto en `/help/complaints` vs `/complaints-channel` (ES y EN), la cabecera
`Content-Security-Policy` con `'unsafe-inline'` al final de `script-src`, y el `sizes` nuevo en el
`<img>` servido de `mosaic-feature.jpg`. `npx vitest run --project=unit`: 361 passed, 1 failed
(mismo fallo preexistente de siempre).

## 33. Bug real de teléfono de urgencias en `/help/support` (2026-08-17)

El usuario señaló, con capturas literales del sitio en producción, que `/help/support` mostraba
el mismo número (+34 913 559 135) tanto en "Llámanos" como en "Urgencias 24 horas", mientras que
más abajo en la misma página (la tarjeta de sede, `SupportInfo.tsx`) sí mostraba el número
correcto de urgencias (+34 900 123 456) — y `/contact` también lo tenía bien. Confirmó
explícitamente el criterio: **900 = urgencias, 913 = oficina/general, en todas las páginas**.

- [x] **Bug real en [SupportChannels.tsx](src/components/ui/support/SupportChannels.tsx).** La
      tarjeta `emergency` usaba `ENV.COMPANY_PHONE` (913) en vez de `ENV.COMPANY_EMERGENCY_PHONE`
      (900) — el docstring del componente incluso lo documentaba como intencional ("mismo número,
      según `ENV.COMPANY_SCHEDULE`"), una decisión previa que quedó obsoleta. Corregido el `href`
      (`tel:`) y el `value` mostrado de esa tarjeta a `ENV.COMPANY_EMERGENCY_PHONE`, y actualizado
      el docstring.
- [x] **Auditoría del resto del sitio** (`grep` de `COMPANY_PHONE`/`COMPANY_EMERGENCY_PHONE` en
      los 9 archivos que los usan): sin más bugs — `ContactMapSection.tsx`, `ServiceDetailCta.tsx`
      (urgencia, ya usaba 900), `HomeCtaPrimary.tsx`/`Footer.tsx`/`OrganizationJsonLd.tsx`
      (contacto general, ya usaban 913 correctamente) estaban ya bien antes de este fix.

Verificado con `curl` contra `/help/support` servido en producción real: "Llámanos" →
`tel:+34913559135`, "Urgencias 24 horas" → `tel:+34900123456`, cada uno con una única aparición
visible en la página. `/contact` sin cambios (ya estaba bien). `tsc --noEmit` limpio, `next build`
real, `npx vitest run --project=unit`: 361 passed, 1 failed (mismo fallo preexistente de siempre).

## 34. Política de Privacidad reescrita de fondo — todavía sonaba a plantilla SaaS (2026-08-17)

El usuario, tras las correcciones puntuales de §31 (foto/biografía, DPO), insistió en que la
Política de Privacidad seguía sonando a plantilla heredada de una app con cuentas de usuario
genéricas, no a una política redactada para Imora: mencionaba pagos, alojamiento, adquisiciones
empresariales y "procesar transacciones" — nada de eso describe lo que la web hace de verdad
(formulario de contacto/presupuesto, portal de cliente con facturas, Google Analytics
condicional). Pidió explícitamente que se centrara en: formulario de contacto, clientes
potenciales, comunicaciones comerciales, cookies, Analytics/Ads, almacenamiento, proveedores
reales, plazos de conservación y derechos.

Verificado contra el código antes de reescribir (mismo criterio de §31, para no repetir el error
de sobre-editar sin comprobar): hay un formulario de contacto real con `marketingConsent` y
`attributionConsent` (`contact.schema.ts`), Google Analytics real y condicional a
`GOOGLE_ANALYTICS_ID`, portal de cliente real (cuentas, facturas), pero **no** hay Google Ads
(único match en el código es un comentario que confirma que no está implementado), **no** hay
página de empleo construida (`/empleo` da 404, ya documentado en §0), y no se puede verificar
desde este repo (frontend) qué proveedor de hosting/email usa el backend — así que no se
mencionan candidatos/trabajadores como categoría de interesados, y los proveedores se describen
en términos genéricos honestos ("proveedores tecnológicos: alojamiento, envío de email,
analítica") sin nombrar marcas no verificadas, decisión confirmada por el usuario.

Reescritas las 9 secciones relevantes de `Privacy.sections` en ES/EN
([legal.json](src/i18n/locales/es/legal.json)):

- **§1 Recopilación**: "Información de cuenta: nombre, email y contraseña al registrarte" (no
  hay registro público de cuenta en la landing) sustituido por lo que se recoge de verdad:
  datos del formulario de presupuesto/contacto, consentimiento de comunicaciones comerciales, y
  datos del área de cliente si contratas un servicio.
- **§2 Cómo usamos tus datos**: "Procesar transacciones y enviar la información relacionada"
  (lenguaje de e-commerce) sustituido por los usos reales — responder a la solicitud de
  presupuesto, prestar el servicio contratado, enviar comunicaciones comerciales solo con
  consentimiento expreso, analítica agregada con cookies aceptadas.
- **§3 Compartir información**: "alojamiento, pagos" genérico sustituido por "proveedores
  tecnológicos" (hosting, email, analítica) sin nombrar marcas no verificadas, y añadido
  "personal técnico asignado a tu servicio" (relevante de verdad para una empresa de
  multiservicios). Quitado "Transferencias empresariales" (fusión/adquisición) — evento
  corporativo hipotético sin relación con lo que Imora es hoy.
- **§5 Seguridad**: quitado "Auditorías de seguridad periódicas" (no verificable, misma
  categoría que el DPO ya corregido en §31); el resto ajustado al contexto real (contraseña del
  área de cliente, no de un registro público).
- **§8 Transferencias internacionales**: antes abstracta y sin anclar a nada; ahora explícita
  sobre el único caso real verificado — Google Analytics puede transferir datos agregados a
  EEUU cuando se aceptan las cookies analíticas.
- **Fecha de actualización** (`updatedDate`) de `Terms`/`Privacy`/`Cookies` (las tres tocadas
  hoy) actualizada de "1 de enero de 2025" a "17 de agosto de 2026" en ES/EN. `Complaints` se
  deja en 2025 a propósito — no se ha tocado su contenido en esta sesión.

## 35. Cookies — fila de la tabla que no correspondía a ninguna cookie real (2026-08-17)

El usuario pidió, además de la fecha, que la tabla de cookies coincidiera exactamente con lo que
la web instala de verdad. Verificado contra
[CookieConsentController.tsx](src/components/ui/cookies/CookieConsentController.tsx): la
preferencia de consentimiento se guarda en `localStorage` bajo la clave `na:cookie-consent`, no
en una cookie — la tabla afirmaba que existía una cookie `cookie_consent` que nunca existió.

- [x] Quitada la fila `cookie_consent` de `Cookies.sections.tabla.rows` (ES/EN) — bug real, no
      matiz de redacción.
- [x] Añadida `Cookies.sections.tabla.intro` (ES/EN), nueva clave, explicando que la preferencia
      vive en `localStorage`, no en una cookie — y añadido su render en
      [CookiesView.tsx](src/views/(public)/terms/CookiesView.tsx) (`<p>{ps('tabla.intro')}</p>`
      antes de la tabla), que antes no leía esa clave.
      El resto de la tabla (`NEXT_LOCALE`, `next-auth.session-token`, `_ga`, `_ga_XXXXXX`) ya se
      había verificado como real en una ronda anterior de esta misma sesión — sin cambios.

Verificado con `tsc --noEmit` limpio, JSON válido en los 4 locales, `rm -rf .next && next build`
real, servidor en puerto nuevo y `curl` contra el HTML servido: fecha "17 de agosto de
2026"/"August 17, 2026" en `/privacy-policy` y `/cookies-policy` (ES/EN), contenido nuevo de
`recopilacion`/`compartir` confirmado, cero apariciones de "contraseña al registrarte", "foto,
biografía" o `cookie_consent` en el HTML servido, y el aviso de `localStorage` presente en las 4
páginas (ES/EN). `npx vitest run --project=unit`: 361 passed, 1 failed (mismo fallo preexistente
de siempre).

## 36. La bolsa de empleo cierra las tres exclusiones de `/empleo` (2026-08-20)

El módulo de empleo (`requisitos-empleo.md`) construye de verdad las páginas que faltaban, así que las
tres exclusiones que arrastraba el proyecto por ese 404 dejan de tener motivo y se quitan **juntas**, que
es lo que no se hizo la última vez:

- **`sitemap.ts`**: fuera el comentario de «las que todavía no existen (`/careers`)». `/empleo` entra en
  `SITEMAP_ROUTES` (prioridad 0.7, `daily`), y las ofertas vigentes y las páginas de ciudad se añaden con
  `buildCareersSitemapEntries()`, mismo patrón que los posts del blog.
- **`Footer.tsx`**: enlace restaurado en la columna de contacto, y borrado el comentario que decía
  «volver a añadirlo cuando exista la página de verdad».
- **Este documento**: el punto de la auditoría #5 (§17) queda marcado como cerrado.

Lo que aporta el módulo, en términos de SEO:

- **Datos estructurados `JobPosting`** en la ficha de cada oferta, y solo ahí. Con `validThrough` real
  (la caducidad es obligatoria en el backend justo por esto) y **sin `baseSalary`** cuando la oferta no
  publica el importe: un dato estructurado que no coincide con lo que ve el usuario es motivo de
  penalización, no un detalle.
- **Páginas de ciudad indexables** (`/empleo/ciudades/<ciudad>`), que son las que pueden posicionar por
  «trabajo en Getafe». Una ciudad sin ofertas responde **404**, no una página de relleno.
- **Las URLs con filtros van `noindex, follow`**, y el canónico de `?citySlug=<ciudad>` apunta a la
  página de ciudad. Es la fuente clásica de contenido duplicado de cualquier buscador con facetas.
- **Una oferta cerrada** responde `200` con `noindex, follow` y una página que explica que el proceso
  terminó (el enrutador de Next no permite emitir un `410` desde una página; ver `requisitos-empleo.md`,
  10.7). Sale del índice sin dejar a nadie en una página de error, y sin que la URL quede como error en
  Search Console.
- **`robots.ts`** bloquea `/empleo/candidatura/` y `/careers/applications/` en los cuatro patrones (con y
  sin prefijo de idioma), para el rastreador genérico, los de IA, Googlebot y Bingbot. Con la lección de
  §26 aprendida: hay una prueba (`test/careersRobots.test.ts`) que **comprueba que los patrones casan**
  con las URLs reales y que no bloquean el buscador ni las fichas.

**Un soft 404 encontrado y arreglado por el camino**: las rutas de empleo se escribieron con `loading.tsx`
y eso hacía que una ciudad sin ofertas respondiera **200 con el cuerpo de un 404** — el Suspense confirma
el estado antes de que la página pueda lanzar `notFound()`. Comprobado en los dos sentidos y quitados los
dos `loading.tsx` (ver `requisitos-empleo.md`, 10.6). Merece la pena tenerlo presente para cualquier ruta
futura que dependa de responder 404, 410 o una redirección.

## 37. Cualificación en el formulario de contacto (2026-08-20)

Cuatro desplegables y un campo condicional, todos opcionales: qué es quien escribe, qué servicio le
interesa, en qué municipio y para cuándo; y, **solo si elige «administrador de fincas»**, cuántas
gestiona. El contrato está en `requisitos-leads.md` §7.2.1 del backend; aquí van las decisiones de la
web:

- **Los municipios salen de `ZONES`**, la misma lista que genera las 20 páginas de zona. El nombre que se
  lee en el desplegable y el de la página desde la que ha llegado quien escribe son el mismo dato, no dos
  copias que puedan discrepar.
- **Los servicios se derivan de `SERVICE_SLUGS`** (`config/leadQualification.ts`) en vez de escribirse
  otra vez: los valores que espera la API son exactamente esos slugs en mayúsculas, así que un servicio
  nuevo en la web aparece en el formulario solo.
- **El campo de fincas aparece al elegir el perfil**, junto al desplegable que lo provoca y no al final
  del formulario. Preguntárselo a todo el mundo sería preguntar por algo que a la mayoría no le aplica, y
  la API además lo rechaza con un 400 con cualquier otro perfil.
- **Yup valida contra las opciones reales**, incluida la lista de municipios. No es desconfianza del
  desplegable: sin esa comprobación, un valor que la API rechaza llegaría a quien rellena el formulario
  como «no se ha podido enviar tu mensaje», sin decir qué campo.
- **El `when` del número de fincas no es adorno**: si se elige administrador, se teclea un número y luego
  se cambia de perfil, el campo desaparece de la vista pero se queda en Formik con lo último escrito.
  Sin la condición, ese resto bloquearía el envío por un campo que ya no existe en pantalla — y el
  contenedor tampoco lo manda.
- **Las etiquetas son preguntas** («¿Quién nos escribe?», no «Perfil»): son campos opcionales en medio de
  un formulario, y una pregunta invita a contestar donde una etiqueta de base de datos invita a saltar.

### La sesión del portal se cerraba a los 15 minutos, por lo mismo que la de la intranet

Los dos frontales tenían **el mismo par de defectos**, y el del portal no se había mirado:

1. **La renovación no se guardaba.** El callback `jwt` renueva el `accessToken` desde donde haga falta,
   pero **solo el route handler de NextAuth escribe la cookie de sesión**: una renovación ocurrida en un
   Server Component o en una Server Action vale para esa petición y se pierde. Encadenado con
   `portalRefreshTokenCache`, la sesión se apaga sola — cada petición relee el token viejo de la cookie, la
   primera renovación guarda el par nuevo en la caché indexado por el token viejo, las siguientes lo
   devuelven **sin llamar a la API**, y cuando ese par caduca de verdad el latido recibe un 401.
2. **Ese 401 se leía como una revocación**, y cerraba la sesión.

El arreglo es el mismo: `usePortalSessionMonitor` llama a `update()` cuando al token le queda menos que
`AUTH_TOKEN_REFRESH_MARGIN_MS` —eso pasa por el route handler y persiste el par nuevo—, y
`getPortalSessionStatus` solo trata un 401 como revocación si **nuestro** `accessToken` todavía debería
valer. La caducidad va en una `ref` sincronizada por un efecto: leerla del closure del intervalo la dejaba
congelada en el valor del montaje, y `update()` se habría disparado cada 15 segundos para siempre.

`accessTokenExpires` pasa a estar en la sesión del cliente para que el vigilante pueda decidir. No es un
dato sensible —es una marca de tiempo— y los `backendTokens` siguen sin salir del servidor.

**Lo que aquí no se ha podido probar en vivo:** en esta base de datos no existe ninguna cuenta de portal
de cliente, así que la reproducción con el token acortado a 90 s se hizo en la intranet, donde el
mecanismo es idéntico. En el portal la corrección está cubierta por `test/portalSessionStatus.test.ts`,
que fija las cuatro combinaciones del 401 (token vigente, token caducado, sin sesión, y el `revoked` que
devuelve la API con un 200).

El criterio de no cerrar sesión ante un fallo de renovación (`session.error`) **no se ha tocado**: ya
estaba decidido a propósito, porque provocaba el «inicias sesión y te devuelve al principio».

## 38. El 0% de consentimiento de GTM: tres causas, y solo una era del banner (2026-08-21)

GTM levantó un aviso urgente en *Calidad del contenedor*: «Verifique si se ha configurado el modo
de consentimiento, ya que se ha detectado una tasa de consentimiento del 0%». Investigándolo
salieron **tres cosas distintas** — dos bugs reales de esta base de código y una tercera que vive
en el contenedor y no en el repositorio. Ninguna de las dos primeras se ve en desarrollo.

- [x] **La CSP cerraba `connect-src` a la propia medición.** La condición que añade los orígenes
      de Google colgaba de `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` —la variable de la instalación
      directa de `gtag.js`— y **no de `NEXT_PUBLIC_GTM_ID`**, que es la que enciende el
      contenedor. Con contenedor y sin esa otra variable, en producción pasaba lo peor posible:
      `script-src` colaba por `'strict-dynamic'` (el script de arranque va con nonce y es él
      quien carga `gtm.js`), así que **GTM parecía funcionar**, pero `connect-src` no se
      beneficia de `'strict-dynamic'` y cada envío a `googletagmanager.com/g/collect` y a
      `*.google-analytics.com` se bloqueaba uno a uno. El banner pedía consentimiento, el
      `consent update` se emitía, y a Google no llegaba nada: para el diagnóstico de GTM es
      indistinguible de que nadie acepte. `analyticsEnabled` pasa a leer `NEXT_PUBLIC_GTM_ID`, y
      `GOOGLE_ANALYTICS_ORIGINS` se renombra a `GOOGLE_MEASUREMENT_ORIGINS`, que es lo que son.
      Mismo patrón que los tres hallazgos de §32, encontrados también solo en producción: **la
      CSP únicamente se manda con `NODE_ENV=production`** (`proxy.ts`), así que en local todo
      funcionaba y el bloqueo solo se veía en la consola del navegador.
- [x] **Había dos instalaciones de GA4, y la segunda se saltaba el consentimiento entero.**
      `GoogleAnalytics.tsx` (§12) cargaba `gtag.js` y llamaba a `gtag('config', …)` **sin
      declarar ningún `consent default` y sin escuchar el banner**, montado además en el layout
      raíz de locale — o sea en todas las páginas, incluida el área privada de cliente, donde
      [GoogleTagManager.tsx](src/components/analytics/GoogleTagManager.tsx) (el que sí monta el
      Consent Mode v2) no llega. Sin `consent default` declarado, gtag.js mide a pleno y escribe
      las cookies `_ga` al cargar, antes de que el visitante toque el banner; y donde sí
      coincidía con el contenedor, duplicaba las visitas contra la etiqueta de Google
      (`send_page_view: true`). Los dos scripts comparten `window.dataLayer`, así que *si* el
      arranque de GTM corriera primero su `default` le aplicaría también — pero son dos
      `afterInteractive` en layouts distintos y el orden no está garantizado. Borrado el
      componente, su uso en el layout y `GOOGLE_ANALYTICS_ID` de `config/env.ts`. **La medición
      pasa a ser una sola cosa: el contenedor.** Deja obsoleta la ficha «GA4: implementado» de
      §12.
- [ ] **El contenedor sigue con el placeholder `G-XXXXXXXXXX`** en `CFG - GA4 ID de medicion`
      (visto por el usuario en *Etiquetas de Google*: ID y destino con las X sin resolver). Las
      cinco etiquetas de GA4 heredan esa variable, así que **disparan contra una propiedad que no
      existe** y no se mide nada, con o sin consentimiento. Se arregla en la interfaz de GTM, no
      aquí: *Variables → `CFG - GA4 ID de medicion`* → el `G-…` real → publicar. Es el paso «Lo
      que hay que rellenar» de [analytics/README.md](analytics/README.md), que se saltó al
      importar el contenedor. **Es la tercera vez que el mismo placeholder muerde** — la nota de
      §12 ya lo cazó una vez en el `.env` local; por eso ahora está documentado en el README con
      un aviso explícito de qué se ve en GTM cuando pasa.
- [x] **Y sí, el banner cambió, pero por otro motivo.** Petición del usuario en la misma sesión:
      la X del panel pasa a **aceptar todo** (y Escape con ella, que ya seguía a la X), y
      «Rechazar opcionales» se renombra a **«Aceptar solo necesarias»** (clave `rejectAll` →
      `acceptNecessary`, handler incluido, ES/EN, `closeAriaLabel` a juego para que el lector de
      pantalla no anuncie lo contrario de lo que hace el botón). **Advertido y decidido por el
      usuario:** cerrar con la X y contarlo como consentimiento es el patrón que el EDPB
      considera consentimiento no válido, porque exige una acción afirmativa e inequívoca. Esto
      puede subir el consentimiento de *analytics*; **no mueve el aviso de GTM**, que es lo que
      llevó a los dos bugs de arriba.

**Lo que se ha dejado a propósito.** Las tres señales de publicidad (`ad_storage`, `ad_user_data`,
`ad_personalization`) siguen fijadas a `denied` en `CONSENT_SIGNAL_RULE`, sin categoría que las
pueda conceder, así que su tasa de consentimiento es 0% por construcción. No se toca: las tres
etiquetas de Ads del contenedor están en pausa y el usuario confirma que las campañas son cosa del
futuro. El día que las haya, hay que devolver la categoría `marketing` al banner (paso 2 del README
de `analytics/`) y añadir `https://td.doubleclick.net` a `GOOGLE_MEASUREMENT_ORIGINS`.

**Detalle de despliegue que conviene no olvidar.** `NEXT_PUBLIC_GTM_ID` es una `NEXT_PUBLIC_*`: su
valor se **incrusta en el build**, no se lee en cada petición. Ponerla en Vercel sin volver a
desplegar no cambia ni la CSP ni el contenedor. Y el orden importa: primero el `G-…` real en GTM y
publicar, después desplegar esto — al revés se queda un rato sin datos, porque la vía directa que
igual estaba midiendo desaparece con este cambio.

Verificado con `tsc --noEmit` limpio, `eslint` limpio, `next build` de producción real (necesita
`API_BASE_URL`, `NEXTAUTH_URL` y `NEXTAUTH_SECRET` en el entorno del proceso, que no los lee de
`.env.development`) y el servidor de producción servido en un puerto nuevo: la cabecera CSP lleva
los cuatro orígenes de Google en `script-src` **y** en `connect-src` gobernados por
`NEXT_PUBLIC_GTM_ID`, `gtag/js?id=` desaparece del HTML servido (0 ocurrencias) y el arranque del
contenedor sigue presente con su `consent default` en el chunk de cliente. Comprobado además que
arrancar el mismo build con y sin la variable en el entorno da una CSP idéntica, que es lo que
demuestra el incrustado en build time. Los textos nuevos del banner confirmados en el HTML servido
en los dos idiomas («Aceptar solo necesarias» / «Accept only necessary»), sin rastro de los
antiguos. `npx vitest run --project=unit`: 451 passed (39 ficheros), ninguno fallido.
