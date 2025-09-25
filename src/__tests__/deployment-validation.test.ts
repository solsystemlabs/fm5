import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('Deployment Configuration Validation', () => {
  it('should have wrangler.toml configuration', () => {
    const wranglerPath = join(process.cwd(), 'wrangler.toml')
    let wranglerConfig: string

    expect(() => {
      wranglerConfig = readFileSync(wranglerPath, 'utf-8')
    }).not.toThrow()

    // Check required configuration fields
    expect(wranglerConfig).toContain('name = "fm5"')
    expect(wranglerConfig).toContain('main = ".output/server/index.mjs"')
    expect(wranglerConfig).toContain('compatibility_date = "2025-09-24"')
    expect(wranglerConfig).toContain('compatibility_flags = ["nodejs_compat"]')
  })

  it('should have staging environment configuration', () => {
    const wranglerPath = join(process.cwd(), 'wrangler.toml')
    const wranglerConfig = readFileSync(wranglerPath, 'utf-8')

    expect(wranglerConfig).toContain('[env.staging]')
    expect(wranglerConfig).toContain('name = "fm5-staging"')
    expect(wranglerConfig).toContain('NODE_ENV = "staging"')
    expect(wranglerConfig).toContain('bucket_name = "fm5-staging-files"')
  })

  it('should have production environment configuration', () => {
    const wranglerPath = join(process.cwd(), 'wrangler.toml')
    const wranglerConfig = readFileSync(wranglerPath, 'utf-8')

    expect(wranglerConfig).toContain('[env.production]')
    expect(wranglerConfig).toContain('name = "fm5-production"')
    expect(wranglerConfig).toContain('NODE_ENV = "production"')
    expect(wranglerConfig).toContain('bucket_name = "fm5-production-files"')
  })

  it('should have GitHub Actions workflow', () => {
    const workflowPath = join(process.cwd(), '.github/workflows/deploy.yml')
    let workflowConfig: string

    expect(() => {
      workflowConfig = readFileSync(workflowPath, 'utf-8')
    }).not.toThrow()

    // Check required workflow structure
    expect(workflowConfig).toContain('name: Deploy to Cloudflare Workers')
    expect(workflowConfig).toContain('test-and-build:')
    expect(workflowConfig).toContain('deploy-staging:')
    expect(workflowConfig).toContain('deploy-production:')
    expect(workflowConfig).toContain('cloudflare/wrangler-action@v3')
  })

  it('should have required environment variables in example', () => {
    const envExamplePath = join(process.cwd(), '.env.example')
    const envExample = readFileSync(envExamplePath, 'utf-8')

    // Check deployment-specific environment variables
    expect(envExample).toContain('BETTER_AUTH_SECRET=')
    expect(envExample).toContain('XATA_API_KEY=')
    expect(envExample).toContain('XATA_DATABASE_URL=')
    expect(envExample).toContain('RESEND_API_KEY=')
    expect(envExample).toContain('APP_ENV=')
  })

  it('should have deployment documentation', () => {
    const deploymentDocsPath = join(process.cwd(), 'DEPLOYMENT.md')
    let deploymentDocs: string

    expect(() => {
      deploymentDocs = readFileSync(deploymentDocsPath, 'utf-8')
    }).not.toThrow()

    // Check essential documentation sections
    expect(deploymentDocs).toContain('# FM5 Deployment Guide')
    expect(deploymentDocs).toContain('## Rollback Procedures')
    expect(deploymentDocs).toContain('## Health Checks')
    expect(deploymentDocs).toContain('## Environment Configuration')
  })

  it('should have deployment scripts', () => {
    const stagingScriptPath = join(process.cwd(), 'scripts/deploy-staging.sh')
    const productionScriptPath = join(
      process.cwd(),
      'scripts/deploy-production.sh',
    )

    expect(() => {
      readFileSync(stagingScriptPath, 'utf-8')
    }).not.toThrow('Staging deployment script should exist')

    expect(() => {
      readFileSync(productionScriptPath, 'utf-8')
    }).not.toThrow('Production deployment script should exist')
  })

  it('should have wrangler package installed', () => {
    const packageJsonPath = join(process.cwd(), 'package.json')
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

    expect(packageJson.devDependencies).toHaveProperty('wrangler')
  })

  it('should have database configuration for Xata', () => {
    // Test the database configuration module exists
    expect(() => {
      require('../../lib/db.ts')
    }).not.toThrow()
  })
})
