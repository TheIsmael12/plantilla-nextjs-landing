import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

/**
 * Los módulos de Next que no existen fuera de una petición.
 *
 * Es el mismo montaje que `plantilla-nextjs`, y por el mismo motivo: `next-intl`, `next-themes`, `next-auth` y el
 * enrutador leen contexto que solo hay dentro de la aplicación en marcha. Sin estos dobles, importar cualquier
 * componente revienta antes de llegar a la primera comprobación, y el fallo no dice nada del código que se quería
 * probar.
 *
 * `useTranslations` devuelve **la clave** en vez de un texto traducido a propósito: así una prueba comprueba que se
 * pide la clave correcta sin depender de lo que ponga el fichero de mensajes, que cambia cada semana.
 */
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "es",
  useFormatter: () => ({
    dateTime: (value: Date) => value.toISOString(),
    number: (value: number) => String(value),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: "light", theme: "light", setTheme: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  useSession: () => ({ data: null, status: "unauthenticated", update: vi.fn() }),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  redirect: vi.fn(),
  notFound: vi.fn(),
}));
