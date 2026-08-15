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

**No copiar la misma página cambiando solo el nombre del municipio** (contenido duplicado,
penalizable). Cada página de zona necesita contenido específico: referencias a esa zona en
concreto, no relleno genérico.

Convención de rutas: seguir el patrón ya usado en `config/pathnames.ts` (clave canónica en
inglés, slug traducido en español) — por ejemplo:

```
"/zones": { en: "/zones", es: "/zonas" }
"/zones/[city]": { en: "/zones/[city]", es: "/zonas/[ciudad]" }
```

Zonas candidatas, priorizadas por nivel — **ninguna está confirmada como operativa**, es una
propuesta a validar con la empresa antes de crear una sola página. No publicar ninguna zona
donde Imora no preste servicio de verdad (riesgo de inconsistencia NAP y de prometer
cobertura falsa a un cliente potencial).

**Criterio de priorización**: cercanía a Madrid capital y perfil de vivienda en comunidad
(más comunidades de propietarios = más mercado potencial para conserjería/limpieza/
mantenimiento), no volumen de búsqueda medido (eso solo lo dará Search Console una vez
configurado, §12). Reordenar cuando haya datos reales de tráfico/clientes.

| Nivel | Municipios | Por qué este nivel |
|---|---|---|
| **Ya confirmadas** (en la web hoy) | Madrid capital, Pozuelo de Alarcón, Alcorcón | Ya mencionadas en `views.json` — punto de partida real, no propuesta. |
| **Nivel 1** — corona noroeste, alto perfil de comunidades | Majadahonda, Las Rozas de Madrid, Boadilla del Monte, Alcobendas | Zona de renta alta con predominancia de urbanizaciones y comunidades cerradas — el perfil de cliente que más externaliza conserjería/seguridad/piscinas. Contigua a Pozuelo, ya confirmada. |
| **Nivel 2** — corona norte y sur con volumen de comunidades | San Sebastián de los Reyes, Tres Cantos, Getafe, Leganés, Fuenlabrada, Móstoles | Municipios grandes con mucho parque de vivienda en bloque — volumen alto de comunidades de propietarios, aunque el perfil de gasto medio en servicios externalizados sea más variable que el Nivel 1. |
| **Nivel 3** — resto de la corona metropolitana | Torrejón de Ardoz, Coslada, Rivas-Vaciamadrid, Colmenar Viejo, Torrelodones, Collado Villalba, Arganda del Rey | Completa la cobertura de la Comunidad de Madrid; menor prioridad de lanzamiento salvo que la empresa confirme que ya opera ahí activamente. |

**TODO — bloqueante**: validar con la empresa, municipio por municipio, cuáles son
operativos de verdad hoy. Sugerencia de proceso: empezar solo por el Nivel 1 (4 municipios)
+ las 3 ya confirmadas, publicar esas páginas, y ampliar a Nivel 2/3 según vaya habiendo
clientes o solicitudes reales en esas zonas — evita publicar 20 páginas de golpe sobre
cobertura no verificada.

Cada página de zona debe enlazar a los 6 servicios, y cada página de servicio debería, a su
vez, enlazar a las zonas relevantes (enlazado interno bidireccional, §11 de la auditoría
original).

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

- [ ] Página `/servicios-para/administradores-de-fincas/` (o integrarlo como sección dentro
      de `/about` o una landing propia — decidir con la empresa el nivel de inversión).
- [ ] Contenido de blog dirigido a este segmento (ver lista de títulos propuestos en el
      análisis original, sección "9. Hay que crear contenido para administradores de fincas").

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
- [ ] **`WebSite` schema: no existe** (verificado, ningún archivo lo genera). Evaluar si
      añadir con `SearchAction` solo si el blog/sitio tiene buscador interno real; si no,
      omitirlo no penaliza.
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
5. **Fase 4 — SEO local** (§4): páginas de zona, con contenido real por municipio.
6. **Fase 5 — Segmento administradores de fincas** (§6).
7. **Fase 6 — Blog** (§7): 27 artículos ya mapeados en `keyword-map.md` §2, listos para
   redactarse desde la intranet (no en este repo) — luego cadencia mensual.
8. **Fase 7 — Prueba social + Google Business Profile** (§9).

Cada fase se aborda como su propio bloque de trabajo (probablemente varias sesiones) — este
documento es la referencia viva a actualizar según avance, no un plan cerrado de una sola vez.
