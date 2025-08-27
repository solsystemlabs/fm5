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

export interface SlicedFile {
  id: number;
  name: string;
  modelId: number;
  url: string;
  size: number;
  modelFileId?: number;
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

// User Profile types
export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
  profile: {
    bio?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    location?: string;
    website?: string;
    profileViews: number;
    isPublic: boolean;
    lastProfileEdit?: string;
  };
  settings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    profileVisibility: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
    language: string;
    timezone: string;
    theme: "LIGHT" | "DARK" | "SYSTEM";
    marketingEmails: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileForm {
  name?: string;
  profile?: {
    bio?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    location?: string;
    website?: string;
    isPublic?: boolean;
  };
}

export interface ChangePasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeEmailForm {
  newEmail: string;
  password: string;
}

export interface UpdateSettingsForm {
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  profileVisibility?: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  language?: string;
  timezone?: string;
  theme?: "LIGHT" | "DARK" | "SYSTEM";
  marketingEmails?: boolean;
}

export interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

