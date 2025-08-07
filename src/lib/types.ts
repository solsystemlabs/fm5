// Database types based on Prisma schema

export interface Filament {
  id: string;
  color: string;
  materialTypeId: string;
  material: MaterialType;
  models: Model[];
}

export interface MaterialType {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  modelCategoryId: string;
  category: ModelCategory;
}

export interface ModelCategory {
  id: string;
  name: string;
}

// Form types for creating filaments
export interface CreateFilamentForm {
  color: string;
  materialTypeId: string;
  modelIds: string[];
}