# Medición de la landing

Aquí vive la configuración del contenedor de Google Tag Manager, versionada
junto al código que la alimenta. El contenedor y la aplicación son dos mitades
del mismo montaje: si una cambia sin la otra, la medición se rompe en silencio.

- **Contenedor: `GTM-NVH4QP3L`.** Es el que tiene que llevar
  `NEXT_PUBLIC_GTM_ID` en producción; si esa variable no está puesta en el
  despliegue, la landing no carga nada y no avisa de ello.
- `gtm-container.json` — contenedor listo para importar en GTM.
- La parte de código está en `src/lib/gtm.ts` y
  `src/components/analytics/GoogleTagManager.tsx`.

## Cómo importarlo

1. En GTM: **Administrar → Importar contenedor**.
2. Selecciona `gtm-container.json`. El contenedor de destino es `GTM-NVH4QP3L`.
3. Espacio de trabajo: **crea uno nuevo** (no uses el predeterminado, así el
   cambio queda aislado y se puede descartar entero).
4. Modo: **Combinar → Renombrar conflictos**. Con esto nada de lo que ya
   hubiera en el contenedor se pierde. Usa *Sobrescribir* solo si el
   contenedor está vacío.
5. GTM enseña un resumen de qué crea y qué modifica **antes** de aplicarlo.
   Léelo: es la última oportunidad de ver el cambio completo de una vez.
6. Importa, comprueba en **Vista previa** (más abajo) y publica tú.

Los `accountId`/`containerId` del fichero van a `0` a propósito: GTM los
reasigna a los del contenedor de destino durante la importación.

## Lo que hay que rellenar

| Variable | Valor | Obligatorio |
|---|---|---|
| `CFG - GA4 ID de medicion` | `G-XXXXXXXXXX` → el real | Sí |
| `CFG - Google Ads ID de conversion` | `AW-000000000` → el real | Solo con Ads |
| `CFG - Google Ads etiqueta de conversion (lead)` | la etiqueta real | Solo con Ads |

Son variables de tipo constante justamente para esto: el ID de GA4 se cambia
en **un** sitio y lo heredan las cinco etiquetas.

Las tres etiquetas de Google Ads vienen **en pausa** porque hoy no hay
campañas. Ver más abajo qué hace falta el día que las haya.

## Qué mide, y quién lo dispara

| Etiqueta | Se dispara con | Lo empuja |
|---|---|---|
| `GA4 - Etiqueta de Google` | Inicialización | GTM |
| `GA4 - page_view` | evento `page_view` | `GoogleTagManager.tsx` |
| `GA4 - cookie_consent_update` | evento `cookie_consent_update` | `lib/gtm.ts` |
| `GA4 - contact_click` | clic en `tel:` o `mailto:` | GTM |
| `GA4 - generate_lead` | evento `generate_lead` | `ContactViewPage.tsx` |

### Las vistas de página, y por qué no se duplican

La primera carga de cada visita la mide la etiqueta de Google al inicializarse.
Las navegaciones siguientes no recargan la página, así que el App Router las
tiene que anunciar: `GoogleTagManager.tsx` empuja un `page_view` a partir de la
**segunda** página, nunca en la primera.

> **Importante — hay que tocar GA4.** En *Administrador → Flujo de datos →
> Medición mejorada*, desactiva **«Cambios de página basados en eventos del
> historial del navegador»**. Si se queda activo, GA4 cuenta cada navegación
> dos veces: la suya y la nuestra.

El resto de la medición mejorada (scroll, clics salientes, descargas) puede
quedarse activa: el contenedor no la duplica a propósito.

## Consentimiento

El banner de cookies traduce sus categorías a las señales del Consent Mode v2
(`lib/gtm.ts`).

**Las tres señales de publicidad (`ad_storage`, `ad_user_data`,
`ad_personalization`) van denegadas siempre.** No es un olvido: el banner ya no
pregunta por marketing, porque hoy no hay instalado ningún script de publicidad
y un interruptor sin nada detrás obligaba al texto legal a describir
proveedores que no existen en el sitio. Sin categoría que las gobierne, nadie
puede concederlas, y ninguna etiqueta de anuncios podría escribir nada aunque
se le quitara la pausa. El contenedor está montado en **modo avanzado**: las
etiquetas de GA4 se disparan siempre y es el propio Consent Mode quien decide
qué se puede enviar. Sin consentimiento manda pings sin cookies ni
identificadores, que es lo que permite que GA4 modele después lo que no pudo
medir.

Si prefieres **modo básico** —que sin consentimiento no salga absolutamente
nada, ni pings—: en cada etiqueta de GA4, *Configuración avanzada →
Consentimiento adicional*, exige `analytics_storage`. Se pierde el modelado a
cambio de una postura más conservadora.

