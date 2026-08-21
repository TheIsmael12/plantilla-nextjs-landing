# Requisitos — Bolsa de empleo (web pública)

## 0. Objetivo

La parte pública de la bolsa de empleo: un **buscador de ofertas con filtro por ciudades**, la ficha de cada oferta, el formulario de candidatura con CV y la página de seguimiento del candidato.

El dominio, las entidades y los endpoints están en `requisitos-empleo.md` de `plantilla-nestjs`. Este documento no los repite: describe qué se pinta, con qué URL, qué se indexa y qué no.

Dos cosas condicionan el diseño más que ninguna otra:

1. **Esto se busca en Google, no en la web.** Casi nadie entra en una web corporativa y navega hasta «Empleo»: se busca «trabajo de conserje en Getafe». Así que la arquitectura de URLs y los datos estructurados no son un extra al final, son el diseño (ver secciones 2 y 5).
2. **`/empleo` es hoy un 404 conocido.** La ruta está declarada en `config/pathnames.ts`, tiene su entrada en `config/routing.ts` y sus etiquetas en `navigation.json`, pero nunca se construyó la página. La auditoría #5 (`requisitos-seo.md`, §17) lo detectó, y por eso está excluida a propósito del `sitemap.ts` y sin enlace en el footer. **Este módulo cierra esas tres exclusiones**, y quitarlas forma parte del trabajo, no es una tarea aparte (ver 6.3).

Sigue las convenciones de `requisitos.md` de `plantilla-nextjs` (estructura de `views/`, contrato `page.tsx` → `*ViewPage.tsx`, Server Components por defecto, Formik + Yup, JSDoc) y las de `requisitos-seo.md` de este proyecto.

---

## 1. Estructura de ficheros

Una carpeta por ruta bajo `views/(public)/careers/`, con el `*ViewPage.tsx` como único punto de entrada y los componentes propios en `components/`:

```text
src/app/[locale]/(public)/careers/
  page.tsx                          → CareersViewPage        (buscador)
  loading.tsx
  [slug]/page.tsx                   → JobDetailViewPage      (ficha)
  [slug]/loading.tsx
  cities/[city]/page.tsx            → CityJobsViewPage       (ciudad, indexable)
  applications/[token]/page.tsx     → ApplicationStatusViewPage (seguimiento)

src/views/(public)/careers/
  CareersViewPage.tsx
  JobDetailViewPage.tsx
  CityJobsViewPage.tsx
  ApplicationStatusViewPage.tsx
  components/
    JobSearchBar.tsx        JobFilters.tsx         JobFiltersDrawer.tsx
    JobCard.tsx             JobList.tsx            JobListEmpty.tsx
    JobDetailHeader.tsx     JobDetailBody.tsx      JobBenefits.tsx
    JobApplyForm.tsx        JobApplyCvField.tsx    JobApplySuccess.tsx
    JobCityLinks.tsx        JobShare.tsx

src/actions/careers/careers-actions.ts
src/types/careers/careers.d.ts
src/components/seo/JobPostingJsonLd.tsx
```

- `page.tsx` es un envoltorio: recibe `params`/`searchParams`, los espera y los pasa. Igual que el listado del blog, que es el único precedente de página pública con filtros.
- El espaciado lo pone el layout, no los componentes.

---

## 2. Rutas y URLs

| Ruta canónica                   | `es`                          | `en`                            |
| ------------------------------- | ----------------------------- | ------------------------------- |
| `/careers`                      | `/empleo`                     | `/careers`                      |
| `/careers/[slug]`               | `/empleo/[slug]`              | `/careers/[slug]`               |
| `/careers/cities/[city]`        | `/empleo/ciudades/[city]`     | `/careers/cities/[city]`        |
| `/careers/applications/[token]` | `/empleo/candidatura/[token]` | `/careers/applications/[token]` |

- `/careers` ya existe en `pathnames`; hay que añadir las tres nuevas. Las dinámicas van sin traducir el segmento del parámetro, igual que `/blog/[slug]`.
- El slug de la oferta ya lleva el `jobCode` al final (`conserje-en-getafe-emp-000042`, ver el documento del backend, 2.1), así que no hace falta prefijo ni desambiguación.

### 2.1 Filtros en la URL, no en el estado del cliente

Todos los filtros viajan como `searchParams`: `?city=getafe&category=limpieza&contract=indefinido&mode=ON_SITE&experience=NONE&salaryMin=18000&q=conserje&page=2&sort=recent`.

- Son compartibles, sobreviven al recargar y al botón de atrás, y sobre todo **se renderizan en el servidor**: el listado se pinta ya filtrado en el HTML, sin un salto visible ni un esqueleto. Un buscador cuyos resultados aparecen después de hidratar es más lento de lo que parece y peor para indexar.
- Nombres cortos y en inglés en la query (`city`, no `ciudad`), iguales en los dos idiomas: los **valores** son los slugs traducidos del catálogo, y esos sí cambian por idioma (`limpieza` / `cleaning`).
- El cambio de un filtro es una navegación (`router.replace` con `scroll: false`), no un `setState`. Sin recargar la página entera y sin perder la posición del scroll.
- Un valor desconocido en la query se **ignora** y se avisa en la interfaz («no se ha podido aplicar un filtro»), en vez de responder con un error: una URL vieja compartida por alguien no debe terminar en una página rota.

