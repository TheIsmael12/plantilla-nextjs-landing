import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      // El mismo alias que `tsconfig.json`, o cualquier import `@/…` de un test no resuelve.
      '@': path.join(dirname, 'src'),
      /*
       * `server-only` lo resuelve el compilador de Next, no npm: no existe como paquete instalado, así que
       * cualquier módulo que lo importe —`fetchUtils`, las server actions— no se puede ni cargar desde una
       * prueba. Se apunta a un fichero vacío.
       *
       * No se pierde nada al hacerlo: la protección de `server-only` es de tiempo de compilación —evita que ese
       * código acabe en un bundle de cliente— y aquí no hay bundle que proteger.
       */
      'server-only': path.join(dirname, 'test/stubs/server-only.ts'),
    },
  },
  test: {
    coverage: {
      provider: 'v8',
      /*
       * Lo que hay bajo test, con el mismo criterio que `plantilla-nextjs`.
       *
       * `views`, `actions` y `app` quedan fuera **a propósito**: son componentes de servidor y páginas del enrutador
       * de Next, se prueban en el navegador y no aquí, y meterlos solo diluiría el porcentaje hasta volverlo
       * inservible como señal. Un 40 % que mezcla lógica probada con páginas que nadie va a probar en jsdom dice
       * menos que un 85 % sobre lo que de verdad se puede comprobar.
       *
       * Dentro quedan las dos cosas que sí se miden: la lógica pura de `utils`, `lib`, `schemas`, `hooks` y
       * `context`, y el sistema de diseño de `components/ui` a través de las *play functions* de sus historias.
       */
      include: [
        'src/components/ui/**/*.tsx',
        'src/context/**/*.tsx',
        'src/hooks/**/*.ts',
        'src/lib/**/*.ts',
        'src/schemas/**/*.ts',
        'src/utils/**/*.ts',
      ],
      exclude: ['src/components/ui/**/*.stories.tsx'],
      reporter: ['text', 'html', 'json-summary'],
      /*
       * El informe se escribe **aunque la suite falle**.
       *
       * Por defecto vitest no lo emite si algo va en rojo, y eso deja sin dato justo cuando más falta hace: al
       * llegar a un repositorio con pruebas rotas, lo primero que se quiere saber es cuánto hay cubierto para
       * decidir por dónde empezar.
       */
      reportOnFailure: true,
    },
    projects: [
      {
        /*
         * Las pruebas de lógica, en jsdom.
         *
         * Este proyecto **no existía**: la configuración solo traía el de Storybook, así que el repositorio no tenía
         * forma de ejecutar una prueba que no fuera una historia. Es lo primero que había que arreglar para poder
         * hablar de cobertura.
         */
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          globals: true,
          include: ['test/**/*.test.ts', 'test/**/*.test.tsx'],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
