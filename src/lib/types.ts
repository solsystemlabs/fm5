// Database types based on Prisma schema

import type { FilamentType } from "@prisma/client";

export interface MaterialType {
  id: number;
  name: string;
}

export interface ModelCategory {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface Model {
  id: number;
  name: string;
  modelCategoryId: number;
  Category: ModelCategory;
  Filaments?: Filament[];
}

export interface SlicedFileFilament {
  id: number;
  slicedFileId: number;
  filamentIndex: number;
  
  // Total usage
  lengthUsed?: number;
  volumeUsed?: number;
  weightUsed?: number;
  
  // Usage breakdown by purpose (when available)
  modelLength?: number;
  modelVolume?: number;
  modelWeight?: number;
  supportLength?: number;
  supportVolume?: number;
  supportWeight?: number;
  towerLength?: number;
  towerVolume?: number;
  towerWeight?: number;
  wasteLength?: number;
  wasteVolume?: number;
  wasteWeight?: number;
  infillLength?: number;
  infillVolume?: number;
  infillWeight?: number;
  wallLength?: number;
  wallVolume?: number;
  wallWeight?: number;
  
  // Filament properties
  filamentType?: string;
  filamentColor?: string;
  filamentVendor?: string;
  density?: number;
  diameter?: number;
  nozzleTemp?: number;
  bedTemp?: number;
  filamentId?: number;
}

export interface SlicedFile {
  id: number;
  name: string;
  modelId: number;
  url: string;
  size: number;
  s3Key?: string;
  modelFileId?: number;
  
  // Basic print information
  printTimeMinutes?: number;
  totalTimeMinutes?: number;
  layerCount?: number;
  layerHeight?: number;
  maxZHeight?: number;
  
  // Slicer information
  slicerName?: string;
  slicerVersion?: string;
  profileName?: string;
  
  // Printer settings
  nozzleDiameter?: number;
  bedType?: string;
  bedTemperature?: number;
  
  // Filament totals (aggregated across all filaments)
  totalFilamentLength?: number;
  totalFilamentVolume?: number;
  totalFilamentWeight?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relationships
  SlicedFileFilaments?: SlicedFileFilament[];
  ModelFile?: any; // Can be expanded later if needed
}

export interface Product {
  id: number;
  name: string;
  modelId: number;
  model: Model;
  price: number | null;
  slicedFileId: number;
  slicedFile: SlicedFile;
  Filaments?: Filament[];
}

export interface Filament {
  id: number;
  name: string;
  color: string;
  materialTypeId: number;
  Material: MaterialType;
  filamentTypeId: number;
  Type: FilamentType;
  Models?: Model[];
  cost: number | null;
  grams: number | null;
  brandName: string;
  Brand: Brand;
  diameter: number;
}

// Form types for creating filaments
export interface CreateFilamentForm {
  name: string;
  color: string;
  materialTypeId: number;
  filamentTypeId: number;
  modelIds: number[];
  cost?: number;
  grams?: number;
  brandName: string;
  diameter: number;
}

// Form types for creating models
export interface CreateModelForm {
  name: string;
  modelCategoryId: number;
  filamentIds?: number[];
}

// Form types for creating products
export interface CreateProductForm {
  name: string;
  modelId: number;
  filamentIds?: number[];
  price?: number;
  slicedFileId: number;
}

// Grouped filaments response type
export interface GroupedFilaments {
  [filamentTypeName: string]: Filament[];
}