### 2.2 Páginas de ciudad, y por qué existen aparte del filtro

`?city=getafe` y `/empleo/ciudades/getafe` enseñan lo mismo, y esa duplicación es deliberada:

- La **página de ciudad** es la indexable: tiene su `<h1>` propio («Trabajo en Getafe»), su texto de entrada, su `metaTitle`/`metaDescription` y su enlace a la página de zona de servicios (`/zonas/getafe`) cuando existe (`JobLocation.zoneSlug`). Es la que puede posicionar por «trabajo en Getafe».
- El **filtro** es la herramienta interactiva, y va `noindex, follow` (ver 5.4).
- La página de ciudad lleva `canonical` a sí misma; el listado con `?city=` lleva `canonical` a la página de ciudad. Así la señal se concentra en una sola URL en vez de repartirse entre dos que dicen lo mismo.
- Solo existen las ciudades **con ofertas vigentes**, según las facetas del backend (`GET /public/careers/filters`). Una página de ciudad vacía es contenido de relleno, y además promete algo que no hay. Sin ofertas responde `404`, no una página con «no hay ofertas»: no debe estar en el índice.
- Se generan con `generateStaticParams` a partir de las facetas, con revalidación. Es el mismo criterio que las 20 páginas de zona de `config/zones.ts`, pero con una diferencia importante: las zonas son una lista estática del código y estas dependen de qué haya publicado, así que **no** se declaran una por una en `pathnames`.

---

## 3. El buscador (`/empleo`)

### 3.1 Qué se ve

De arriba abajo:

1. **Cabecera** con el título, una línea de contexto y el número de ofertas vigentes («12 ofertas abiertas en 5 ciudades»). El número es lo que hace creíble la sección; una cabecera genérica sobre un listado vacío es lo que hace pensar que la empresa no contrata.
2. **Buscador**: campo de texto y selector de ciudad, juntos y en una sola línea en escritorio. Son los dos filtros que usa la gente; el resto viene después.
3. **Accesos rápidos por ciudad**: las ciudades con más ofertas, como enlaces a sus páginas de ciudad (no como filtros). Es el enlazado interno que hace que esas páginas existan para Google.
4. **Filtros** (ver 3.2), en columna a la izquierda en escritorio y en un panel deslizante en móvil.
5. **Resultados**: tarjetas (ver 3.3), con las destacadas primero.
6. **Paginación** con enlaces reales (`<a>` con `href`), no botones: es la única forma de que se recorran.
7. **Cierre**: si no hay nada que encaje, la invitación a la candidatura espontánea (ver 4.5).

### 3.2 Filtros

| Filtro           | Control               | Nota                                                       |
| ---------------- | --------------------- | ---------------------------------------------------------- |
| Ciudad           | Casillas con contador | El principal. Admite varias                                |
| Categoría        | Casillas con contador |                                                            |
| Tipo de contrato | Casillas con contador |                                                            |
| Modalidad        | Casillas              | Presencial, híbrido, remoto                                |
| Experiencia      | Selector              | «Hasta 1 año» incluye «sin experiencia» (ver backend, 5.1) |
| Salario mínimo   | Campo numérico        | Con la advertencia de 3.2.1                                |

- Los contadores vienen de `GET /public/careers/filters`, y las opciones a cero **no se pintan**: un filtro que lleva a cero resultados es un callejón sin salida.
- Los filtros activos se enseñan como etiquetas quitables sobre los resultados, con un «limpiar todo». Sin eso, en móvil (donde el panel está cerrado) no hay forma de saber por qué se ven cuatro ofertas de doce.
- Es un `<form>` de verdad, con `<fieldset>` y `<legend>` por grupo, y funciona **sin JavaScript**: se envía y la página se recarga filtrada. Progresivamente mejorado, no dependiente.

#### 3.2.1 El filtro de salario esconde ofertas, y hay que decirlo

Filtrar por salario mínimo deja fuera las ofertas que no publican importe (ver backend, 1.4 y 5.1). Al activarlo aparece una nota: «Se ocultan las ofertas que no publican salario». Sin ese aviso, el filtro parece decir que no hay ofertas mejor pagadas cuando lo que pasa es que no lo dicen.

### 3.3 La tarjeta de oferta

Título, ciudad o ciudades, tipo de contrato, jornada, modalidad, salario si es público, y «publicada hace X». Nada más.

- El **título es el enlace**, y el único enlace de la tarjeta. Una tarjeta con enlaces anidados es un problema de accesibilidad y ya causó un fallo real de anchors duplicados en este proyecto (`requisitos-seo.md`, §23).
- Toda la superficie es pulsable en móvil, con `::after` extendido desde el enlace del título: un solo destino, un solo anchor.
- Sin logotipo por oferta: todas son de la misma empresa, y repetir la marca doce veces solo quita sitio.
- Las destacadas llevan una etiqueta discreta, no un color de fondo distinto.
- Las pausadas (`acceptingApplications: false`) llevan «proceso en pausa» y se ven, pero su ficha no ofrece el formulario.

### 3.4 Estados vacíos

Tres, y distintos a propósito:

