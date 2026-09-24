import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

// Tuned strict-preset rules shared by every project block. Game/CLI code
// interpolates numbers and booleans into template literals everywhere, and
// React handlers use expression-bodied arrows returning void — the strict
// defaults that ban those are noise. Nullish/unsafe interpolations and void
// values used as data stay errors.
/** @type {['error', { allowNumber: boolean, allowBoolean: boolean }]} */
const restrictTemplate = ['error', { allowNumber: true, allowBoolean: true }]
/** @type {['error', { ignoreVoidOperator: boolean }]} */
const confusingVoid = ['error', { ignoreVoidOperator: true }]
/** @type {['error', { argsIgnorePattern: string, varsIgnorePattern: string, caughtErrors: 'none' }]} */
const unusedVars = [
  'error',
  { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
]

const tunedStrictRules = {
  '@typescript-eslint/restrict-template-expressions': restrictTemplate,
  '@typescript-eslint/no-confusing-void-expression': confusingVoid,
}

export default defineConfig(
  { ignores: ['dist', 'node_modules', 'coverage', 'playwright-report', 'test-results'] },
  // App source: strictest type-aware config, browser environment.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // Flat config registers the react-hooks plugin itself.
      reactHooks.configs.flat.recommended,
      ...tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      'react-refresh': reactRefresh,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      'react-hooks/exhaustive-deps': 'error',
      'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': unusedVars,
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      ...tunedStrictRules,
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-fallthrough': 'error',
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
  // Tooling (e2e specs, audit/scrape scripts, build configs): strict type-aware
  // with Node globals; console output is legitimate for CLI tools.
  {
    files: ['e2e/**/*.ts', 'scripts/**/*.{mjs,js}', '*.config.ts', 'eslint.config.js'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
      parserOptions: {
        project: ['./tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': unusedVars,
      ...tunedStrictRules,
      'no-console': 'off',
    },
  },
  // Cloudflare Worker: strict type-aware with Workers globals and types.
  {
    files: ['worker/src/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.strictTypeChecked],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.worker,
      parserOptions: {
        project: ['./worker/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...tunedStrictRules,
      'no-console': 'off',
    },
  },
)
