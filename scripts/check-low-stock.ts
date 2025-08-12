#!/usr/bin/env tsx

import { getLowStockAlerts } from '../src/lib/db-utils.js';

console.log('🔍 Checking filament inventory for low stock...');

async function checkLowStock() {
  try {
    // Check with 200g threshold (instead of default 100g)
    const lowStock200 = await getLowStockAlerts(200);
    console.log(`\n⚠️ Low Stock Alerts (under 200g):`);
    if (lowStock200.length === 0) {
      console.log('  ✅ No rolls under 200g');
    } else {
      lowStock200.forEach(roll => {
        console.log(`  - ${roll.filamentName} (${roll.brand} ${roll.type}): ${roll.currentWeight}g remaining - ${roll.urgency}`);
        console.log(`    Location: ${roll.storageLocation}`);
      });
    }

    // Check with 300g threshold 
    const lowStock300 = await getLowStockAlerts(300);
    console.log(`\n⚠️ Low Stock Alerts (under 300g):`);
    if (lowStock300.length === 0) {
      console.log('  ✅ No rolls under 300g');
    } else {
      lowStock300.forEach(roll => {
        console.log(`  - ${roll.filamentName} (${roll.brand} ${roll.type}): ${roll.currentWeight}g remaining - ${roll.urgency}`);
        console.log(`    Location: ${roll.storageLocation}`);
      });
    }

    // Check with 600g threshold (more realistic for planning)
    const lowStock600 = await getLowStockAlerts(600);
    console.log(`\n⚠️ Low Stock Alerts (under 600g - Planning threshold):`);
    if (lowStock600.length === 0) {
      console.log('  ✅ No rolls under 600g');
    } else {
      lowStock600.forEach(roll => {
        console.log(`  - ${roll.filamentName} (${roll.brand} ${roll.type}): ${roll.currentWeight}g remaining - ${roll.urgency}`);
        console.log(`    Location: ${roll.storageLocation}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Low stock check failed:', error);
    process.exit(1);
  }
}

checkLowStock();