- **Sin ofertas en toda la web**: se explica que ahora no hay procesos abiertos y se ofrece la candidatura espontánea. Nunca una página en blanco.
- **Sin resultados para los filtros**: se dice qué filtro es el que está estrechando, con un botón para quitarlo.
- **Sin resultados para el texto buscado**: se ofrece buscar en todas las ciudades, que suele ser la causa.

---

## 4. Ficha de oferta y candidatura

### 4.1 La ficha

- Cabecera: título, ciudades, tipo de contrato, jornada, modalidad, experiencia, salario si es público, `jobCode` y fecha de publicación. Botón «Presentar candidatura» que lleva al formulario, y que se repite al final del texto: en móvil, el de arriba queda muy lejos después de leer la descripción.
- Cuerpo: descripción, responsabilidades, requisitos y «suma pero no descarta», como secciones separadas con su encabezado (ver backend, sección 2). El Markdown se renderiza con el mismo saneado que el blog.
- Beneficios como lista con icono.
- Cierre: enlace a la página de la ciudad y a la de zona de servicios correspondiente, y dos o tres ofertas relacionadas de la misma categoría o ciudad.
- Una oferta con `applyUrl` enseña un enlace externo en lugar del formulario, marcado como tal.
- Una oferta cerrada responde `410` desde el backend (ver backend, 5.3): la página lo explica («esta oferta ya se cerró») y enlaza al buscador. Es mucho mejor que un 404 para quien llega desde Google o desde un enlace compartido, y evita que la URL se quede como error en Search Console.

### 4.2 El formulario

Formik + Yup, con la validación reflejando exactamente los límites del backend (ver backend, sección 13). Campos: nombre, apellidos, correo, teléfono, ciudad, carta de presentación, LinkedIn, CV.

- **No pide fotografía, fecha de nacimiento, nacionalidad, sexo, estado civil ni DNI.** Ni ahora ni como campo opcional (ver backend, 8.3). Si alguien pide añadirlos, la respuesta está ahí.
- Casilla de la información de privacidad, con enlace a la política y la **versión** que se envía en `privacyNoticeVersion`.
- Casilla **separada y sin premarcar** para la bolsa de talento, con su plazo escrito («guardar mi candidatura 12 meses para futuros procesos»). Sin marcarla se puede enviar igual.
- Honeypot oculto y captcha (Turnstile), igual que el formulario de contacto.
- El botón de envío se deshabilita mientras sube y enseña el progreso: un CV de 5 MB en una conexión móvil tarda, y sin indicador la gente pulsa dos veces.

#### 4.2.1 El campo del CV

- Acepta **solo PDF** y como máximo 5 MB (ver backend, 8.4.1), y lo comprueba en el cliente antes de subir: dejar que se suban 20 MB para que el servidor los rechace es gastar la conexión de quien se presenta.
- El mensaje de error dice qué hacer, no qué pasó: «El CV tiene que ser un PDF de menos de 5 MB. La mayoría de programas permiten "Guardar como PDF"».
- Zona de arrastrar y soltar **más** un `<input type="file">` real y accesible con teclado. El arrastre es una comodidad, no el mecanismo.
- Una vez elegido, se enseña el nombre y el tamaño con un botón de quitar.

#### 4.2.2 Se envía directamente a la API

El formulario hace `POST` desde el navegador a `POST /public/careers/applications`, no a través de una Server Action.

- Así la IP que ve la API es la del candidato de verdad, que es lo que hace que el límite por IP y la prueba del consentimiento sirvan para algo (ver backend, 5.7 y `requisitos-leads.md`, 7.4.1).
- Y así el fichero hace un salto en vez de dos: pasarlo por el servidor de Next duplica el tráfico y choca con el límite de tamaño de cuerpo de las funciones serverless.
- Requiere el origen del landing en `CORS_ORIGIN` de la API.
- Si alguna vez tuviera que ir por Server Action, **hay que reenviar la IP del cliente**, o el límite por IP pasa a contar todas las candidaturas del mundo como si fueran de la misma persona.

### 4.3 Después de enviar

Sin redirección: el formulario se sustituye por la confirmación, con el mensaje de que llegará un correo con la referencia y el enlace de seguimiento. La API no devuelve el código a propósito (ver backend, 5.4), así que la confirmación **no** puede prometer un número en pantalla.

### 4.4 Página de seguimiento

`/empleo/candidatura/[token]`: estado, oferta, fecha, y el botón de retirar la candidatura.

- `noindex, nofollow` desde el `generateMetadata` de la propia página, y fuera del sitemap. **No** vale meterla en `NOINDEX_PATHNAMES` (`utils/routingUtils.ts`): esa lista está tipada como `StaticPathname[]` y una ruta con segmento dinámico no encaja ahí.
- Bloqueada en `robots.ts`.
- Retirarse pide confirmación y explica lo que hace de verdad: se retira la candidatura y **se borra el CV**. Es irreversible y hay que decirlo antes, no después.
- Un token caducado o inexistente enseña una página neutra («este enlace ya no está disponible») sin distinguir los dos casos.

### 4.5 Candidatura espontánea

Misma pantalla y mismo formulario, sin oferta y con la casilla de bolsa de talento **obligatoria** (ver backend, 4.4). Se llega desde el estado vacío del buscador y desde el final de `/empleo`. Si está desactivada en el backend, no se enseña la entrada.

---

## 5. SEO

