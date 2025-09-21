//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    ignores: [
      '.nitro/**',
      '.output/**',
      'dist/**',
      'node_modules/**',
      '*.config.js',
      'routeTree.gen.ts'
    ]
  }
]
