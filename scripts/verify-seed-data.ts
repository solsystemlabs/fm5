#!/usr/bin/env tsx

import { getDatabaseStats, getFilamentInventorySummary, getLowStockAlerts, validateDatabaseIntegrity } from '../src/lib/db-utils.js';

console.log('🔍 Verifying seed data integrity and relationships...');

async function verifySeedData() {
  try {
    const stats = await getDatabaseStats();
    console.log('\n📊 Database Statistics:');
    console.log('  Users:', stats.users);
    console.log('  Filament Types:', stats.filamentTypes);
    console.log('  Filament Brands:', stats.filamentBrands);  
    console.log('  Filaments:', stats.filaments);
    console.log('  Filament Rolls:', stats.filamentRolls);
    console.log('  Total Records:', stats.totalRecords);

    const inventory = await getFilamentInventorySummary();
    console.log('\n📦 Filament Inventory Summary:');
    console.log('  Total Active Rolls:', inventory.totalRolls);
    console.log('  Total Weight (g):', inventory.totalWeight);
    console.log('  Total Value ($):', inventory.totalValue.toFixed(2));
    console.log('  Avg Roll Weight (g):', inventory.averageRollWeight.toFixed(2));
    console.log('  Avg Roll Cost ($):', inventory.averageRollCost.toFixed(2));

    const lowStock = await getLowStockAlerts();
    console.log('\n⚠️ Low Stock Alerts:');
    lowStock.forEach(roll => {
      console.log(`  - ${roll.filamentName} (${roll.brand}): ${roll.currentWeight}g remaining - ${roll.urgency}`);
    });

    const integrity = await validateDatabaseIntegrity();
    console.log('\n🔍 Database Integrity Check:');
    console.log('  Valid:', integrity.isValid);
    if (!integrity.isValid) {
      integrity.issues.forEach(issue => console.log(`  - Issue: ${issue}`));
    } else {
      console.log('  ✅ All data integrity checks passed!');
    }

    console.log('\n✅ Seed data verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verifySeedData();