### 5.1 Datos estructurados `JobPosting`

Componente nuevo `components/seo/JobPostingJsonLd.tsx`, en la ficha de la oferta y solo ahí.

| Propiedad                | De dónde sale                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `title`                  | `title` de la traducción                                                            |
| `description`            | Descripción + responsabilidades + requisitos, en HTML                               |
| `identifier`             | `jobCode`                                                                           |
| `datePosted`             | `publishedAt`                                                                       |
| `validThrough`           | `expiresAt` — obligatoria, y por eso la caducidad lo es (backend, 1.5)              |
| `employmentType`         | `schemaOrgValue` del tipo de contrato (backend, 3.3)                                |
| `hiringOrganization`     | La organización de `OrganizationJsonLd`, reutilizada                                |
| `jobLocation`            | Una entrada por ubicación, con `addressLocality`, `addressRegion`, `addressCountry` |
| `jobLocationType`        | `TELECOMMUTE` solo si `workMode = REMOTE`                                           |
| `baseSalary`             | **Solo si `salaryVisible`**, con `unitText` según `salaryPeriod`                    |
| `experienceRequirements` | `experienceLevel`                                                                   |
| `directApply`            | `true` salvo que la oferta tenga `applyUrl`                                         |

- Si `salaryVisible` es `false`, la propiedad **no aparece**. Nunca un importe aproximado ni un cero: un dato estructurado que no coincide con lo que ve el usuario es motivo de penalización, no un detalle.
- Nada de `JobPosting` en el listado ni en las páginas de ciudad. Marcar una lista de ofertas como si cada una fuera la página de esa oferta es exactamente lo que Google pide no hacer.
- El script va con el `nonce` de la petición, como el resto de JSON-LD del proyecto: sin él, la CSP de producción lo bloquea en silencio (y en desarrollo no se nota, porque la CSP solo se manda en producción).

### 5.2 Metadatos

- `/empleo`: título y descripción propios en `metadata.json`, con el número de ofertas fuera del título (un título que cambia cada día es inestable para el índice).
- Ficha: `metaTitle`/`metaDescription` de la traducción, y si están vacíos, `title` y `summary` (ver backend, 2.4).
- Página de ciudad: título con el patrón «Trabajo en {ciudad} — {marca}», y descripción con el número de ofertas y las categorías presentes.
- `hreflang` entre `es` y `en` **solo** cuando existe la traducción de esa oferta. Apuntar a una URL que responde 404 en el otro idioma es peor que no declarar la alternativa.

### 5.3 Sitemap

- Se añaden a `SITEMAP_ROUTES`: `/careers` (prioridad 0.7, `daily` — cambia con cada publicación).
- Ofertas vigentes y páginas de ciudad, con `buildCareersSitemapEntries()` a partir de `GET /public/careers/sitemap`, con su `lastModified` real por idioma. Mismo patrón que `buildBlogPostSitemapEntries`.
- **Una oferta cerrada o caducada sale del sitemap ese mismo día.** El job diario del backend la cierra (backend, 11.1) y el sitemap se regenera; dejarla dentro es pedir que se indexe una página que responde `410`.
- Fuera del sitemap: `/empleo/candidatura/[token]` y cualquier URL con filtros.
- **Hay que quitar el comentario de `sitemap.ts`** que excluye `/careers` por no existir. Ese comentario documenta un estado que este módulo termina.

### 5.4 Qué no se indexa

- Cualquier URL con `searchParams` de filtro: `noindex, follow`. Es la lección de las facetas: seis filtros combinables generan miles de URLs con el mismo contenido reordenado, y sin esto se indexa la basura y no las páginas buenas.
- `follow` y no `nofollow` a propósito: los enlaces a las fichas desde una página filtrada sí deben recorrerse.
- La página de seguimiento (ver 4.4).
- La paginación (`?page=2` en adelante) es indexable con `canonical` a sí misma: es contenido distinto, no una faceta.

### 5.5 Enlazado interno

- `/empleo` → páginas de ciudad (accesos rápidos, 3.1) → fichas.
- Ficha → su ciudad y su zona de servicios (`/zonas/getafe`).
- Página de zona (`ZoneViewPage`) → ofertas de esa ciudad, **si hay**. Un bloque «Trabaja con nosotros en Getafe» que solo aparece cuando existen ofertas; enlazar a una lista vacía es peor que no enlazar.
- El footer recupera su enlace a `/empleo` (ver 6.3).

---

## 6. Cambios en ficheros que ya existen

### 6.1 `config/pathnames.ts`

Las tres rutas nuevas de la sección 2, junto a la `/careers` que ya está.

### 6.2 `config/routing.ts`

- `/careers` pasa a `shownInFooter: true`, con las páginas de ciudad más relevantes como `subRoutes` si se quiere darle columna propia — mismo criterio que `/zones`, que las usa para que la columna del footer no quede como un título huérfano.
- Sigue con `shownInNavbar: false`: empleo no compite por un sitio en el menú principal con servicios y contacto. Se llega por el footer y por Google, que es como se llega de verdad.

### 6.3 Las tres exclusiones que hay que quitar

