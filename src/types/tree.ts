export interface TreeNode {
  id: string;
  name: string;
  type: 'model' | 'modelFile' | 'modelImage';
  
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
  };
}