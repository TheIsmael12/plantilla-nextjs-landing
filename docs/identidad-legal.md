# La identidad legal de la empresa

Estas variables no son configuración: son **lo que la web afirma ser ante quien la lee**. Salen en el aviso
legal, en las condiciones, en el canal de reclamaciones, en el pie, en la página de contacto y en el marcado
`Organization` que leen los buscadores.

## Qué pasó

Una auditoría externa encontró publicado en imora.es el CIF `B12345678` y la dirección
«Calle Ejemplo, 123» en las páginas legales, conviviendo con la dirección real en el resto del sitio.

No lo escribió nadie ahí. Eran los **valores por defecto** de `config/env.ts`, y salieron publicados porque
estas cinco variables no estaban configuradas en ningún entorno:

- `NEXT_PUBLIC_COMPANY_NAME`
- `NEXT_PUBLIC_COMPANY_CIF`
- `NEXT_PUBLIC_COMPANY_EMAIL`
- `NEXT_PUBLIC_COMPANY_PHONE`
- `NEXT_PUBLIC_COMPANY_EMERGENCY_PHONE`

Un dato legal no puede tener un valor de conveniencia. Si falta, hay que enterarse; rellenar el hueco con
algo que **parece** un dato es peor que dejarlo vacío, porque nadie lo mira dos veces.

## Cómo está resuelto

1. **Ya no hay valores de ejemplo** en `config/env.ts` para la identidad legal ni para los teléfonos. Lo que
   falte llega vacío.
2. **El build lo comprueba** (`config/companyIdentity.ts`, llamado desde `next.config.ts`). En producción,
   una variable que falte o que siga con un valor de ejemplo **corta el despliegue**. En desarrollo solo
   avisa por consola: trabajar en una pantalla de servicios no puede exigir tener el CIF a mano.
3. **Lo que puede faltar sin engañar a nadie, desaparece**: sin teléfono de urgencias no se pinta el botón
   de llamada urgente. Un número inventado ahí es peor que no tener botón — quien lo pulsa a las tres de la
   mañana cree que ha llamado a alguien. Es el mismo criterio que ya se aplicaba al mapa de la sede, que sin
   coordenadas no se pinta en vez de caer al centro de Madrid.

## Por qué se comprueba al construir y no al arrancar

Son variables `NEXT_PUBLIC_*`: su valor **se incrusta en el build**. Ponerlas en Vercel después de desplegar
no cambia nada de lo ya publicado. El único momento en el que la comprobación sirve de algo es mientras se
construye.

## Qué hay que rellenar

En `.env.development` (local) y en las variables de entorno del proyecto de Vercel (producción):

| Variable | Qué es |
|---|---|
| `NEXT_PUBLIC_COMPANY_NAME` | Razón social completa, tal como está en el registro |
| `NEXT_PUBLIC_COMPANY_CIF` | El CIF real |
| `NEXT_PUBLIC_COMPANY_STREET_ADDRESS` | Calle y número del domicilio social |
| `NEXT_PUBLIC_COMPANY_POSTAL_CODE` | Código postal |
| `NEXT_PUBLIC_COMPANY_CITY` | Municipio |
| `NEXT_PUBLIC_COMPANY_COUNTRY` | País |
| `NEXT_PUBLIC_COMPANY_EMAIL` | Correo de contacto general |
| `NEXT_PUBLIC_COMPANY_PHONE` | Teléfono de oficina |
| `NEXT_PUBLIC_COMPANY_EMERGENCY_PHONE` | Teléfono de urgencias 24h (opcional: sin él no se ofrece la llamada urgente) |

El domicilio y el CIF tienen que ser **los mismos** que figuran en el registro y en las facturas. Si la
dirección de la sede cambia, cambian con ella `NEXT_PUBLIC_COMPANY_LATITUDE`/`LONGITUDE`, que son las que
sitúan el pin del mapa y el bloque `geo` del dato estructurado.
