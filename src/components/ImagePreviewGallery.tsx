import { type ReactNode, useState, useCallback } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
} from "react-aria-components";
import { 
  XMarkIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  TrashIcon,
  EyeIcon 
} from "@heroicons/react/24/outline";
import { formatFileSize } from "@/lib/file-processing-service";

export interface ImageFile {
  id?: number;
  name: string;
  url: string;
  size: number;
  preview?: string; // For local blob URLs
  category?: 'thumbnail' | 'preview' | 'other';
}

interface ImagePreviewGalleryProps {
  images: ImageFile[];
  onDelete?: (image: ImageFile) => void;
  className?: string;
  gridCols?: 3 | 4 | 5 | 6;
  showControls?: boolean;
}

export default function ImagePreviewGallery({
  images,
  onDelete,
  className = "",
  gridCols = 4,
  showControls = true,
}: ImagePreviewGalleryProps): ReactNode {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const handleImageClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const handlePrevious = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  }, [selectedImageIndex]);

  const handleNext = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  }, [selectedImageIndex, images.length]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isLightboxOpen) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        handlePrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleNext();
        break;
      case 'Escape':
        event.preventDefault();
        setIsLightboxOpen(false);
        break;
    }
  }, [isLightboxOpen, handlePrevious, handleNext]);

  const selectedImage = selectedImageIndex !== null ? images[selectedImageIndex] : null;
  const canGoPrevious = selectedImageIndex !== null && selectedImageIndex > 0;
  const canGoNext = selectedImageIndex !== null && selectedImageIndex < images.length - 1;

  if (images.length === 0) {
    return (
      <div className={`text-center py-8 text-muted-foreground ${className}`}>
        <EyeIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No images to display</p>
      </div>
    );
  }

  const gridColsClass = {
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[gridCols];

  return (
    <>
      <div className={className}>
        <ListBox
          aria-label="Image gallery"
          className={`grid ${gridColsClass} gap-4`}
          items={images.map((image, index) => ({ image, index }))}
        >
          {({ image, index }) => (
            <ListBoxItem
              key={image.id || index}
              textValue={image.name}
              className="group relative aspect-square bg-muted rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors cursor-pointer"
              onAction={() => handleImageClick(index)}
            >
              {/* Image */}
              <img
                src={image.preview || image.url}
                alt={image.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
              
              {/* Controls overlay */}
              {showControls && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      className="p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      onPress={() => handleImageClick(index)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        className="p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        onPress={(e) => {
                          e.stopPropagation();
                          onDelete(image);
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Image info overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs font-medium truncate">{image.name}</p>
                <p className="text-white/80 text-xs">{formatFileSize(image.size)}</p>
                {image.category && (
                  <span className="inline-block bg-white/20 text-white text-xs px-1 py-0.5 rounded mt-1 capitalize">
                    {image.category}
                  </span>
                )}
              </div>
            </ListBoxItem>
          )}
        </ListBox>
      </div>

      {/* Lightbox Modal */}
      <ModalOverlay 
        isOpen={isLightboxOpen}
        onOpenChange={setIsLightboxOpen}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        isDismissable
      >
        <Modal 
          className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center"
          onKeyDown={handleKeyDown}
        >
          {selectedImage && (
            <>
              {/* Close button */}
              <Button
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                onPress={() => setIsLightboxOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>

              {/* Previous button */}
              {canGoPrevious && (
                <Button
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  onPress={handlePrevious}
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </Button>
              )}

              {/* Next button */}
              {canGoNext && (
                <Button
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                  onPress={handleNext}
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </Button>
              )}

              {/* Main image */}
              <img
                src={selectedImage.preview || selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain"
              />

              {/* Image info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-1">{selectedImage.name}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span>{formatFileSize(selectedImage.size)}</span>
                  <span>{selectedImageIndex! + 1} of {images.length}</span>
                </div>
                {selectedImage.category && (
                  <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded mt-2 capitalize">
                    {selectedImage.category}
                  </span>
                )}
                {onDelete && (
                  <Button
                    className="ml-auto mt-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm transition-colors"
                    onPress={() => {
                      onDelete(selectedImage);
                      setIsLightboxOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </>
          )}
        </Modal>
      </ModalOverlay>
    </>
  );
}

// Simplified version for showing just image thumbnails without controls
export function ImageThumbnailGrid({
  images,
  className = "",
  maxImages = 4,
}: {
  images: ImageFile[];
  className?: string;
  maxImages?: number;
}): ReactNode {
  const visibleImages = images.slice(0, maxImages);
  const remainingCount = Math.max(0, images.length - maxImages);

  if (images.length === 0) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {visibleImages.map((image, index) => (
        <div
          key={image.id || index}
          className="relative w-8 h-8 rounded-full overflow-hidden border border-border bg-muted"
        >
          <img
            src={image.preview || image.url}
            alt={image.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}