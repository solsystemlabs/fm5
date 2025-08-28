import type { TreeNode, ModelsTreeData } from "@/types/tree";
import type { Model, ModelFile, ModelImage } from "@prisma/client";

// Extended Model type that includes the relationships (matches existing type)
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
  ModelImage: ModelImage[];
}

export function transformModelsToTree(models: ExtendedModel[]): ModelsTreeData {
  const treeNodes: TreeNode[] = models.map((model) => {
    // Create file nodes for model files
    const fileNodes: TreeNode[] = model.ModelFiles.map((file) => ({
      id: `file-${file.id}`,
      name: file.name,
      type: 'modelFile' as const,
      size: file.size,
      url: file.url,
      fileExtension: file.name.split('.').pop() || '',
      originalData: file,
    }));

    // Create file nodes for model images
    const imageNodes: TreeNode[] = model.ModelImage.map((image) => ({
      id: `image-${image.id}`,
      name: image.name,
      type: 'modelImage' as const,
      size: image.size,
      url: image.url,
      fileExtension: image.name.split('.').pop() || '',
      originalData: image,
    }));

    // Combine all child nodes
    const children = [...fileNodes, ...imageNodes];

    // Create thumbnails from model images
    const thumbnails = model.ModelImage.map((image) => ({
      id: image.id,
      name: image.name,
      url: image.url,
      size: image.size,
    }));

    // Create the model node
    const modelNode: TreeNode = {
      id: model.id.toString(),
      name: model.name,
      type: 'model' as const,
      category: model.Category.name,
      thumbnails,
      fileCounts: {
        files: model.ModelFiles.length,
        images: model.ModelImage.length,
        total: model.ModelFiles.length + model.ModelImage.length,
      },
      filaments: model.Filaments,
      children: children.length > 0 ? children : undefined,
      originalData: model,
    };

    return modelNode;
  });

  // Calculate summary statistics
  const summary = {
    totalModels: models.length,
    totalFiles: models.reduce((sum, model) => sum + model.ModelFiles.length, 0),
    totalImages: models.reduce((sum, model) => sum + model.ModelImage.length, 0),
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