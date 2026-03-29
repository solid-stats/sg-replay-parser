/* eslint-disable max-lines */

import nextPlugin from '@next/eslint-plugin-next';
import stylisticPlugin from '@stylistic/eslint-plugin';
import { ESLint, Linter } from 'eslint';
// @ts-expect-error not all plugins support TypeScript configs
import importPlugin from 'eslint-plugin-import';
// @ts-expect-error not all plugins support TypeScript configs
import jsxA11YPlugin from 'eslint-plugin-jsx-a11y';
// @ts-expect-error not all plugins support TypeScript configs
import mobxPlugin from 'eslint-plugin-mobx';
import reactPlugin from 'eslint-plugin-react';
import * as reactHooksPlugin from 'eslint-plugin-react-hooks';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import typescriptPlugin from 'typescript-eslint';

import eslintRules from './linterRules/eslint';
import importRules from './linterRules/import';
import jsxA11YRules from './linterRules/jsxA11Y';
import mobxRules from './linterRules/mobx';
import nextRules from './linterRules/next';
import reactRules from './linterRules/react';
import stylisticRules from './linterRules/stylistic';
import typescriptRules from './linterRules/typescript';
import unicornRules from './linterRules/unicorn';

export default [
  {
    ignores: [
      '**/routeTree.ts',
      '**/.swagger/**',
      '**/__generated__/**',
      '**/TestModels.d.ts',
      '.dependency-cruiser.cjs',
      '**/vite-env.d.ts',
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      'public/**',
      '.next/**/*',
      'next-env.d.ts',
      '**/shared/signal/**',
    ],
  },

  {
    linterOptions: {
      noInlineConfig: false,
      reportUnusedInlineConfigs: 2,
      reportUnusedDisableDirectives: 2,
    },
  },

  /* Plugins */
  {
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      ts: typescriptPlugin.plugin as ESLint.Plugin,
      import: importPlugin as ESLint.Plugin,
      mobx: mobxPlugin as ESLint.Plugin,
      ...stylisticPlugin.configs.recommended.plugins,
      unicorn: eslintPluginUnicorn,
      // @ts-expect-error: invalid plugin type
      next: nextPlugin,
      'jsx-a11y': jsxA11YPlugin as ESLint.Plugin,
    },
  },

  /* Language options */
  // common
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  // Typescript
  {
    languageOptions: {
      parser: typescriptPlugin.parser as Linter.Parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  // React
  {
    languageOptions: {
      parserOptions: reactPlugin.configs['jsx-runtime'].parserOptions,
    },
  },

  /* Settings */
  // import
  {
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx', '.css.ts'],
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.app.json',
        },
        node: {
          moduleDirectory: ['src'],
          extensions: ['.ts', '.tsx', '.css.ts'],
        },
      },
    },
  },
  // React
  {
    settings: {
      react: {
        version: 'detect',
        componentWrapperFunctions: ['observer', 'styled'],
        linkComponents: ['Link'],
      },
    },
  },
  // jsx-a11y
  {
    settings: {
      'jsx-a11y': {
        polymorphicPropName: 'as',
        components: {
          Button: 'button',
          Input: 'input',
          InputPrice: 'input',
          TextArea: 'textarea',
          PasswordInput: 'input',
          MaskedInput: 'input',
          PhoneInput: 'input',
          Search: 'input',
          Code: 'input',
          Loader: 'svg',
          LoaderIcon: 'svg',
          Logo: 'svg',
          Link: 'a',
          AppLink: 'a',
          NextImage: 'img',
          Image: 'img',
          AppImage: 'img',
          Avatar: 'img',
          AppFieldLabel: 'label',
          'Typography.Headline': 'h1',
          'Typography.Subtitle': 'p',
          'Typography.Body': 'p',
          'Typography.Caption': 'span',
          'Typography.Button': 'span',
          '*Icon': 'svg',
        },
        attributes: {
          for: ['htmlFor', 'for'],
          class: ['className'],
          'aria-label': ['label', 'ariaLabel'],
        },
      },
    },
  },

  /* Rules */
  {
    files: ['**/*.{ts,tsx,css.ts}'],
    rules: {
      ...reactHooksPlugin.configs['recommended-latest'].rules,
      ...eslintRules,
      ...typescriptRules,
      ...importRules,
      ...reactRules,
      ...mobxRules,
      ...stylisticRules,
      ...unicornRules,
      ...jsxA11YRules,
      ...nextRules,
    },
  },
  {
    files: [
      '**/shared/localizations/**/*.ts',
      '**/*.css.ts',
    ],
    rules: { '@stylistic/max-len': 0 },
  },
  {
    files: [
      'eslint.config.ts',
      '**/shared/localizations/exportLocalization.ts',
      '**/app/**/{page,error,not-found,layout,loading}.{ts,tsx}',
      '**/app_api/**/route.ts',
      'src/middleware.ts',
      'next.config.ts',
    ],
    rules: { 'import/no-unused-modules': 0 },
  },
  {
    files: ['**/shared/localizations/**/*.ts'],
    rules: { 'max-lines': 0 },
  },
] satisfies Linter.Config[];