1. `sitemap.ts`: quitar `/careers` de la lista de «no existen todavía» y añadirlo a `SITEMAP_ROUTES` (ver 5.3).
2. `components/ui/navigation/Footer.tsx`: restaurar el enlace, borrando el comentario que dice «volver a añadirlo cuando exista la página de verdad».
3. `requisitos-seo.md`: dejar anotado que el punto de la auditoría #5 queda cerrado.

Van juntas y en el mismo commit que la página. Separadas es como se llegó a la situación actual: `sitemap.ts` se actualizó y el footer no, y el enlace se quedó apuntando a un 404 durante semanas.

### 6.4 i18n

- `careers.json` nuevo en `src/i18n/locales/{es,en}/`: cabeceras, etiquetas de filtro, estados vacíos, formulario, mensajes de error y textos de la página de seguimiento.
- `navigation.json` ya tiene `/careers`. Añadir las tres rutas nuevas para las migas de pan.
- `metadata.json`: entradas de `/careers` y de la página de ciudad.
- **Nada de texto en el componente.** Y en concreto los mensajes de error del CV: son los que más se leen y los que peor quedan sin traducir.

### 6.5 `robots.ts`

Bloquear `/empleo/candidatura/` y `/careers/applications/`. Con la lección de que `robots.txt` no bloqueaba en realidad ninguna ruta privada (`requisitos-seo.md`, §26): hay que **comprobar** que el patrón casa, no darlo por hecho.

---

## 7. Rendimiento y accesibilidad

- Todo el buscador es Server Component salvo los controles de filtro, el panel móvil y el formulario. La lista de ofertas no necesita JavaScript para pintarse.
- `revalidate` de 300 segundos en los `fetch`, alineado con el `Cache-Control` que manda el backend (backend, 5.8).
- Sin librerías nuevas: los filtros son `input`/`select` con estilos propios, y la subida es un `FormData` normal. Nada de un componente de subida de 40 kB para un campo de fichero.
- Los cambios de filtro anuncian el resultado en una región `aria-live` («12 ofertas»): sin eso, con lector de pantalla el filtro parece no hacer nada.
- Ninguna oferta se representa solo por color (destacada, en pausa): siempre con texto.
- Los contadores de las facetas van dentro de la etiqueta de la casilla, no en un elemento aparte, para que se lean juntos.
- Objetivo de Core Web Vitals igual que el resto del landing (`requisitos-seo.md`, §11): el buscador no puede ser la página más lenta de la web.

---

## 8. Pruebas

- **Historias de Storybook** de `JobCard`, `JobFilters`, `JobList` (con datos, vacío y cargando), `JobApplyForm` (limpio, con errores, subiendo, enviado) y `JobDetailHeader` (con salario, sin salario, en pausa, cerrada).
- El texto del formulario y de las tarjetas se prueba con `flexShrink` en la caja, no en el `Text`: es el fallo real de maquetación que ya se dio en este proyecto.
- Prueba de que **una oferta sin traducción `en` no aparece** en `locale=en`. Es la regla más fácil de romper sin que salte nada.
- Prueba de que el JSON-LD **no** incluye `baseSalary` cuando `salaryVisible` es `false`.
- Prueba de que una URL con filtros lleva `noindex` y una página de ciudad no.
- Prueba de que el `canonical` de `?city=getafe` apunta a la página de ciudad.
- Prueba del rechazo en cliente de un fichero que no es PDF y de uno de más de 5 MB.

---

## 9. Fuera de alcance

- **Guardar ofertas favoritas** o «avísame de nuevas ofertas»: exige cuenta o suscripción con doble confirmación (ver backend, sección 15).
- **Compartir en redes** más allá de copiar el enlace: sin botones de terceros, que además meterían scripts que la CSP tendría que permitir.
- **Buscador por distancia** («ofertas a menos de 20 km»): el filtro es por ciudad.
- **Traducción automática** de una oferta que no tiene versión inglesa. Sin traducción, no se lista (ver backend, 2.2).
- **Página de categoría indexable** (`/empleo/categorias/limpieza`), equivalente a la de ciudad. Tiene sentido y probablemente sea el siguiente paso, pero la ciudad es la que manda en la intención de búsqueda de este sector y no conviene abrir dos familias de facetas indexables a la vez sin ver antes cómo se comporta la primera.

---

## 10. Lo que se hizo distinto de este documento

Este documento se escribió antes de tocar código. Al implementarlo hubo cosas que se hicieron de otra forma,
y se dejan anotadas aquí con el motivo: un documento que no cuadra con el código deja de servir para leerlo.

### 10.1 La candidatura va por acción de servidor, no por `POST` directo del navegador (contra 4.2.2)

La sección 4.2.2 pedía que el formulario hiciera `POST` directamente a la API, con dos argumentos: conservar
la IP real del candidato y evitar que el fichero hiciera dos saltos. El primero **ya está resuelto** sin ir
directo —`utils/fetchUtils.ts` reenvía `x-forwarded-for`, así que el límite por IP y la prueba del
consentimiento siguen valiendo—, y en cambio ir directo obligaba a dos cosas de despliegue para no ganar
nada: publicar `API_BASE_URL` como `NEXT_PUBLIC_*` (hoy es solo de servidor, y publicarla ya causó un fallo
real en producción en este proyecto) y abrir CORS de la API a este origen.

El precio es el que decía el documento: el fichero hace dos saltos, y eso obliga a subir el
`bodySizeLimit` de las acciones de servidor (1 MB por defecto) por encima del máximo del CV. Está hecho en
`next.config.ts`.

