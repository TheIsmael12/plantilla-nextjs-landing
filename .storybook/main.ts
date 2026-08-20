import path from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/nextjs-vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp"
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["..\\public"],
  // La resolución nativa de `paths` de tsconfig que trae Vite 8 (usada por
  // @storybook/nextjs-vite en vez del plugin vite-tsconfig-paths) resuelve
  // el alias "@/*" de forma inconsistente entre el dev server y el build
  // estático de Storybook. Se fija aquí explícitamente para que "@/..."
  // apunte siempre a "src/..." en ambos casos.
  async viteFinal(viteConfig) {
    viteConfig.resolve ??= {};

    // Object/array de alias existentes (según lo que ya aporte el framework),
    // normalizado a la forma de array de Vite para poder anteponer los
    // nuestros con prioridad garantizada — un alias por objeto no asegura
    // ese orden si "@" ya viniera declarado antes que las claves añadidas
    // después en el mismo objeto.
    const existingAlias = viteConfig.resolve.alias;
    const existingEntries = Array.isArray(existingAlias)
      ? existingAlias
      : Object.entries(existingAlias ?? {}).map(([find, replacement]) => ({ find, replacement }));

    viteConfig.resolve.alias = [
      // Specificadores exactos primero: deben resolverse antes que el alias
      // genérico "@" de más abajo, o este los interceptaría primero.
      {
        // La app real ya usa el paquete `next-auth` instalado de verdad;
        // este alias es solo para Storybook, que no puede montar una sesión
        // NextAuth real sin un backend detrás. Se redirige al stub local.
        find: "next-auth/react",
        replacement: path.resolve(dirname, "../src/lib/next-auth-react.tsx"),
      },
      {
        // `security-actions.ts` es una Server Action de Next.js; Vite no
        // trata su `"use server"` como tal, así que un import real llamaría
        // al backend de verdad. Se redirige a un mock con `fn()` reales
        // (spies), para que las historias puedan controlar su resolución
        // con `mockResolvedValueOnce`/`mockReset`.
        find: "@/actions/profile/security-actions",
        replacement: path.resolve(dirname, "mocks/security-actions.ts"),
      },
      {
        // El real usa el `navigator.userAgent` real del navegador de test,
        // que no representa ninguna plataforma de forma fiable; se redirige
        // a un mock controlable con `mockReturnValue`/`mockReturnValueOnce`.
        find: "@/utils/userAgentUtils",
        replacement: path.resolve(dirname, "mocks/userAgentUtils.ts"),
      },
      {
        // `blog-actions.ts` es una Server Action de Next.js que llama al
        // backend real vía `fetchData`; se redirige a un mock con `fn()`
        // reales (spies), igual que `security-actions.ts`.
        find: "@/actions/blog/blog-actions",
        replacement: path.resolve(dirname, "mocks/blog-actions.ts"),
      },
      {
        // Igual que `blog-actions.ts`: `leads-actions.ts` llama al backend
        // real vía `fetchData`.
        find: "@/actions/leads/leads-actions",
        replacement: path.resolve(dirname, "mocks/leads-actions.ts"),
      },
      {
        // `profile-actions.ts` (portal de cliente) llama al backend real vía
        // `fetchDataToken`, que además exige una sesión de NextAuth.
        find: "@/actions/client-portal/profile-actions",
        replacement: path.resolve(dirname, "mocks/profile-actions.ts"),
      },
      {
        // `careers-actions.ts` no solo llamaría al backend: **no se puede ni importar** en el
        // navegador. Arrastra `actions/fetch.ts` → `lib/authOptions` → next-auth → openid-client, que
        // usa `Buffer`, y la historia del formulario de candidatura fallaba al cargar con "Buffer is
        // not defined" antes de pintar nada.
        find: "@/actions/careers/careers-actions",
        replacement: path.resolve(dirname, "mocks/careers-actions.ts"),
      },
      ...existingEntries,
      // La resolución nativa de `paths` de tsconfig que trae Vite 8 (usada
      // por @storybook/nextjs-vite en vez del plugin vite-tsconfig-paths)
      // resuelve el alias "@/*" de forma inconsistente entre el dev server y
      // el build estático de Storybook. Se fija aquí explícitamente (al
      // final: solo debe capturar lo que no coincida con los alias
      // anteriores) para que "@/..." apunte siempre a "src/..." en ambos casos.
      { find: "@", replacement: path.resolve(dirname, "../src") },
    ];

    return viteConfig;
  },
};
export default config;
