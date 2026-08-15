# Keyword map — Imora

> Ampliación de [requisitos-seo.md](requisitos-seo.md) §2. Paso obligatorio antes de crear
> cualquier página o artículo nuevo — evita que dos URLs compitan por la misma búsqueda
> (canibalización). Construido a partir del contenido real ya publicado en cada página de
> servicio (`src/i18n/locales/es/views.json`, namespace `Services.items`), no de keywords
> genéricas inventadas.

## Cómo usar esta tabla

- **URL destino ya existe** → esa keyword se trabaja mejorando el contenido de la página
  actual (título, H1, copy, FAQ), nunca creando una URL nueva para ella.
- **URL destino no existe todavía** → keyword candidata a una página nueva (zona, segmento) o
  a un artículo de blog. No crear la URL hasta que su fila esté aquí con intención y
  enlazado interno decididos.
- **Zona**: vacío = keyword sin intención geográfica explícita (compite a nivel Madrid en
  general); con zona = variante local, solo se trabaja cuando exista la página de esa zona
  (§4 de `requisitos-seo.md` — hoy ninguna existe todavía).

## 1. Servicios — keywords de página (URLs ya existentes)

Cada fila usa el contenido real ya publicado (`summary`/`description`/subservicios) como base
del H1/title propuesto — no sustituye el texto actual, lo iguala o lo especializa para la
keyword. Decisión ya tomada en `requisitos-seo.md` §5: **no tocar los slugs indexados**.

### Conserjería — `/servicios/conserjeria`

| Keyword principal | Keywords secundarias | Intención | H1 propuesto | Title propuesto |
|---|---|---|---|---|
| conserjería para comunidades Madrid | empresa de conserjería Madrid, conserje para comunidad de vecinos | Comercial | Conserjería y control de accesos para tu comunidad en Madrid | Empresa de conserjería para comunidades en Madrid \| Imora |
| cuánto cuesta un conserje para una comunidad | precio conserjería comunidad, tarifa conserje 24 horas | Transaccional/precio | *(cubierto por FAQ ya existente: "¿Cuánto cuesta el servicio de conserjería?")* | — |
| conserjería 24 horas Madrid | portero 24 horas comunidad, conserje turno de noche | Comercial | — | — |
| cambiar empresa de conserjería | cómo cambiar de conserje sin problemas | Decisión | *(cubierto por FAQ ya existente: "¿Puedo cambiar de empresa de conserjería sin problemas?")* | — |
| control de accesos comunidades Madrid | control de accesos edificio, registro de visitas comunidad | Comercial | — | — |

### Seguridad y CCTV — `/servicios/seguridad`

| Keyword principal | Keywords secundarias | Intención | H1 propuesto | Title propuesto |
|---|---|---|---|---|
| videovigilancia comunidades Madrid | CCTV comunidad de vecinos, cámaras de seguridad edificio | Comercial | Seguridad y videovigilancia CCTV para comunidades y edificios en Madrid | Empresa de seguridad y CCTV para comunidades en Madrid \| Imora |
| instalación de cámaras Madrid | empresa instalación CCTV Madrid | Comercial | — | — |
| control de accesos electrónico comunidad | tarjetas de acceso comunidad, control acceso garaje | Comercial | — | — |
| cuánto tiempo se conservan las grabaciones de CCTV | plazo legal grabaciones videovigilancia comunidad | Informativo | *(cubierto por FAQ ya existente)* | — |

### Mantenimiento de piscinas — `/servicios/piscinas`

| Keyword principal | Keywords secundarias | Intención | H1 propuesto | Title propuesto |
|---|---|---|---|---|
| mantenimiento de piscinas comunitarias Madrid | empresa mantenimiento piscina comunidad | Comercial | Mantenimiento de piscinas comunitarias en Madrid, con socorrista titulado | Mantenimiento de piscinas comunitarias en Madrid \| Imora |
| socorrista para piscina comunitaria | contratar socorrista titulado comunidad | Comercial | — | — |
| cuánto cuesta mantener una piscina comunitaria | precio mantenimiento piscina comunidad | Transaccional/precio | — (no hay FAQ de precio hoy; **candidata a añadir FAQ**) | — |
| apertura y cierre de piscina comunidad | apertura piscina temporada, cierre piscina invierno | Comercial | *(cubierto por FAQ ya existente)* | — |

### Limpieza — `/servicios/limpieza`

