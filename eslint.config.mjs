// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import jsdoc from "eslint-plugin-jsdoc";
import tsParser from "@typescript-eslint/parser";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "storybook-static/**",
      "coverage/**",
    ],
  },
  ...nextCoreWebVitals,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        // tsconfig.json excludes *.stories.tsx (Storybook files aren't part
        // of the Next.js build); tsconfig.eslint.json extends it and adds
        // them back so ESLint can still type-check story files.
        project: ["./tsconfig.json", "./tsconfig.eslint.json"],
      },
    },
    plugins: {
      jsdoc,
    },
    rules: {
      "jsdoc/require-jsdoc": [
        "warn",
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: false,
            ClassDeclaration: false,
          },
          contexts: [
            "TSInterfaceDeclaration",
            "TSTypeAliasDeclaration",
            "TSEnumDeclaration",
          ],
        },
      ],
      "jsdoc/require-description": "warn",
      "jsdoc/require-param-description": "warn",
      "jsdoc/require-returns-description": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  ...storybook.configs["flat/recommended"],
];

export default config;