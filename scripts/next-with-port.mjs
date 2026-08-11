#!/usr/bin/env node

/**
 * Arranca `next dev`/`next start` respetando de verdad el `PORT` de
 * `.env`/`.env.local` (o `.env.development`/`.env.production` si existen).
 *
 * El CLI de Next.js solo mira `process.env.PORT` (una variable de entorno
 * real del proceso) para decidir el puerto: los ficheros `.env*` los carga
 * el propio framework en un momento posterior, cuando el puerto ya se ha
 * elegido. Por eso poner `PORT=4000` en `.env` no cambiaba nada.
 *
 * Este script usa `@next/env` (el mismo paquete que usa Next.js
 * internamente) para cargar esos ficheros ANTES de invocar `next`, con la
 * misma prioridad que usaría en tiempo de ejecución (`.env`,
 * `.env.development`/`.env.production`, `.env.local`,
 * `.env.development.local`/`.env.production.local`), y así puede pasarle
 * `-p <PORT>` explícitamente.
 */

import { spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

const [, , command, ...extraArgs] = process.argv;

if (command !== "dev" && command !== "start") {
  console.error("Uso: node scripts/next-with-port.mjs <dev|start> [-- argumentos extra de next]");
  process.exit(1);
}

const isDev = command === "dev";
loadEnvConfig(process.cwd(), isDev);

// `.next` acumula manifests de rutas obsoletos (App Router) que a veces
// quedan desincronizados entre reinicios del dev server (rutas que dejan de
// resolver, 404 fantasma...). Se borra siempre antes de arrancar `dev` para
// partir de una caché limpia; en `start` no aplica porque ahí `.next` es el
// build de producción que se quiere servir tal cual.
if (isDev) {
  rmSync(".next", { recursive: true, force: true });
}

const port = process.env.PORT ?? "3000";

const result = spawnSync("next", [command, "-p", port, ...extraArgs], {
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 0);
