# plantilla-nextjs-landing

Landing pública + portal de clientes (Next.js 16, next-auth v4). Backend: `plantilla-nestjs`.

## Variables de entorno

La plantilla de variables es `.env.development` (está versionada; `.env*` en general no). Cópiala como
`.env.production` para un despliegue. Además de las que ya se documentan ahí, estas afectan a la seguridad:

| Variable | Por defecto | Qué hace |
| --- | --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | — | Site key pública de Cloudflare Turnstile para los formularios públicos. **En producción es obligatoria**: sin ella `next build` falla (`src/config/turnstile.ts`). |
| `NEXT_PUBLIC_TURNSTILE_DISABLED` | vacía | `true` para desplegar a propósito sin captcha (backend con `CAPTCHA_PROVIDER=none`). Cualquier otro valor deja el captcha activo. |
| `TRUSTED_PROXY_HOPS` | `1` | Número de proxies de confianza delante de la app. La IP del visitante es la entrada N-ésima empezando por el final de `X-Forwarded-For`. Entero de 1 a 10. |
| `TRUSTED_IP_HEADER` | vacía | Cabecera propia del proxy con la IP del visitante (p. ej. `cf-connecting-ip`). Solo si ese proxy la sobrescribe siempre. Tiene prioridad sobre `X-Forwarded-For`. |
| `HSTS_INCLUDE_SUBDOMAINS` | vacía | `true` añade `includeSubDomains` a `Strict-Transport-Security` (solo producción). |
| `HSTS_PRELOAD` | vacía | `true` añade `preload` (e `includeSubDomains`). Entrar en la lista de preload es fácil y salir tarda meses: actívala solo con el dominio entero en HTTPS. |

Todas las `NEXT_PUBLIC_*` se incrustan en el build: cambiarlas exige volver a desplegar.
