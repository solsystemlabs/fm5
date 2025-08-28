import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Filament, MaterialType, Model, Brand, CreateFilamentForm, CreateModelForm, CreateProductForm, ModelCategory, GroupedFilaments, Product, SlicedFile } from './types'
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
  products: ['products'] as const,
  slicedFiles: ['slicedFiles'] as const,
  modelFiles: ['modelFiles'] as const,
  modelFilesByModel: (modelId: number) => ['modelFiles', 'byModel', modelId] as const,
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

  createFilamentType: async (name: string): Promise<FilamentType> => {
    const response = await fetch('/api/filament-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      throw new Error('Failed to create filament type')
    }
    return response.json()
  },

  createModelCategory: async (name: string): Promise<ModelCategory> => {
    const response = await fetch('/api/model-categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      throw new Error('Failed to create model category')
    }
    return response.json()
  },

  getProducts: async (): Promise<Product[]> => {
    const response = await fetch('/api/products')
    if (!response.ok) {
      throw new Error('Failed to fetch products')
    }
    return response.json()
  },

  createProduct: async (product: CreateProductForm): Promise<Product> => {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    })
    if (!response.ok) {
      throw new Error('Failed to create product')
    }
    return response.json()
  },

  getSlicedFiles: async (): Promise<SlicedFile[]> => {
    const response = await fetch('/api/sliced-files')
    if (!response.ok) {
      throw new Error('Failed to fetch sliced files')
    }
    return response.json()
  },

  uploadSlicedFile: async (formData: FormData): Promise<SlicedFile> => {
    const response = await fetch('/api/sliced-files', {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload sliced file')
    }
    return response.json()
  },

  uploadSlicedFileWithProgress: (
    formData: FormData,
    onProgress?: (progress: { loaded: number; total: number; percentage: number; speed?: string; timeRemaining?: string }) => void
  ): Promise<SlicedFile> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const startTime = Date.now()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const now = Date.now()
          const elapsedTime = now - startTime
          const speed = event.loaded / elapsedTime * 1000 // bytes/sec
          const timeRemaining = (event.total - event.loaded) / speed / 1000 // seconds
          
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
            speed: `${(speed / 1024 / 1024).toFixed(1)} MB/s`,
            timeRemaining: `${Math.round(timeRemaining)}s`
          })
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            resolve(result)
          } catch (error) {
            reject(new Error('Failed to parse server response'))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.error || `Upload failed with status ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })
      
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'))
      })
      
      xhr.open('POST', '/api/sliced-files')
      xhr.timeout = 10 * 60 * 1000 // 10 minutes timeout
      xhr.send(formData)
    })
  },

  getModelFiles: async (): Promise<any> => {
    const response = await fetch('/api/model-files')
    if (!response.ok) {
      throw new Error('Failed to fetch model files')
    }
    return response.json()
  },

  getModelFilesByModel: async (modelId: number): Promise<any> => {
    const response = await fetch(`/api/models/${modelId}/files`)
    if (!response.ok) {
      throw new Error('Failed to fetch model files')
    }
    return response.json()
  },

  uploadModelFiles: async (modelId: number, formData: FormData): Promise<any> => {
    const response = await fetch(`/api/models/${modelId}/files`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to upload model files')
    }
    return response.json()
  },

  uploadModelFilesWithProgress: (
    modelId: number,
    formData: FormData,
    onProgress?: (progress: { loaded: number; total: number; percentage: number; speed?: string; timeRemaining?: string }) => void
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const startTime = Date.now()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const now = Date.now()
          const elapsedTime = now - startTime
          const speed = event.loaded / elapsedTime * 1000 // bytes/sec
          const timeRemaining = (event.total - event.loaded) / speed / 1000 // seconds
          
          onProgress({
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
            speed: `${(speed / 1024 / 1024).toFixed(1)} MB/s`,
            timeRemaining: `${Math.round(timeRemaining)}s`
          })
        }
      })
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const result = JSON.parse(xhr.responseText)
            resolve(result)
          } catch (error) {
            reject(new Error('Failed to parse server response'))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.error || `Upload failed with status ${xhr.status}`))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })
      
      xhr.addEventListener('timeout', () => {
        reject(new Error('Upload timed out'))
      })
      
      xhr.open('POST', `/api/models/${modelId}/files`)
      xhr.timeout = 10 * 60 * 1000 // 10 minutes timeout
      xhr.send(formData)
    })
  },

  deleteModelFiles: async (fileIds: number[], type: 'modelFile' | 'modelImage'): Promise<any> => {
    const response = await fetch('/api/model-files', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fileIds, type }),
    })
    if (!response.ok) {
      throw new Error('Failed to delete model files')
    }
    return response.json()
  },

  deleteModel: async (modelId: number): Promise<any> => {
    const response = await fetch(`/api/models/${modelId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete model')
    }
    return response.json()
  },

  deleteFilament: async (filamentId: number): Promise<any> => {
    const response = await fetch(`/api/filaments/${filamentId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete filament')
    }
    return response.json()
  },

  deleteProduct: async (productId: number): Promise<any> => {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete product')
    }
    return response.json()
  },

  deleteSlicedFile: async (slicedFileId: number): Promise<any> => {
    const response = await fetch(`/api/sliced-files/${slicedFileId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete sliced file')
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

export function useCreateFilamentType() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createFilamentType,
    onSuccess: (newFilamentType) => {
      // Optimistically update the filament types cache
      queryClient.setQueryData(QUERY_KEYS.filamentTypes, (oldTypes: FilamentType[] = []) => {
        return [...oldTypes, newFilamentType].sort((a, b) => a.name.localeCompare(b.name))
      })
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.filamentTypes })
    },
  })
}

