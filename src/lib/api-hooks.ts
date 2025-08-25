import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filament, MaterialType, Model, Brand, CreateFilamentForm, CreateModelForm, ModelCategory, GroupedFilaments } from './types'
import { FilamentType } from '@prisma/client'

// Query keys
const QUERY_KEYS = {
  filaments: ['filaments'] as const,
  filamentsGrouped: ['filamentsGrouped'] as const,
  materialTypes: ['materialTypes'] as const,
  filamentTypes: ['filamentTypes'] as const,
  models: ['models'] as const,
  modelCategories: ['modelCategories'] as const,
  brands: ['brands'] as const,
}

// API functions
const api = {
  getFilaments: async (): Promise<Filament[]> => {
    const response = await fetch('/api/filaments')
    if (!response.ok) {
      throw new Error('Failed to fetch filaments')
    }
    return response.json()
  },

  getFilamentsGrouped: async (): Promise<GroupedFilaments> => {
    const response = await fetch('/api/filaments-grouped')
    if (!response.ok) {
      throw new Error('Failed to fetch grouped filaments')
    }
    return response.json()
  },

  getMaterialTypes: async (): Promise<MaterialType[]> => {
    const response = await fetch('/api/material-types')
    if (!response.ok) {
      throw new Error('Failed to fetch material types')
    }
    return response.json()
  },

  getFilamentTypes: async (): Promise<FilamentType[]> => {
    const response = await fetch('/api/filament-types')
    if (!response.ok) {
      throw new Error('Failed to fetch filament types')
    }
    return response.json()
  },

  getModels: async (): Promise<Model[]> => {
    const response = await fetch('/api/models')
    if (!response.ok) {
      throw new Error('Failed to fetch models')
    }
    return response.json()
  },

  getBrands: async (): Promise<Brand[]> => {
    const response = await fetch('/api/brands')
    if (!response.ok) {
      throw new Error('Failed to fetch brands')
    }
    return response.json()
  },

  getModelCategories: async (): Promise<ModelCategory[]> => {
    const response = await fetch('/api/model-categories')
    if (!response.ok) {
      throw new Error('Failed to fetch model categories')
    }
    return response.json()
  },

  createFilament: async (filament: CreateFilamentForm): Promise<Filament> => {
    const response = await fetch('/api/filaments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filament),
    })
    if (!response.ok) {
      throw new Error('Failed to create filament')
    }
    return response.json()
  },

  createModel: async (model: CreateModelForm): Promise<Model> => {
    const response = await fetch('/api/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(model),
    })
    if (!response.ok) {
      throw new Error('Failed to create model')
    }
    return response.json()
  },

  createBrand: async (name: string): Promise<Brand> => {
    const response = await fetch('/api/brands', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      throw new Error('Failed to create brand')
    }
    return response.json()
  },

  createMaterialType: async (name: string): Promise<MaterialType> => {
    const response = await fetch('/api/material-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      throw new Error('Failed to create material type')
    }
    return response.json()
  },
}

// Hooks
export function useFilaments() {
  return useQuery({
    queryKey: QUERY_KEYS.filaments,
    queryFn: api.getFilaments,
  })
}

export function useFilamentsGrouped() {
  return useQuery({
    queryKey: QUERY_KEYS.filamentsGrouped,
    queryFn: api.getFilamentsGrouped,
  })
}

export function useMaterialTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.materialTypes,
    queryFn: api.getMaterialTypes,
  })
}

export function useFilamentTypes() {
  return useQuery({
    queryKey: QUERY_KEYS.filamentTypes,
    queryFn: api.getFilamentTypes,
  })
}

export function useModels() {
  return useQuery({
    queryKey: QUERY_KEYS.models,
    queryFn: api.getModels,
  })
}

export function useBrands() {
  return useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: api.getBrands,
  })
}

export function useModelCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.modelCategories,
    queryFn: api.getModelCategories,
  })
}

export function useCreateFilament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createFilament,
    onSuccess: () => {
      // Invalidate and refetch filaments after creating a new one
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.filaments })
    },
  })
}

export function useCreateModel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createModel,
    onSuccess: () => {
      // Invalidate and refetch models after creating a new one
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.models })
    },
  })
}

export function useCreateBrand() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createBrand,
    onSuccess: (newBrand) => {
      // Optimistically update the brands cache
      queryClient.setQueryData(QUERY_KEYS.brands, (oldBrands: Brand[] = []) => {
        return [...oldBrands, newBrand].sort((a, b) => a.name.localeCompare(b.name))
      })
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands })
    },
  })
}

export function useCreateMaterialType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createMaterialType,
    onSuccess: (newMaterialType) => {
      // Optimistically update the material types cache
      queryClient.setQueryData(QUERY_KEYS.materialTypes, (oldTypes: MaterialType[] = []) => {
        return [...oldTypes, newMaterialType].sort((a, b) => a.name.localeCompare(b.name))
      })
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.materialTypes })
    },
  })
}