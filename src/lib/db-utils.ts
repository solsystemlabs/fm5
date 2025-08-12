import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface DatabaseStats {
  users: number
  filamentTypes: number
  filamentBrands: number
  filaments: number
  filamentRolls: number
  modelCategories: number
  models: number
  products: number
  printerBrands: number
  printers: number
  printJobs: number
  printJobMaterials: number
  totalRecords: number
}

/**
 * Get comprehensive database statistics
 */
export async function getDatabaseStats(): Promise<DatabaseStats> {
  const [
    users,
    filamentTypes,
    filamentBrands,
    filaments,
    filamentRolls,
    modelCategories,
    models,
    products,
    printerBrands,
    printers,
    printJobs,
    printJobMaterials
  ] = await Promise.all([
    prisma.user.count(),
    prisma.filamentType.count(),
    prisma.filamentBrand.count(),
    prisma.filament.count(),
    prisma.filamentRoll.count(),
    prisma.modelCategory.count(),
    prisma.model.count(),
    prisma.product.count(),
    prisma.printerBrand.count(),
    prisma.printer.count(),
    prisma.printJob.count(),
    prisma.printJobMaterial.count()
  ])

  const totalRecords = users + filamentTypes + filamentBrands + filaments + 
    filamentRolls + modelCategories + models + products + printerBrands + 
    printers + printJobs + printJobMaterials

  return {
    users,
    filamentTypes,
    filamentBrands,
    filaments,
    filamentRolls,
    modelCategories,
    models,
    products,
    printerBrands,
    printers,
    printJobs,
    printJobMaterials,
    totalRecords
  }
}

/**
 * Check if database has been seeded
 */
export async function isDatabaseSeeded(): Promise<boolean> {
  const stats = await getDatabaseStats()
  return stats.totalRecords > 0
}

/**
 * Get filament inventory summary
 */
export async function getFilamentInventorySummary() {
  const summary = await prisma.filamentRoll.groupBy({
    by: ['filamentId'],
    _count: {
      id: true
    },
    _sum: {
      currentWeight: true,
      totalCost: true
    },
    where: {
      isActive: true,
      isEmpty: false
    }
  })

  const totalRolls = summary.length
  const totalWeight = summary.reduce((sum, item) => sum + (item._sum.currentWeight || 0), 0)
  const totalValue = summary.reduce((sum, item) => sum + (item._sum.totalCost || 0), 0)

  return {
    totalRolls,
    totalWeight,
    totalValue,
    averageRollWeight: totalWeight / totalRolls,
    averageRollCost: totalValue / totalRolls
  }
}

/**
 * Get low stock alerts
 */
export async function getLowStockAlerts(threshold = 100) {
  const lowStockRolls = await prisma.filamentRoll.findMany({
    where: {
      currentWeight: {
        lte: threshold
      },
      isActive: true,
      isEmpty: false
    },
    include: {
      filament: {
        include: {
          brand: true,
          type: true
        }
      }
    },
    orderBy: {
      currentWeight: 'asc'
    }
  })

  return lowStockRolls.map(roll => ({
    id: roll.id,
    filamentName: roll.filament.name,
    brand: roll.filament.brand.name,
    type: roll.filament.type.name,
    color: roll.filament.color,
    currentWeight: roll.currentWeight,
    storageLocation: roll.storageLocation,
    urgency: roll.currentWeight <= 50 ? 'critical' : 'low'
  }))
}

/**
 * Validate database integrity
 */
export async function validateDatabaseIntegrity() {
  const issues: string[] = []

  // Check for invalid weights (negative current weight)
  const invalidWeights = await prisma.filamentRoll.count({
    where: {
      currentWeight: {
        lt: 0
      }
    }
  })
  if (invalidWeights > 0) {
    issues.push(`Found ${invalidWeights} rolls with negative weight`)
  }

  // Get all filament rolls to check weight consistency
  const allRolls = await prisma.filamentRoll.findMany({
    select: { id: true, currentWeight: true, initialWeight: true }
  })
  const overWeightRolls = allRolls.filter(roll => roll.currentWeight > roll.initialWeight)
  if (overWeightRolls.length > 0) {
    issues.push(`Found ${overWeightRolls.length} rolls with current weight > initial weight`)
  }

  // Check for empty rolls still marked as active
  const activeEmptyRolls = await prisma.filamentRoll.count({
    where: {
      currentWeight: {
        lte: 0
      },
      isActive: true
    }
  })
  if (activeEmptyRolls > 0) {
    issues.push(`Found ${activeEmptyRolls} empty rolls still marked as active`)
  }

  return {
    isValid: issues.length === 0,
    issues
  }
}

/**
 * Clean up database (remove invalid records)
 */
export async function cleanupDatabase() {
  let cleanedRecords = 0

  // Remove empty rolls that are marked as active
  const emptyRolls = await prisma.filamentRoll.updateMany({
    where: {
      currentWeight: {
        lte: 0
      },
      isEmpty: false
    },
    data: {
      isEmpty: true,
      isActive: false
    }
  })
  cleanedRecords += emptyRolls.count

  // Remove sessions older than 30 days
  const oldSessions = await prisma.session.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
      }
    }
  })
  cleanedRecords += oldSessions.count

  return {
    cleanedRecords,
    operations: [
      `Updated ${emptyRolls.count} empty filament rolls`,
      `Removed ${oldSessions.count} old sessions`
    ]
  }
}

export { prisma }