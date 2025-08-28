import { type ReactNode, useState } from "react";
import { Cell, TableBody } from "react-aria-components";
import { Link } from "@tanstack/react-router";
import { 
  DocumentIcon, 
  PhotoIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  TrashIcon 
} from "@heroicons/react/24/outline";
import { useDeleteModelFiles } from "@/lib/api-hooks";
import { formatFileSize } from "@/lib/file-processing-service";
import ImagePreviewGallery, { type ImageFile } from "../ImagePreviewGallery";
import FMCell from "../ui/table/FMCell";
import FMColumn from "../ui/table/FMColumn";
import FMRow from "../ui/table/FMRow";
import FMTable from "../ui/table/FMTable";
import FMTableHeader from "../ui/table/FMTableHeader";

interface ModelFileData {
  id: number;
  name: string;
  url: string;
  size: number;
  type: 'modelFile' | 'modelImage';
  fileExtension: string;
  Model: {
    id: number;
    name: string;
    Category: {
      name: string;
    };
  };
}

interface ModelFilesTableProps {
  data: ModelFileData[];
}

export default function ModelFilesTable({ data }: ModelFilesTableProps): ReactNode {
  const deleteModelFilesMutation = useDeleteModelFiles();
  const [selectedImages, setSelectedImages] = useState<ImageFile[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);

  const handleDelete = async (file: ModelFileData) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) {
      return;
    }

    try {
      await deleteModelFilesMutation.mutateAsync({
        fileIds: [file.id],
        type: file.type,
      });
    } catch (error) {
      alert(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = (file: ModelFileData) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImagePreview = (file: ModelFileData) => {
    const imageFile: ImageFile = {
      id: file.id,
      name: file.name,
      url: file.url,
      size: file.size,
    };
    setSelectedImages([imageFile]);
    setShowImageGallery(true);
  };

  const getFileTypeIcon = (file: ModelFileData) => {
    if (file.type === 'modelImage') {
      return <PhotoIcon className="h-5 w-5 text-blue-500" />;
    }
    return <DocumentIcon className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeLabel = (file: ModelFileData) => {
    if (file.type === 'modelImage') {
      return 'Image';
    }
    return file.fileExtension.toUpperCase();
  };

  if (data.length === 0) {
    return (
      <div className="mt-8 text-center py-12">
        <DocumentIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No model files found</h3>
        <p className="text-muted-foreground">
          Model files and images will appear here once you upload them through individual models.
        </p>
      </div>
    );
  }

  return (
    <>
      <FMTable>
        <FMTableHeader>
          <FMTableHeader.Row>
            <FMColumn className="rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6 w-12">
              Type
            </FMColumn>
            <FMColumn>Name</FMColumn>
            <FMColumn>Model</FMColumn>
            <FMColumn>Category</FMColumn>
            <FMColumn>Size</FMColumn>
            <FMColumn className="rounded-tr-lg">Actions</FMColumn>
          </FMTableHeader.Row>
        </FMTableHeader>
        <TableBody>
          {data.map((file) => (
            <FMRow key={`${file.type}-${file.id}`}>
              {/* File Type Icon */}
              <FMCell className="py-4 pr-3 pl-4 sm:pl-6">
                <div className="flex items-center">
                  {getFileTypeIcon(file)}
                </div>
              </FMCell>

              {/* File Name */}
              <Cell className="relative py-4 pr-3 text-sm">
                <div className="flex items-center">
                  <div>
                    <div className="text-md text-foreground font-medium truncate max-w-xs">
                      {file.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {getFileTypeLabel(file)}
                    </div>
                  </div>
                </div>
              </Cell>

              {/* Model Name */}
              <FMCell>
                <Link
                  to="/models"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  {file.Model.name}
                </Link>
              </FMCell>

              {/* Category */}
              <FMCell className="text-muted-foreground">
                {file.Model.Category.name}
              </FMCell>

              {/* File Size */}
              <FMCell className="text-muted-foreground">
                {formatFileSize(file.size)}
              </FMCell>

              {/* Actions */}
              <FMCell className="py-3.5 pr-4 pl-3 text-sm sm:pr-6">
                <div className="flex items-center space-x-2">
                  {file.type === 'modelImage' && (
                    <button
                      onClick={() => handleImagePreview(file)}
                      className="text-muted-foreground hover:text-primary p-1 rounded"
                      title="Preview image"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDownload(file)}
                    className="text-muted-foreground hover:text-primary p-1 rounded"
                    title="Download file"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(file)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded"
                    title="Delete file"
                    disabled={deleteModelFilesMutation.isPending}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </FMCell>
            </FMRow>
          ))}
        </TableBody>
      </FMTable>

      {/* Image Preview Gallery */}
      {showImageGallery && selectedImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowImageGallery(false)}
              className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-center h-full p-8">
            <img
              src={selectedImages[0].url}
              alt={selectedImages[0].name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-1">{selectedImages[0].name}</h3>
            <p className="text-sm">{formatFileSize(selectedImages[0].size)}</p>
          </div>
        </div>
      )}
    </>
  );
}