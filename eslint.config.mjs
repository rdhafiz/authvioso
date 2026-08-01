import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Disables ESLint rules that conflict with Prettier. Formatting is
  // automated, so it is never discussed in review (WKF-007 §1).
  prettier,

  {
    rules: {
      // Unused variables are an error, with a deliberate underscore escape
      // for intentionally ignored bindings.
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Type-only imports are marked as such: smaller output, clearer intent.
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // `console` is not a logging strategy. Warnings and errors are allowed
      // so genuine problems remain visible.
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "content/**",
  ]),
]);

export default eslintConfig;