| Keyword principal | Keywords secundarias | Intención | H1 propuesto | Title propuesto |
|---|---|---|---|---|
| limpieza de comunidades Madrid | empresa de limpieza de comunidades Madrid, limpieza de fincas | Comercial | Empresa de limpieza de comunidades en Madrid: portales, escaleras y garajes | Limpieza de comunidades en Madrid \| Imora |
| limpieza de portales Madrid | limpieza de escaleras comunidad, limpieza zonas comunes | Comercial | — | — |
| limpieza de garajes Madrid | limpieza de aparcamientos comunidad | Comercial | *(cubierto por subservicio "Limpieza de garajes")* | — |
| precio limpieza comunidad de vecinos | cuánto cuesta limpiar una comunidad | Transaccional/precio | — (no hay FAQ de precio hoy; **candidata a añadir FAQ**) | — |
| cómo cambiar de empresa de limpieza | cambiar empresa de limpieza comunidad de propietarios | Decisión | — (no hay FAQ de cambio hoy; **candidata a añadir FAQ**, mismo patrón que conserjería) | — |

**Nota**: el `title` de esta página en el código actual es «Limpieza integral» — más genérico
que el resto (compárese con «Conserjería y control de accesos», «Seguridad y CCTV»). Candidato
a revisar en fase de ejecución (`requisitos-seo.md` §5) hacia algo más próximo a «Limpieza de
comunidades», que es el término comercial real, sin tocar la URL.

### Jardinería — `/servicios/jardineria`

| Keyword principal | Keywords secundarias | Intención | H1 propuesto | Title propuesto |
|---|---|---|---|---|
| jardinería para comunidades Madrid | empresa de jardinería comunidades, mantenimiento de jardines comunitarios | Comercial | Jardinería y mantenimiento de zonas verdes para comunidades en Madrid | Empresa de jardinería para comunidades en Madrid \| Imora |
| poda de árboles comunidad de vecinos | poda de setos comunidad | Comercial | *(cubierto por subservicio "Poda y mantenimiento de arbolado")* | — |
| riego automático zonas comunes | mantenimiento riego comunidad | Comercial | — | — |

### Mantenimiento de edificios — `/servicios/mantenimiento`

| Keyword principal | Keywords secundarias | Intención | H1 propuesto | Title propuesto |
|---|---|---|---|---|
| mantenimiento de comunidades Madrid | mantenimiento integral de edificios Madrid, empresa mantenimiento fincas | Comercial | Mantenimiento de edificios en Madrid: fontanería, electricidad y cerrajería | Mantenimiento de edificios y comunidades en Madrid \| Imora |
| qué incluye una empresa de mantenimiento de comunidades | servicios mantenimiento integral comunidad | Informativo | — (candidata a artículo de blog, ver §2 abajo) | — |
| cerrajería urgente comunidad Madrid | cerrajero urgente edificio | Comercial/urgencia | *(cubierto por subservicio "Cerrajería")* | — |
| electricidad zonas comunes comunidad | cambio alumbrado LED comunidad | Comercial | *(cubierto por subservicio "Electricidad")* | — |
| fontanería comunidades Madrid | avería fontanería zona común | Comercial | *(cubierto por subservicio "Fontanería")* | — |

## 2. Blog — mapeo inicial de artículos (Fase 6 de `requisitos-seo.md`)

Cada fila = 1 artículo candidato para el lote inicial de 20-30 (§7). Formato:
keyword → categoría de intención → servicio(s) a enlazar → estado.