### 10.2 El JSON-LD va sin `nonce`

`application/ld+json` es un bloque de datos que el navegador no ejecuta, así que la CSP de `script-src` no lo
bloquea. Es lo mismo que ya hace el resto del JSON-LD de la web.

### 10.3 Los componentes están en `components/ui/careers/`, no en `components/careers/`

Es la convención del repositorio: todo lo que se pinta vive bajo `components/ui/<área>/`, con sus props en
`types/ui/<área>/`. Solo `JobPostingJsonLd` queda fuera, en `components/seo/`, con el resto del SEO.

### 10.4 Los textos van en `views.json`, no en un `careers.json` nuevo

La sección 6.4 pedía un fichero nuevo por módulo. En este repositorio los textos de las páginas viven en el
namespace `Views` de `views.json` —el blog está ahí, y el resto de secciones también—, así que empleo va en
`Careers` dentro del mismo fichero. Un fichero nuevo habría exigido tocar el cargador de mensajes para nada.

### 10.5 No hay `generateStaticParams` en las páginas de ciudad (contra 2.2)

Tres motivos, en orden de peso:

1. **Movería una llamada a la API al `next build`.** Este proyecto ya tiene un fallo documentado por
   depender de la API en tiempo de compilación; una API caída pasaría de «una página tarda 300 ms más» a
   «el despliegue no sale».
2. **No cambia el comportamiento.** Con `dynamicParams` activo (el valor por defecto), una ciudad que no
   estuviera en la lista se renderiza igual bajo demanda. Lo único que se gana es la caché caliente.
3. **Ninguna página de este repositorio lo usa**, ni siquiera el detalle del blog, que tiene el mismo
   problema.

### 10.6 No hay `loading.tsx` en las rutas de empleo, y es a propósito

Se escribieron dos (`/careers` y `/careers/[slug]`) y **se quitaron** al comprobar el efecto: un Suspense por
encima de la página confirma el `200` antes de que la vista pueda lanzar el `notFound()`, así que
`/empleo/ciudades/<ciudad-sin-ofertas>` respondía **200 con el cuerpo de un 404** — un soft 404 en toda
regla, justo lo contrario de lo que pide 3.5. Lo mismo valía para la redirección al otro idioma de la ficha,
que se quedaba sin emitir el `307`.

Comprobado en los dos sentidos: con `loading.tsx`, esa URL responde 200; sin él, 404.

### 10.7 La ficha de una oferta cerrada responde `200` con `noindex`, no `410`

La API sí responde `410` y la página lo trata como corresponde (explica que el proceso terminó y enlaza al
buscador, ver 4.1), pero el enrutador de Next no permite emitir un `410` desde una página: solo `404` vía
`notFound()`. Así que la respuesta es `200` con `robots: noindex, follow`, que es lo que saca esa URL del
índice sin dejar a la persona en una página de error.

### 10.8 Añadidos que no estaban en el documento

Salieron al verificar contra el backend real y se dejan hechos:

- **`extensions` en `FetchResponse`** (`utils/fetchUtils.ts`): los *extension members* de un problema
  RFC 9457 se conservaban en la API y se tiraban en el frontal. Sin ellos, el `correctSlug` del `404` en el
  idioma equivocado no llegaba nunca y la redirección de 4.1 no podía funcionar.
- **`GONE` (410) en `constants/httpStatus.ts`**: no existía en el catálogo de estados.
- **`formatJobSalary` en `utils/careersFormatUtils.ts`**: la API manda los importes como cadena decimal
  (`"18000.00"`) y la tarjeta los pintaba tal cual.
- **El error del CV se traduce en el componente**: ese campo no pasa por `Input`, que es quien resuelve las
  claves de `Validations`, así que se pintaba la clave en crudo. Es exactamente el caso que 6.4 señalaba
  como el peor.
- **`locale` en el seguimiento de la candidatura**: el endpoint devolvía el título y el slug de la oferta en
  el idioma que la base de datos pusiera primero, así que la página en español enseñaba el título en inglés
  y enlazaba a un slug que en el sitio en español no existe. Se arregló en el backend
  (`utils/translation.util.ts`) y el landing manda el idioma de la página.

### 10.9 Dónde quedó cada prueba de la sección 8

