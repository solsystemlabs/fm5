#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import readline from 'readline/promises'

const prisma = new PrismaClient()

interface ResetOptions {
  force?: boolean
  seedAfter?: boolean
  migrateFirst?: boolean
}

async function confirmAction(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  try {
    const answer = await rl.question(`${message} (y/N): `)
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
  } finally {
    rl.close()
  }
}

async function clearAllData() {
  console.log('🧹 Clearing all data from database...')
  
  // Clear data in correct order to respect foreign key constraints
  const tables = [
    'printJobMaterials',
    'printJobs', 
    'filamentRolls',
    'filaments',
    'filamentTypes',
    'filamentBrands',
    'products',
    'models', 
    'modelCategories',
    'printers',
    'printerBrands',
    'accounts',
    'sessions',
    'user', // Note: this is the table name, not the model name
    'verification'
  ]

  let cleared = 0
  for (const table of tables) {
    try {
      const result = await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`)
      console.log(`  ✅ Cleared ${table}`)
      cleared++
    } catch (error) {
      console.log(`  ⚠️  Skipped ${table} (may not exist or have dependencies)`)
    }
  }
  
  console.log(`✅ Cleared ${cleared}/${tables.length} tables`)
}

async function resetSequences() {
  console.log('🔄 Resetting database sequences...')
  
  try {
    // Reset any auto-increment sequences (though we use CUIDs mostly)
    await prisma.$executeRaw`SELECT setval(pg_get_serial_sequence('"user"', 'id'), 1, false)`
    console.log('  ✅ Reset sequences')
  } catch (error) {
    console.log('  ⚠️  No sequences to reset (using CUID primary keys)')
  }
}

async function runMigrations() {
  console.log('📦 Running database migrations...')
  
  try {
    execSync('npx prisma migrate deploy', { 
      stdio: 'pipe',
      cwd: process.cwd()
    })
    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

async function runSeed() {
  console.log('🌱 Running database seed...')
  
  try {
    execSync('npm run db:seed', {
      stdio: 'inherit',
      cwd: process.cwd()
    })
    console.log('✅ Database seeded successfully')
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

async function getDatabaseStats() {
  console.log('📊 Database Statistics:')
  
  const stats = {
    users: await prisma.user.count(),
    filamentTypes: await prisma.filamentType.count(),
    filamentBrands: await prisma.filamentBrand.count(),
    filaments: await prisma.filament.count(),
    filamentRolls: await prisma.filamentRoll.count(),
    modelCategories: await prisma.modelCategory.count(),
    models: await prisma.model.count(),
    products: await prisma.product.count(),
    printerBrands: await prisma.printerBrand.count(),
    printers: await prisma.printer.count(),
    printJobs: await prisma.printJob.count(),
    printJobMaterials: await prisma.printJobMaterial.count()
  }
  
  Object.entries(stats).forEach(([table, count]) => {
    console.log(`  ${table}: ${count} records`)
  })
  
  return stats
}

async function databaseReset(options: ResetOptions = {}) {
  try {
    console.log('🚀 Starting database reset process...')
    console.log('⚠️  This will permanently delete all data!')
    
    if (!options.force) {
      const confirmed = await confirmAction('Are you sure you want to reset the database?')
      if (!confirmed) {
        console.log('❌ Reset cancelled by user')
        return
      }
    }
    
    // Step 1: Run migrations first if requested
    if (options.migrateFirst) {
      await runMigrations()
    }
    
    // Step 2: Clear all data
    await clearAllData()
    
    // Step 3: Reset sequences
    await resetSequences()
    
    // Step 4: Run seed if requested
    if (options.seedAfter) {
      await runSeed()
    }
    
    // Step 5: Show final stats
    console.log('\n📈 Final database state:')
    await getDatabaseStats()
    
    console.log('\n🎉 Database reset completed successfully!')
    
  } catch (error) {
    console.error('❌ Database reset failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2)
  const options: ResetOptions = {
    force: args.includes('--force') || args.includes('-f'),
    seedAfter: args.includes('--seed') || args.includes('-s'),
    migrateFirst: args.includes('--migrate') || args.includes('-m')
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🗃️  Database Reset Utility

Usage: npm run db:reset [options]

Options:
  -f, --force       Skip confirmation prompt
  -s, --seed        Run seed data after reset
  -m, --migrate     Run migrations before reset
  -h, --help        Show this help message

Examples:
  npm run db:reset                    # Interactive reset
  npm run db:reset --force --seed     # Force reset and seed
  npm run db:reset -f -s -m           # Full reset with migration and seed
`)
    return
  }
  
  await databaseReset(options)
}

// Handle script execution
main().catch(console.error)

export { databaseReset, clearAllData, runMigrations, runSeed, getDatabaseStats }