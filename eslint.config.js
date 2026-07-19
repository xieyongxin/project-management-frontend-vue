import js from '@eslint/js'
import boundaries from 'eslint-plugin-boundaries'
import importPlugin from 'eslint-plugin-import'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'coverage',
      'node_modules',
      'public/mockServiceWorker.js',
      'src/shared/api/generated',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,vue}'],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,vue}'],
  })),
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      boundaries,
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: true,
      },
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'router', pattern: 'src/router' },
        { type: 'layout', pattern: 'src/layouts' },
        {
          type: 'feature',
          pattern: 'src/features/*',
          capture: ['featureName'],
        },
        { type: 'shared', pattern: 'src/shared' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              allow: {
                dependency: { relationship: { to: 'internal' } },
              },
            },
            {
              from: { element: { type: 'app' } },
              allow: {
                to: {
                  element: { types: ['router', 'layout', 'feature', 'shared'] },
                },
              },
            },
            {
              from: { element: { type: 'router' } },
              allow: {
                to: {
                  element: { types: ['layout', 'feature', 'shared'] },
                },
              },
            },
            {
              from: { element: { type: 'layout' } },
              allow: { to: { element: { type: 'shared' } } },
            },
            {
              from: { element: { type: 'feature' } },
              allow: { to: { element: { types: ['layout', 'shared'] } } },
            },
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { type: 'shared' } } },
            },
          ],
        },
      ],
      'import/no-cycle': ['error', { ignoreExternal: true }],
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/**'],
              message: 'Feature 外部只能通过该 feature 的公共 index.ts 导入。',
            },
          ],
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': [
        'error',
        { ignoreVoid: true },
      ],
      'vue/multi-word-component-names': 'off',
      'vue/no-reserved-component-names': 'off',
      'vue/no-v-html': 'error',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/one-component-per-file': 'off',
      'vue/require-default-prop': 'off',
    },
  },
  {
    files: [
      'src/features/*/components/**/*.{ts,vue}',
      'src/features/*/pages/**/*.{ts,vue}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/**'],
              message: 'Feature 外部只能通过该 feature 的公共 index.ts 导入。',
            },
            {
              group: ['@/shared/api/generated/**'],
              message:
                '页面和组件不得直接依赖 OpenAPI DTO，请通过 API 或 Mapper 层。',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.config.{js,ts}',
      'scripts/**/*.mjs',
      'src/shared/lib/logger/logger.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
)
