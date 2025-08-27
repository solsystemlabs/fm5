import type { SlicedFile, SlicedFileFilament } from './types';

/**
 * Cost estimation configuration
 */
export interface CostEstimationConfig {
  // Electricity cost per kWh (in local currency)
  electricityCostPerKwh: number;
  
  // Printer power consumption in watts
  printerPowerConsumptionWatts: number;
  
  // Labor rate per hour (in local currency) - optional
  laborRatePerHour?: number;
  
  // Additional overhead percentage (maintenance, depreciation, etc.)
  overheadPercentage: number;
}

/**
 * Default cost estimation configuration (USD)
 */
export const DEFAULT_COST_CONFIG: CostEstimationConfig = {
  electricityCostPerKwh: 0.12, // $0.12 per kWh (US average)
  printerPowerConsumptionWatts: 150, // 150W average for desktop 3D printer
  laborRatePerHour: 0, // No labor cost by default
  overheadPercentage: 0.15, // 15% overhead
};

/**
 * Estimated cost breakdown for a print
 */
export interface PrintCostBreakdown {
  // Material costs
  materialCost: number;
  filamentCosts: Array<{
    filamentIndex: number;
    filamentType?: string;
    filamentColor?: string;
    weightUsed: number;
    costPerGram: number;
    totalCost: number;
  }>;
  
  // Operating costs
  electricityCost: number;
  laborCost: number;
  overheadCost: number;
  
  // Total
  totalCost: number;
  
  // Metadata
  printTimeHours: number;
  totalWeightGrams: number;
  currency: string;
}

/**
 * Get filament cost per gram from inventory
 * This is a simplified version - in a real app, you'd query the Filament table
 */
function getFilamentCostPerGram(filament: SlicedFileFilament): number {
  // For now, use default costs based on filament type
  const defaultCosts: Record<string, number> = {
    'PLA': 0.025, // $0.025 per gram
    'ABS': 0.023, // $0.023 per gram  
    'PETG': 0.030, // $0.030 per gram
    'TPU': 0.045, // $0.045 per gram
    'ASA': 0.027, // $0.027 per gram
    'PC': 0.055, // $0.055 per gram
    'NYLON': 0.050, // $0.050 per gram
  };
  
  const filamentType = filament.filamentType?.toUpperCase() || 'PLA';
  return defaultCosts[filamentType] || defaultCosts['PLA'];
}

/**
 * Calculate estimated cost for a print
 */
export function calculatePrintCost(
  slicedFile: SlicedFile,
  config: CostEstimationConfig = DEFAULT_COST_CONFIG
): PrintCostBreakdown | null {
  
  // Check if we have enough data for cost estimation
  if (!slicedFile.printTimeMinutes || !slicedFile.SlicedFileFilaments?.length) {
    return null;
  }
  
  const printTimeHours = slicedFile.printTimeMinutes / 60;
  
  // Calculate material costs per filament
  const filamentCosts = slicedFile.SlicedFileFilaments
    .filter(f => f.weightUsed && f.weightUsed > 0)
    .map(filament => {
      const weightUsed = filament.weightUsed!;
      const costPerGram = getFilamentCostPerGram(filament);
      const totalCost = weightUsed * costPerGram;
      
      return {
        filamentIndex: filament.filamentIndex,
        filamentType: filament.filamentType,
        filamentColor: filament.filamentColor,
        weightUsed,
        costPerGram,
        totalCost,
      };
    });
  
  // Total material cost
  const materialCost = filamentCosts.reduce((sum, f) => sum + f.totalCost, 0);
  
  // Electricity cost (printer power * time * cost per kWh)
  const electricityCost = 
    (config.printerPowerConsumptionWatts / 1000) * // Convert to kW
    printTimeHours *
    config.electricityCostPerKwh;
  
  // Labor cost (if specified)
  const laborCost = (config.laborRatePerHour || 0) * printTimeHours;
  
  // Calculate subtotal before overhead
  const subtotal = materialCost + electricityCost + laborCost;
  
  // Overhead cost
  const overheadCost = subtotal * config.overheadPercentage;
  
  // Total cost
  const totalCost = subtotal + overheadCost;
  
  return {
    materialCost,
    filamentCosts,
    electricityCost,
    laborCost,
    overheadCost,
    totalCost,
    printTimeHours,
    totalWeightGrams: slicedFile.totalFilamentWeight || 0,
    currency: 'USD', // TODO: Make this configurable
  };
}

/**
 * Format cost as currency string
 */
export function formatCost(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get cost per hour for a print
 */
export function getCostPerHour(breakdown: PrintCostBreakdown): number {
  if (breakdown.printTimeHours === 0) return 0;
  return breakdown.totalCost / breakdown.printTimeHours;
}

/**
 * Get cost per gram for a print
 */
export function getCostPerGram(breakdown: PrintCostBreakdown): number {
  if (breakdown.totalWeightGrams === 0) return 0;
  return breakdown.totalCost / breakdown.totalWeightGrams;
}