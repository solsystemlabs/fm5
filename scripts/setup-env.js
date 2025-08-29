#!/usr/bin/env node

import { copyFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const environments = {
  local: '.env.local',
  staging: '.env.staging', 
  production: '.env.production'
};

const env = process.argv[2] || 'local';

if (!environments[env]) {
  console.error(`❌ Unknown environment: ${env}`);
  console.error(`Available environments: ${Object.keys(environments).join(', ')}`);
  process.exit(1);
}

const sourceFile = resolve(environments[env]);
const targetFile = resolve('.env');

if (!existsSync(sourceFile)) {
  console.error(`❌ Environment file not found: ${sourceFile}`);
  process.exit(1);
}

try {
  copyFileSync(sourceFile, targetFile);
  console.log(`✅ Environment set to ${env}`);
  console.log(`📄 Copied ${environments[env]} to .env`);
} catch (error) {
  console.error(`❌ Failed to copy environment file: ${error.message}`);
  process.exit(1);
}