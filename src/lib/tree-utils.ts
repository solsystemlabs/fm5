import type { TreeNode, ModelsTreeData } from "@/types/tree";
import type { Model, ModelFile, ThreeMFFile, File } from "@prisma/client";

// Extended Model type that includes the relationships (matches new schema)
interface ExtendedModel extends Model {
  Category: {
    name: string;
  };
  Filaments?: Array<{
    id: number;
    name: string;
    Brand: {
      name: string;
    };
  }>;
  ModelFiles: ModelFile[];
  ThreeMFFiles: Array<ThreeMFFile & {
    SlicedFiles?: any[];
  }>;
}

export function transformModelsToTree(models: any[], modelImages?: Record<number, any[]>): ModelsTreeData {
  const treeNodes: TreeNode[] = models.map((model) => {
    // Create file nodes for model files (STL, OBJ, etc.)
    const modelFileNodes: TreeNode[] = (model.ModelFiles || []).map((file) => ({
      id: `modelFile-${file.id}`,
      name: file.name,
      type: 'modelFile' as const,
      size: file.size,
      url: file.url,
      fileExtension: file.name.split('.').pop() || '',
      originalData: { ...file, modelId: model.id },
    }));

    // Create nodes for 3MF containers
    const threeMFNodes: TreeNode[] = (model.ThreeMFFiles || []).map((threeMF) => {
      // Create child nodes for sliced files within this 3MF
      const slicedFileNodes: TreeNode[] = (threeMF.SlicedFiles || []).map((slicedFile) => ({
        id: `slicedFile-${slicedFile.id}`,
        name: slicedFile.name,
        type: 'slicedFile' as const,
        size: slicedFile.size,
        url: slicedFile.url,
        fileExtension: 'gcode',
        printTimeMinutes: slicedFile.printTimeMinutes,
        originalData: slicedFile,
      }));

      return {
        id: `threeMF-${threeMF.id}`,
        name: threeMF.name,
        type: 'threeMFFile' as const,
        size: threeMF.size,
        url: threeMF.url,
        fileExtension: '3mf',
        hasGcode: threeMF.hasGcode,
        children: slicedFileNodes.length > 0 ? slicedFileNodes : undefined,
        originalData: { ...threeMF, modelId: model.id },
      };
    });

    // Get images for this model from the tagged union File system
    const modelImageList = modelImages?.[model.id] || [];
    const imageNodes: TreeNode[] = modelImageList.map((image) => ({
      id: `image-${image.id}`,
      name: image.name,
      type: 'modelImage' as const,
      size: image.size,
      url: image.url,
      fileExtension: image.name.split('.').pop() || '',
      mimeType: image.mimeType,
      originalData: { ...image, modelId: model.id },
    }));

    // Combine all child nodes
    const children = [...modelFileNodes, ...threeMFNodes, ...imageNodes];

    // Create thumbnails from model images
    const thumbnails = modelImageList.map((image) => ({
      id: image.id,
      name: image.name,
      url: image.url,
      size: image.size,
    }));

    // Calculate file counts
    const totalSlicedFiles = (model.ThreeMFFiles || []).reduce(
      (sum, threeMF) => sum + (threeMF.SlicedFiles?.length || 0), 
      0
    );

    // Create the model node
    const modelNode: TreeNode = {
      id: model.id.toString(),
      name: model.name,
      type: 'model' as const,
      category: model.Category.name,
      thumbnails,
      fileCounts: {
        files: (model.ModelFiles?.length || 0) + (model.ThreeMFFiles?.length || 0),
        images: modelImageList.length,
        slicedFiles: totalSlicedFiles,
        total: (model.ModelFiles?.length || 0) + (model.ThreeMFFiles?.length || 0) + modelImageList.length + totalSlicedFiles,
      },
      filaments: model.Filaments,
      children: children.length > 0 ? children : undefined,
      originalData: model,
    };

    return modelNode;
  });

  // Calculate summary statistics
  const totalModelFiles = models.reduce((sum, model) => sum + (model.ModelFiles?.length || 0), 0);
  const totalThreeMFFiles = models.reduce((sum, model) => sum + (model.ThreeMFFiles?.length || 0), 0);
  const totalSlicedFiles = models.reduce((sum, model) => 
    sum + (model.ThreeMFFiles || []).reduce((slicedSum, threeMF) => 
      slicedSum + (threeMF.SlicedFiles?.length || 0), 0), 0);
  const totalImages = Object.values(modelImages || {}).reduce((sum, images) => sum + images.length, 0);

  const summary = {
    totalModels: models.length,
    totalFiles: totalModelFiles + totalThreeMFFiles,
    totalImages,
    totalSlicedFiles,
    breakdown: {
      modelFiles: totalModelFiles,
      threeMFFiles: totalThreeMFFiles,
      slicedFiles: totalSlicedFiles,
      images: totalImages,
    },
  };

  return {
    models: treeNodes,
    summary,
  };
}

export function getExpandedKeysForModelsWithFiles(treeData: TreeNode[]): Set<string> {
  const expandedKeys = new Set<string>();
  
  treeData.forEach((node) => {
    if (node.children && node.children.length > 0) {
      expandedKeys.add(node.id);
    }
  });
  
  return expandedKeys;
}