import type { RefreshedPortalTokens } from "@/types/auth/login";

/**
 * Estado compartido de la renovación de tokens del portal de cliente.
 * @interface PortalRefreshTokenCache
 * @property {Map<string, Promise<RefreshedPortalTokens | null>>} pending - Canjes en vuelo, indexados por el `refreshToken` que los inició
 * @property {Map<string, RefreshedPortalTokens>} rotated - Pares ya rotados, indexados por el `refreshToken` **antiguo** que los obtuvo
 */
interface PortalRefreshTokenCache {
  pending: Map<string, Promise<RefreshedPortalTokens | null>>;
  rotated: Map<string, RefreshedPortalTokens>;
}

/**
 * `Symbol.for` y no una propiedad normal: la clave es la misma en cualquier módulo del
 * proceso sin ocupar un nombre global que alguien pueda pisar.
 */
const CACHE_KEY = Symbol.for("plantilla-nextjs-landing.client-portal.refresh-token-cache");

type GlobalWithCache = typeof globalThis & { [CACHE_KEY]?: PortalRefreshTokenCache };

/**
 * Caché de renovación de tokens del portal de cliente, colgada de
 * `globalThis` **a propósito**.
 *
 * El backend rota el `refreshToken` en cada uso y revoca la sesión entera si le llega uno
 * ya canjeado (protección contra robo). Para no dispararla hace falta que todo el proceso
 * comparta un único registro de "este token ya se está canjeando / ya se canjeó"... y un
 * `const` a nivel de módulo **no** lo garantiza en Next.js: el callback `jwt` se ejecuta
 * tanto desde el route handler de NextAuth como desde Server Components y Server Actions,
 * que viven en bundles distintos. Cada bundle instancia el módulo por su cuenta, así que
 * con `Map`s locales había dos registros independientes, dos canjes simultáneos del mismo
 * token, y el segundo se leía como reutilización: sesión revocada.
 *
 * `globalThis` es el único sitio que de verdad comparten todos los bundles del mismo
 * proceso.
 *
 * Queda fuera de su alcance el caso de **varios procesos** (varias instancias detrás de un
 * balanceador): ahí cada una tendría su caché y volvería a haber ventana de carrera. Para
 * eso haría falta un almacén compartido (Redis); si algún día se despliega escalado
 * horizontalmente, este es el punto a cambiar.
 * @returns {PortalRefreshTokenCache} La caché compartida del proceso, creándola en la primera llamada
 */
export function getPortalRefreshTokenCache(): PortalRefreshTokenCache {
  const globalWithCache = globalThis as GlobalWithCache;

  globalWithCache[CACHE_KEY] ??= {
    pending: new Map<string, Promise<RefreshedPortalTokens | null>>(),
    rotated: new Map<string, RefreshedPortalTokens>(),
  };

  return globalWithCache[CACHE_KEY];
}
