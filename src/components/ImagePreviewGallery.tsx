import { formatFileSize } from "@/lib/file-processing-service";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Button,
  ListBox,
  ListBoxItem,
  Modal,
  ModalOverlay,
} from "react-aria-components";

export interface ImageFile {
  id?: number;
  name: string;
  url: string;
  size: number;
  preview?: string; // For local blob URLs
  category?: "thumbnail" | "preview" | "other";
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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isLightboxOpen) return;

      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
        case "Escape":
          event.preventDefault();
          setIsLightboxOpen(false);
          break;
      }
    },
    [isLightboxOpen, handlePrevious, handleNext],
  );

  const selectedImage =
    selectedImageIndex !== null ? images[selectedImageIndex] : null;
  const canGoPrevious = selectedImageIndex !== null && selectedImageIndex > 0;
  const canGoNext =
    selectedImageIndex !== null && selectedImageIndex < images.length - 1;

  // Handle keyboard events for lightbox
  useEffect(() => {
    if (isLightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isLightboxOpen, handleKeyDown]);

  if (images.length === 0) {
    return (
      <div className={`text-muted-foreground py-8 text-center ${className}`}>
        <EyeIcon className="mx-auto mb-3 h-12 w-12 opacity-50" />
        <p>No images to display</p>
      </div>
    );
  }

  const gridColsClass = {
    3: "grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
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
              className="group bg-muted border-border hover:border-primary/50 relative aspect-square cursor-pointer overflow-hidden rounded-lg border transition-colors"
              onAction={() => handleImageClick(index)}
            >
              {/* Image */}
              <img
                src={image.preview || image.url}
                alt={image.name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/30" />

              {/* Controls overlay */}
              {showControls && (
                <div className="absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      className="rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                      onPress={() => handleImageClick(index)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    {onDelete && (
                      <Button
                        className="rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-red-500"
                        onPress={() => onDelete(image)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Image info overlay */}
              <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <p className="truncate text-xs font-medium text-white">
                  {image.name}
                </p>
                <p className="text-xs text-white/80">
                  {formatFileSize(image.size)}
                </p>
                {image.category && (
                  <span className="mt-1 inline-block rounded bg-white/20 px-1 py-0.5 text-xs text-white capitalize">
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        isDismissable
      >
        <Modal className="relative flex h-full max-h-full w-full max-w-4xl items-center justify-center">
          {selectedImage && (
            <>
              {/* Close button */}
              <Button
                className="absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                onPress={() => setIsLightboxOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </Button>

              {/* Previous button */}
              {canGoPrevious && (
                <Button
                  className="absolute top-1/2 left-4 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  onPress={handlePrevious}
                >
                  <ChevronLeftIcon className="h-6 w-6" />
                </Button>
              )}

              {/* Next button */}
              {canGoNext && (
                <Button
                  className="absolute top-1/2 right-4 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  onPress={handleNext}
                >
                  <ChevronRightIcon className="h-6 w-6" />
                </Button>
              )}

              {/* Main image */}
              <img
                src={selectedImage.preview || selectedImage.url}
                alt={selectedImage.name}
                className="max-h-full max-w-full object-contain"
              />

              {/* Image info */}
              <div className="absolute right-4 bottom-4 left-4 rounded-lg bg-black/50 p-4 text-white">
                <h3 className="mb-1 text-lg font-semibold">
                  {selectedImage.name}
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <span>{formatFileSize(selectedImage.size)}</span>
                  <span>
                    {selectedImageIndex! + 1} of {images.length}
                  </span>
                </div>
                {selectedImage.category && (
                  <span className="mt-2 inline-block rounded bg-white/20 px-2 py-1 text-xs text-white capitalize">
                    {selectedImage.category}
                  </span>
                )}
                {onDelete && (
                  <Button
                    className="mt-2 ml-auto rounded bg-red-500 px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
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
          className="border-border bg-muted relative h-8 w-8 overflow-hidden rounded-full border"
        >
          <img
            src={image.preview || image.url}
            alt={image.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
      {remainingCount > 0 && (
        <div className="bg-muted border-border flex h-8 w-8 items-center justify-center rounded-full border">
          <span className="text-muted-foreground text-xs font-medium">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}