| Título candidato | Keyword objetivo | Categoría | Enlaza a | Estado |
|---|---|---|---|---|
| ¿Cuánto cuesta un conserje para una comunidad en Madrid? | cuánto cuesta un conserje | Precio | /servicios/conserjeria | Candidato |
| ¿Qué incluye una empresa de mantenimiento de comunidades? | qué incluye mantenimiento de comunidades | Guía | /servicios/mantenimiento | Candidato |
| ¿Cuánto cuesta mantener una piscina comunitaria? | cuánto cuesta mantener una piscina comunitaria | Precio | /servicios/piscinas | Candidato |
| Cómo cambiar de empresa de limpieza en una comunidad de propietarios | cómo cambiar de empresa de limpieza | Decisión | /servicios/limpieza | Candidato |
| Conserjería 24 horas para comunidades: ventajas y precios | conserjería 24 horas ventajas precio | Precio + Guía | /servicios/conserjeria | Candidato |
| Empresa de limpieza de comunidades: qué debe incluir el servicio | qué incluye limpieza de comunidades | Guía | /servicios/limpieza | Candidato |
| ¿Cuánto cuesta la limpieza de una comunidad de vecinos? | precio limpieza comunidad de vecinos | Precio | /servicios/limpieza | Candidato |
| Control de accesos en comunidades: tipos y cómo elegir | control de accesos comunidades tipos | Guía | /servicios/seguridad | Candidato |
| ¿Es obligatorio el socorrista en la piscina de mi comunidad? | socorrista obligatorio piscina comunidad | Informativo/legal | /servicios/piscinas | Candidato |
| Checklist para evaluar una empresa de mantenimiento de comunidades | checklist empresa mantenimiento comunidades | Guía (administradores de fincas) | /servicios/mantenimiento | Candidato — §6 |
| Cómo elegir una empresa de conserjería para tu comunidad | cómo elegir empresa conserjería | Decisión (administradores de fincas) | /servicios/conserjeria | Candidato — §6 |
| Qué debe incluir el contrato de mantenimiento de una comunidad | contrato mantenimiento comunidad qué incluir | Guía (administradores de fincas) | /servicios/mantenimiento | Candidato — §6 |
| Cuánto tiempo se conservan las grabaciones de CCTV en una comunidad | grabaciones CCTV comunidad plazo legal | Informativo/legal | /servicios/seguridad | Candidato |
| Videovigilancia en comunidades de vecinos: qué dice la ley | videovigilancia comunidad de vecinos ley | Informativo/legal | /servicios/seguridad | Candidato |
| Poda de árboles en comunidades: cuándo y cómo hacerla | poda árboles comunidad cuándo | Guía | /servicios/jardineria | Candidato |
| ¿Cuánto cuesta instalar CCTV en una comunidad de vecinos? | precio instalación CCTV comunidad | Precio | /servicios/seguridad | Candidato |
| Cómo elegir el sistema de control de accesos para tu edificio | elegir control de accesos edificio | Guía (administradores de fincas) | /servicios/seguridad | Candidato — §6 |
| ¿Cuánto cuesta la jardinería de una comunidad al mes? | precio jardinería comunidad mensual | Precio | /servicios/jardineria | Candidato |
| Riego automático en comunidades: ventajas y ahorro de agua | riego automático comunidad ahorro agua | Guía | /servicios/jardineria | Candidato |
| ¿Cada cuánto hay que revisar la instalación eléctrica de una comunidad? | revisión eléctrica comunidad cada cuánto | Informativo/legal | /servicios/mantenimiento | Candidato |
| Fontanería de urgencia en comunidades: qué hacer ante una fuga | fontanería urgencia comunidad fuga | Guía/urgencia | /servicios/mantenimiento | Candidato |
| Servicios externalizados para comunidades: qué ganan los administradores de fincas | servicios externalizados comunidades administradores fincas | Guía (administradores de fincas) | /servicios (general) | Candidato — §6 |
| Cómo reducir las incidencias de mantenimiento en una comunidad | reducir incidencias mantenimiento comunidad | Guía (administradores de fincas) | /servicios/mantenimiento | Candidato — §6 |
| Qué hacer cuando una empresa de limpieza incumple el contrato | empresa de limpieza incumple contrato | Decisión (administradores de fincas) | /servicios/limpieza | Candidato — §6 |
| Conserjería vs. portero automático: qué necesita realmente tu comunidad | conserjería vs portero automático | Decisión | /servicios/conserjeria | Candidato |
| Un solo proveedor para conserjería, limpieza y mantenimiento: ventajas | proveedor único servicios comunidad | Guía/multiservicio | /servicios (general) | Candidato |
| ISO 9001, 14001 y 45001 en empresas de servicios: qué garantizan | certificaciones ISO empresa servicios comunidades | Informativo | — (bloqueado, ver `requisitos-seo.md` §1/§8: no publicar hasta confirmar certificaciones reales) | Bloqueado |

**Estado**: 27 filas — cubre el mínimo del rango 20-30 (§7). Ampliar más solo si Search
Console (una vez configurado, §12) revela intenciones de búsqueda reales no contempladas
aquí; no añadir artículos especulativos por encima de este lote sin esa señal.

## 3. Zonas — combinaciones servicio × municipio

**No crear ninguna fila de esta sección como página real hasta que:**
1. La empresa confirme los municipios donde opera de verdad (`requisitos-seo.md` §4, TODO).
2. Exista contenido específico de esa zona (no una plantilla con el nombre cambiado).

Patrón de keyword, aplicable a cada servicio × zona confirmada:

```
[servicio] + comunidades + [zona]
```

Ejemplos (formato, no lista cerrada — repetir por cada servicio confirmado × cada zona
confirmada):

| Keyword | Servicio | Zona | URL destino (aún no existe) |
|---|---|---|---|
| limpieza de comunidades en Alcobendas | Limpieza | Alcobendas | `/zonas/alcobendas` (enlaza a `/servicios/limpieza`) |
| conserjería en Pozuelo de Alarcón | Conserjería | Pozuelo de Alarcón | `/zonas/pozuelo-de-alarcon` |
| mantenimiento de comunidades en Alcorcón | Mantenimiento | Alcorcón | `/zonas/alcorcon` |

Generar la tabla completa (6 servicios × N zonas confirmadas) solo cuando el TODO de zonas del
§4 esté resuelto — hacerlo antes es trabajo que se descarta si la lista de municipios cambia.

## 4. Naming — evitar depender de la marca (ver `requisitos-seo.md` §10)

Ninguna fila de esta tabla usa «Imora» a secas como keyword principal. Donde se combina con
marca, sigue el patrón `Imora + servicio + Madrid` (p. ej. «Imora limpieza comunidades
Madrid»), y solo como keyword secundaria, nunca principal.
