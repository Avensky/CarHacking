import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import parser from '@typescript-eslint/parser' // Import the TypeScript parser

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  { files: ['**/*.js'], languageOptions: { sourceType: 'script' } },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'], // Apply only to TypeScript files
    languageOptions: {
      parser, // Specify the TypeScript parser
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Change "warn" to "off" if you want to disable it entirely
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]