`GA4 - cookie_consent_update` va sin exigir consentimiento **a propósito**: si
lo exigiera, solo se verían las aceptaciones y no habría forma de saber el
porcentaje de rechazo.

## El lead, y por qué no cuenta todo lo que llega

`generate_lead` lo empuja `ContactViewPage.tsx` con `pushLeadGenerated()`, y
**solo tras la respuesta correcta del backend** — no al pulsar el botón, o se
contarían como leads los envíos que fallaron.

Hay un descuento a mano que conviene conocer: el backend responde `201`
también cuando descarta el envío en silencio (honeypot, captcha, lista de
supresión), por anti-enumeración. Es decir, **su respuesta no distingue un lead
real del spam**. Lo que sí se sabe en el navegador es si el campo trampa venía
relleno, y ese caso no se cuenta como conversión aunque la pantalla muestre la
confirmación de siempre —que la sigue mostrando a propósito, para no avisar al
bot de que lo han pillado—.

Lo que no se puede descontar desde el navegador es un envío rechazado por el
captcha: llega igual con `201` y sin ninguna señal de que lo fuera. Si algún
día el spam inflara la métrica, el arreglo está en el backend, devolviendo algo
que distinga los dos casos sin dárselo a entender al remitente.

### Lo que sigue faltando: el valor

El evento lleva `form_id` y `lead_type`, pero no un valor. Mientras no lo
lleve, lo que se mide es **cuántos formularios llegan por campaña**, no cuánto
generan. Basta con un valor estimado y fijo por tipo de lead; es una decisión
de negocio, no técnica. Cuando esté decidido: un parámetro más en la llamada y
una fila más en `eventSettingsTable` de esta etiqueta.

## Cómo comprobarlo antes de publicar

1. **Vista previa** en GTM contra el entorno donde `NEXT_PUBLIC_GTM_ID` apunte
   a este contenedor.
2. Carga una página pública: debe verse el `consent default` con todo denegado
   salvo `security_storage`, y la etiqueta de Google disparada.
3. Acepta en el banner: debe aparecer `cookie_consent_update` y el
   `consent update` con lo aceptado.
4. Navega a otra página sin recargar: un `page_view`, y solo uno.
5. Vuelve a entrar en una pestaña nueva: el `consent default` ya debe salir
   concedido, sin banner.

## Si cambias algo en la interfaz de GTM

Expórtalo (**Administrar → Exportar contenedor**) y machaca este fichero, para
que el repositorio no se quede contando una versión que ya no es la que corre.

## Una cosa que conviene mirar nada más importar

Abre `GA4 - page_view` y comprueba que sus cuatro parámetros de evento
(`page_location`, `page_path`, `page_title`, `seccion_sitio`) se ven en la
interfaz. El fichero los escribe en el campo `eventSettingsTable`, que es el
que usa la versión actual de la plantilla de GA4; si tu contenedor fuera de
una versión distinta aparecerían vacíos, y se rellenan a mano en dos minutos.
El resto del contenedor no depende de eso.

## El día que entren los anuncios

El objetivo es saber cuánto genera cada anuncio, y eso no se resuelve
quitando la pausa a tres etiquetas. Hacen falta cinco cosas, en este orden:

1. ~~Que exista `generate_lead`~~. Hecho: lo empuja la página de contacto.
2. **Devolver la categoría `marketing` al banner.** Es la condición que se
   dejó escrita al quitarla: vuelve junto con la integración de publicidad, no
   antes. Toca `CookieConsentCategories` (`lib/cookieConsent.ts`), el
   interruptor del banner, sus textos en `cookies.json`, la tabla de la
   política de cookies, y devolver las tres señales `ad_*` de
   `CONSENT_SIGNAL_RULE` (`lib/gtm.ts`) a esa categoría. Sin este paso las
   etiquetas de Ads no se disparan aunque se les quite la pausa.
3. **Un valor por lead.** Para que la pregunta sea "cuánto genera" y no
   "cuántos formularios llegan", el evento debe llevar un valor —aunque sea
   uno estimado y fijo por tipo de lead. Sin valor solo se cuentan envíos.
4. **Rellenar los dos IDs de Ads** (`CFG - Google Ads ID de conversion` y
   `CFG - Google Ads etiqueta de conversion (lead)`) y quitar la pausa a las
   tres etiquetas de la carpeta 2.
5. **Vincular Google Ads con GA4** desde el administrador de GA4. Es lo que
   permite ver el rendimiento por campaña dentro de los informes, en vez de
   tener los dos sistemas contando por su cuenta.

La atribución la sostiene además `readAttribution()` (`src/utils/leadAttributionUtils.ts`),
que ya recoge `utm_*`, `gclid` y `fbclid` y los manda al backend con el lead
—solo si la persona ha dado el consentimiento de atribución en el formulario—.
Eso permite cruzar después el lead real del CRM con la campaña que lo trajo,
que suele ser el dato que de verdad se quiere.
