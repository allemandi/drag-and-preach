import js from "@eslint/js";

const eslintConfig = [
  js.configs.recommended,
  {
    ignores: [".next/**", "node_modules/**", "out/**", "playwright-report/**", "test-results/**"],
  },
  {
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];

export default eslintConfig;
