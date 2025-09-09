// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook'

//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: [
      // Build outputs
      '.output/**',
      '.tanstack/**',
      '.nitro/**',
      'dist/**',
      'build/**',
      // Generated files
      'src/routeTree.gen.ts',
      // Node modules
      'node_modules/**',
      // Storybook build
      'storybook-static/**',
      // Config files that shouldn't be strictly typed
      'eslint.config.js',
      'prettier.config.js',
      'vite.config.ts',
      'vitest.config.ts',
    ],
  },
  ...tanstackConfig,
  ...storybook.configs['flat/recommended'],
  {
    files: ['**/*.stories.{js,jsx,ts,tsx}'],
    rules: {
      // Allow @storybook/react imports in story files
      'storybook/no-renderer-packages': 'off',
    },
  },
  {
    files: ['.storybook/**/*.{js,ts}'],
    rules: {
      // Allow any imports in storybook config files
      'storybook/no-renderer-packages': 'off',
    },
  },
]
