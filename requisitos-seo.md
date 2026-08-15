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
  (`src/i18n/locales/es/views.json`, clave `zones`). No hay páginas de zona.
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
- [ ] **Certificaciones ISO — no publicar como reales.** La web actual (heredada de la
      plantilla) menciona ISO 9001/14001/45001/27001 como si la empresa las tuviera.
      Confirmado que hoy son placeholder. Hasta que la empresa confirme cuáles tiene de
      verdad (o están en trámite): quitar la mención, o cambiarla a «en proceso de
      certificación» solo si es cierto. No crear la página `/certificaciones/` del §9 hasta
      resolver esto.
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

- [ ] Contrastar el `<title>`/`<h1>` real de la home (`generateMetadata`/`views/home`) contra
      la intención comercial. La auditoría propone algo como:
      - Title: `Empresa de servicios para comunidades en Madrid | Imora`
      - H1: `Servicios integrales para comunidades, empresas y edificios en Madrid`
      Decidir el texto final junto con la empresa, no inventarlo aquí.
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
      el enlace hasta que la página exista de verdad.
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
