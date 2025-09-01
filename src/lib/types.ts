// Database types based on Prisma schema

import type { FilamentType, Prisma } from "@prisma/client";

export type MaterialType = Prisma.MaterialTypeGetPayload<{}>;

export type ModelCategory = Prisma.ModelCategoryGetPayload<{}>;

export type Brand = Prisma.BrandGetPayload<{}>;

export type Model = Prisma.ModelGetPayload<{
  include: {
    Category: true;
    Filaments: {
      include: { Material: true; Type: true; Brand: true };
    };
    ModelFiles: true;
    ThreeMFFiles: {
      include: { SlicedFiles: true };
    };
  };
}>;

export type ModelFile = Prisma.ModelFileGetPayload<{}>;

export type ThreeMFFile = Prisma.ThreeMFFileGetPayload<{
  include: { SlicedFiles: true };
}>;

export type File = Prisma.FileGetPayload<{}>;

export type SlicedFileFilament = Prisma.SlicedFileFilamentGetPayload<{
  include: { filament: { include: { Brand: true; Material: true; Type: true } } };
}>;

export type SlicedFile = Prisma.SlicedFileGetPayload<{
  include: {
    SlicedFileFilaments: {
      include: { filament: { include: { Brand: true; Material: true; Type: true } } };
    };
    ThreeMFFile: true;
  };
}>;

export type Product = Prisma.ProductGetPayload<{
  include: {
    model: {
      include: {
        Category: true;
        Filaments: {
          include: { Material: true; Type: true; Brand: true };
        };
      };
    };
    slicedFile: {
      include: {
        SlicedFileFilaments: {
          include: { filament: { include: { Brand: true; Material: true; Type: true } } };
        };
        ThreeMFFile: true;
      };
    };
    Filaments: {
      include: { Material: true; Type: true; Brand: true };
    };
  };
}>;

export type Filament = Prisma.FilamentGetPayload<{
  include: { Material: true; Type: true; Models: true };
}>;

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