| Lo que pedía la sección 8 | Dónde está |
| --- | --- |
| Historias de `JobCard`, `JobFilters`, `JobList`, `JobApplyForm` y `JobDetailHeader` | `src/components/ui/careers/*.stories.tsx` (34 historias, con sus *play functions*) |
| `JobList` «con datos, vacío y cargando» | Datos y vacío en `JobList.stories.tsx`; el vacío real es `JobEmptyState.stories.tsx`, que es quien lo pinta. **Cargando no existe**: no hay `loading.tsx` a propósito (ver 10.6) |
| `JobApplyForm` «limpio, con errores, subiendo, enviado» | Las cuatro, más «rechazado por la API» y las del CV. Los tres estados van **por props** en `JobApplyForm.stories.tsx` (el formulario es presentacional, ver 10.10); el envío de verdad se prueba en `JobApplySection.stories.tsx` con un doble de la acción (`.storybook/mocks/careers-actions.ts`), porque el módulo real no se puede ni importar en el navegador |
| El texto no se sale de la caja | Historias de título y resumen largos en `JobCard`, y el recorte va con `line-clamp` en la tarjeta |
| Una oferta sin traducción `en` no aparece en `locale=en` | Es una regla del backend, así que se comprobó **contra la API en marcha**: publicada una oferta solo en español, `locale=es` devuelve 2 y `locale=en` devuelve 1 |
| El JSON-LD no incluye `baseSalary` sin salario público | `test/JobPostingJsonLd.test.tsx` |
| Una URL con filtros lleva `noindex` y una página de ciudad no | `test/careersMetadata.test.ts`, y comprobado en el HTML servido |
| El canónico de `?citySlug=` apunta a la página de ciudad | `test/careersMetadata.test.ts` (incluye los casos en que **no** debe apuntar ahí: varias ciudades, o ciudad con otro filtro) |
| Rechazo en cliente de un CV que no es PDF y de uno de más de 5 MB | `test/careers.schema.test.ts` las dos reglas; en Storybook la del tamaño (`userEvent.upload` respeta el `accept` del input, así que un PNG no llega a entrar) |

Además, y no estaban en la lista: `test/careersRobots.test.ts` (que los patrones de `robots.txt` casan de
verdad con las URLs del seguimiento y **no** con el buscador), `test/careersFormatUtils.test.ts` (el formato
del salario) y dos casos nuevos en `test/fetchUtils.test.ts` (los campos extra del problema RFC 9457).

### 10.10 El formulario es presentacional, y el `FormData` lo monta la acción

Corregido en revisión: la primera versión de `JobApplyForm` importaba la acción de servidor, se guardaba el
estado de envío y **montaba el `FormData` a mano**. Funcionaba, pero no es como se hacen los formularios en
este proyecto, y eso es motivo suficiente para cambiarlo: un patrón propio en un formulario obliga a
aprenderlo aparte y se va copiando al siguiente.

El reparto correcto es el de `ContactForm` / `ContactViewPage`, y ahora es el mismo:

- **`JobApplyForm`**: valida con Formik + Yup (`jobApplicationSchema`) y **entrega los valores** por
  `onSubmit(values, captchaToken)`. Recibe `loading`, `success` y `error` por props. No importa acciones ni
  sabe cómo viaja el fichero — mismas props que `ContactFormProps`.
- **`JobApplySection`** (`'use client'`): pone el estado, mapea los valores al payload y llama a la acción.
  En contacto esto vive en la vista; aquí hace falta un componente aparte porque las vistas de empleo son
  Server Components a propósito (el listado y la ficha tienen que salir ya pintados en el HTML), así que la
  parte de cliente se queda en esta capa fina en vez de arrastrar la página entera.
- **`submitJobApplication(payload)`**: recibe un objeto tipado (`JobApplicationPayload`, el equivalente de
  `CreatePublicLeadPayload`) y **monta ahí el `multipart/form-data`**. El endpoint es multipart porque lleva
  un fichero; eso es transporte, y el transporte es de la capa de acciones.

Lo que se gana, además de la coherencia: el formulario se puede probar sin doblar ninguna acción de servidor
—sus estados entran por props, como los de `ContactForm`— y el punto donde se decide qué se manda a la API
queda en un solo sitio.

De la lista de ficheros de la sección 1 quedan fuera cinco cajas que no llegaron a hacer falta:
`JobApplyCvField` y `JobApplySuccess` son dos bloques del propio formulario (el campo del CV con su zona de
arrastre, y la confirmación que lo sustituye), y partirlos habría repartido en tres ficheros un componente
que se lee de una vez; `JobFiltersDrawer` es el mismo panel de `JobFilters` abierto por CSS, y
`JobListEmpty`/`JobShare` se resolvieron como `JobEmptyState` y con el enlace normal del navegador. En su
lugar apareció `JobApplySection`, que sí separa dos responsabilidades distintas.

### 10.11 Segunda ronda de correcciones

Todo lo de esta sección salió de una revisión sobre la web ya montada.

- **Los campos son los del sistema de diseño.** El buscador y el selector de ciudad del formulario usaban
  `<select>` y `<input>` a pelo: ahora son `Input` y `Select`, con `input__full`/`select__full` y las filas
  de `form-row`, como el resto de formularios del proyecto. El buscador sigue enviándose de forma nativa
  —el texto en un `input` y la ciudad en el oculto que pinta `Select`—; lo que necesita JavaScript es abrir
  el desplegable, igual que en toda la web.
- **Una oferta recién publicada aparecía solo al pulsar «Buscar».** Era la caché: el listado y las facetas
  se guardaban 300 s, y pulsar «Buscar» cambia la query y con ella la clave de caché. Ahora esas dos
  llamadas van **sin caché** y la ficha baja a 60 s (ver `getPublicJobs`).
- **La ficha, rediseñada**: el cuerpo a la izquierda sobre `--surface-color`, las condiciones del puesto en
  una columna pegada a la derecha con el botón de presentarse debajo, y el número de candidaturas cuando
  pasa del umbral. El formulario se abre en un **modal a pantalla completa** (`modal--full`, variante nueva
  del sistema de diseño) con un **asistente de tres pasos** que valida cada paso antes de dejar avanzar.
