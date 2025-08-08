// Database types based on Prisma schema

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

export interface Filament {
  id: number;
  color: string;
  materialTypeId: number;
  Material: MaterialType;
  Models?: Model[];
  cost: number | null;
  grams: number | null;
  brandName: string;
  Brand: Brand;
  diameter: number;
}

// Form types for creating filaments
export interface CreateFilamentForm {
  color: string;
  materialTypeId: number;
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
}