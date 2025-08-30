export interface TreeNode {
  id: string;
  name: string;
  type: 'model' | 'modelFile' | 'modelImage' | 'threeMFFile' | 'slicedFile';
  
  // Model-specific properties
  category?: string;
  thumbnails?: Array<{
    id: number;
    name: string;
    url: string;
    size: number;
  }>;
  fileCounts?: {
    files: number;
    images: number;
    slicedFiles?: number;
    total: number;
  };
  filaments?: Array<{
    id: number;
    name: string;
    Brand: {
      name: string;
    };
  }>;
  
  // File-specific properties
  size?: number;
  url?: string;
  fileExtension?: string;
  mimeType?: string;
  
  // 3MF-specific properties
  hasGcode?: boolean;
  
  // Sliced file-specific properties
  printTimeMinutes?: number;
  
  // Hierarchy
  children?: TreeNode[];
  
  // Original data for actions
  originalData?: any;
}

export interface ModelsTreeData {
  models: TreeNode[];
  summary: {
    totalModels: number;
    totalFiles: number;
    totalImages: number;
    totalSlicedFiles: number;
    breakdown?: {
      modelFiles: number;
      threeMFFiles: number;
      slicedFiles: number;
      images: number;
    };
  };
}