- **El seguimiento de la candidatura** enseña en qué punto del proceso está con la misma fila de pasos que
  el resto de la web, con la insignia de estado, y la acción de retirar en su propio bloque al final con la
  confirmación en un modal. «En revisión» no dice si eso es al principio o al final, y esa es la pregunta de
  quien abre el enlace.

### 10.12 La cabecera de la oferta y el diálogo de candidatura

**La cabecera no seguía el patrón de las demás cabeceras de detalle de la web.** Llevaba el degradado del
hero del *listado* copiado a una página de detalle —dos pantallas seguidas con el mismo fondo grande hacen
que no se note que se ha entrado en algo—, no había forma de volver al buscador salvo el botón del navegador,
y encabezaba con la referencia, que ocupaba el sitio de lo que dice de qué va el puesto.

Ahora tiene la forma de `services__detail-hero`: fondo `surface` con una línea abajo, enlace de volver, la
familia profesional en la píldora que las otras fichas usan para su categoría, título, resumen, y la
referencia debajo en pequeño. Las condiciones y el botón de presentarse siguen en la columna de la derecha,
como se pidió.

**El formulario de candidatura tiene ahora su propio diálogo** (`JobApplyDialog`) en vez del modal genérico
con la variante `isFull`. Tres razones concretas, y la variante se ha retirado del modal compartido porque
este era su único uso:

- **Los pasos y los botones se iban con el scroll.** Todo el asistente vivía dentro del cuerpo desplazable,
  así que en el paso del CV —el más alto— desaparecían a la vez el indicador de en qué paso estás y el botón
  de continuar. Ahora la fila de pasos se queda arriba, las acciones abajo, y solo se desplazan los campos.
- **Se perdía a qué oferta se estaba presentando.** El modal genérico lleva un título fijo; este lleva el
  puesto y la referencia en su cabecera.
- **Un click fuera lo cerraba y se perdía todo lo escrito.** Aquí solo cierran el aspa y Escape: rellenar
  nueve campos y un fichero para perderlos por pulsar al lado es la clase de cosa que hace que alguien no se
  vuelva a presentar.

El formulario sigue siendo el mismo componente presentacional; solo se le ha añadido `hideHeader`, porque
dentro del diálogo el título lo pone la cabecera. Se oculta con una prop y no con CSS: un `h2` escondido con
`display: none` sigue en el documento y un lector de pantalla lo anuncia igual, así que habría dos títulos.

El reparto en tres filas es **flex y no una rejilla**: el formulario tiene un hijo condicional —el error a
nivel de formulario— y con `grid-template-rows: auto 1fr auto` el `1fr` le tocaba al error en cuanto
aparecía uno, justo cuando había algo que corregir.

Medido en el navegador: panel 960×736, cabecera 80 px arriba, pasos 90 px fijos, campos 483 px desplazables,
acciones 73 px fijas abajo; un solo `h2` dentro, el scroll de la página bloqueado, y sigue abierto tras
pulsar fuera.

### 10.13 «Trabaja con nosotros» tampoco seguía el patrón de la web

La ficha de una oferta ya se corrigió (§10.12); el **listado** arrastraba lo mismo, y con él las páginas
de ciudad, porque comparten el bloque `careers__hero`.

El SCSS decía en un comentario que su degradado era «el mismo recurso que usa el resto del sitio». No lo
era: los nueve heroes de la web —inicio, servicios, blog, ayuda, soporte, FAQ, contacto, zonas y quiénes
somos— van sobre `surface` con una línea inferior, y este era **el único** con degradado. En una web donde
todas las cabeceras se resuelven igual, la que no lo hace no se lee como una variante: se lee como una
página de otro sitio.

Ahora comparte el patrón completo de una cabecera de listado:

| | Antes | Ahora |
|---|---|---|
| Fondo | degradado `primary-light → background` | `surface` + línea inferior de 1 px |
| Contenido | alineado a la izquierda, a todo el ancho | centrado, con `max-width: 42rem` |
| Antetítulo | ninguno | «Empleo», como «Blog» o «Ayuda» |
| Decoración | ninguna | la forma de abajo a la derecha que llevan el del blog, servicios, ayuda, soporte y zonas |
| Relleno vertical | `3.5rem` | `4.5rem` |

El título y el subtítulo **no se han tocado**: sus valores ya coincidían exactamente con los de
`blog__title-lg` y `blog__text-muted`. El recuento de ofertas y ciudades se queda —es lo que hace creíble
la sección— y solo pasa a estar centrado, igual que la fila de enlaces de las páginas de ciudad.

Se usa `thoughts.svg`, la única forma decorativa sin utilizar: `shape.svg` ya sale en tres cabeceras y
repetirla una cuarta vez habría hecho que empleo pareciera la misma página que el blog.

Comprobado en el navegador midiendo las cinco cabeceras a la vez: empleo (buscador), empleo (ciudad),
blog, servicios y ayuda devuelven ahora el mismo fondo, la misma línea, la misma alineación y todas con
su decoración y su antetítulo. Y ninguna de las tres páginas de empleo pinta una sola clave de traducción
en crudo ni deja un `MISSING_MESSAGE` en consola — el antetítulo de la página de ciudad sí lo hacía al
principio, porque esa vista lee de `Careers.cities` y no de `Careers.hero`.