export function useCreateModelCategory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createModelCategory,
    onSuccess: (newModelCategory) => {
      // Optimistically update the model categories cache
      queryClient.setQueryData(QUERY_KEYS.modelCategories, (oldCategories: ModelCategory[] = []) => {
        return [...oldCategories, newModelCategory].sort((a, b) => a.name.localeCompare(b.name))
      })
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelCategories })
    },
  })
}

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: api.getProducts,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      // Invalidate and refetch products after creating a new one
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
    },
  })
}

export function useSlicedFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.slicedFiles,
    queryFn: api.getSlicedFiles,
  })
}

export function useUploadSlicedFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.uploadSlicedFile,
    onSuccess: () => {
      // Invalidate and refetch sliced files after uploading a new one
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slicedFiles })
    },
  })
}

export function useUploadSlicedFileWithProgress() {
  const queryClient = useQueryClient()
  
  return {
    uploadWithProgress: (
      formData: FormData,
      onProgress?: (progress: { loaded: number; total: number; percentage: number; speed?: string; timeRemaining?: string }) => void
    ) => {
      return api.uploadSlicedFileWithProgress(formData, onProgress).then((result) => {
        // Invalidate and refetch sliced files after uploading a new one
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slicedFiles })
        return result
      })
    }
  }
}

export function useModelFiles() {
  return useQuery({
    queryKey: QUERY_KEYS.modelFiles,
    queryFn: api.getModelFiles,
  })
}

export function useModelFilesByModel(modelId: number) {
  return useQuery({
    queryKey: QUERY_KEYS.modelFilesByModel(modelId),
    queryFn: () => api.getModelFilesByModel(modelId),
    enabled: !!modelId,
  })
}

export function useUploadModelFiles() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ modelId, formData }: { modelId: number; formData: FormData }) => 
      api.uploadModelFiles(modelId, formData),
    onSuccess: (_, { modelId }) => {
      // Invalidate relevant queries after uploading files
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.models })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelFiles })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelFilesByModel(modelId) })
    },
  })
}

export function useUploadModelFilesWithProgress() {
  const queryClient = useQueryClient()
  
  return {
    uploadWithProgress: (
      modelId: number,
      formData: FormData,
      onProgress?: (progress: { loaded: number; total: number; percentage: number; speed?: string; timeRemaining?: string }) => void
    ) => {
      return api.uploadModelFilesWithProgress(modelId, formData, onProgress).then((result) => {
        // Invalidate relevant queries after uploading files
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.models })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelFiles })
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelFilesByModel(modelId) })
        return result
      })
    }
  }
}

export function useDeleteModelFiles() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ fileIds, type }: { fileIds: number[]; type: 'modelFile' | 'modelImage' }) =>
      api.deleteModelFiles(fileIds, type),
    onSuccess: () => {
      // Invalidate relevant queries after deleting files
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.models })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelFiles })
      // Also invalidate all model-specific file queries
      queryClient.invalidateQueries({ queryKey: ['modelFiles', 'byModel'] })
    },
  })
}

export function useDeleteModel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteModel,
    onSuccess: () => {
      // Invalidate relevant queries after deleting model
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.models })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.modelFiles })
    },
  })
}

export function useDeleteFilament() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteFilament,
    onSuccess: () => {
      // Invalidate relevant queries after deleting filament
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.filaments })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.filamentsGrouped })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.models }) // Models might reference filaments
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteProduct,
    onSuccess: () => {
      // Invalidate relevant queries after deleting product
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
    },
  })
}

export function useDeleteSlicedFile() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteSlicedFile,
    onSuccess: () => {
      // Invalidate relevant queries after deleting sliced file
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.slicedFiles })
    },
  })
}