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
