import type { Model, ModelFile, ModelImage } from "@prisma/client";
import type { ReactNode } from "react";
import { Cell, TableBody } from "react-aria-components";
import { DocumentIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { ImageThumbnailGrid, type ImageFile } from "../ImagePreviewGallery";
import FMCell from "../ui/table/FMCell";
import FMColumn from "../ui/table/FMColumn";
import FMRow from "../ui/table/FMRow";
import FMTable from "../ui/table/FMTable";
import FMTableHeader from "../ui/table/FMTableHeader";

// Extended Model type that includes the relationships
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

export default function ModelsTable({ data }: { data: ExtendedModel[] }): ReactNode {
  return (
    <FMTable>
      <FMTableHeader>
        <FMTableHeader.Row>
          <FMColumn className="rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6 w-12">
            Images
          </FMColumn>
          <FMColumn>Name</FMColumn>
          <FMColumn>Category</FMColumn>
          <FMColumn>Files</FMColumn>
          <FMColumn className="rounded-tr-lg">Filaments</FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((model) => {
          // Convert ModelImages to ImageFile format for the thumbnail grid
          const imageFiles: ImageFile[] = model.ModelImage.map((image) => ({
            id: image.id,
            name: image.name,
            url: image.url,
            size: image.size,
          }));

          return (
            <FMRow key={model.id}>
              {/* Image Thumbnails */}
              <FMCell className="py-4 pr-3 pl-4 sm:pl-6">
                <ImageThumbnailGrid 
                  images={imageFiles} 
                  maxImages={3}
                  className="justify-start"
                />
              </FMCell>

              {/* Model Name */}
              <Cell className="relative py-4 pr-3 text-sm">
                <div className="flex items-center">
                  <div className="text-md text-foreground font-bold">
                    {model.name}
                  </div>
                </div>
                <div className="text-muted-foreground mt-1 flex flex-col sm:hidden">
                  <span>{model.Category.name}</span>
                  <span className="text-xs">
                    {model.ModelFiles.length + model.ModelImage.length} files
                  </span>
                </div>
              </Cell>

              {/* Category */}
              <FMCell className="hidden sm:table-cell">
                {model.Category.name}
              </FMCell>

              {/* File Counts */}
              <FMCell className="hidden sm:table-cell">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  {model.ModelImage.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <PhotoIcon className="h-4 w-4" />
                      <span>{model.ModelImage.length}</span>
                    </div>
                  )}
                  {model.ModelFiles.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <DocumentIcon className="h-4 w-4" />
                      <span>{model.ModelFiles.length}</span>
                    </div>
                  )}
                  {model.ModelFiles.length === 0 && model.ModelImage.length === 0 && (
                    <span className="text-xs">No files</span>
                  )}
                </div>
              </FMCell>

              {/* Filaments */}
              <FMCell className="relative py-3.5 pr-4 pl-3 text-sm font-medium sm:pr-6">
                <div className="text-muted-foreground">
                  {model.Filaments && model.Filaments.length > 0 ? (
                    <span>
                      {model.Filaments.length} filament
                      {model.Filaments.length !== 1 ? "s" : ""}
                    </span>
                  ) : (
                    <span>No filaments</span>
                  )}
                </div>
              </FMCell>
            </FMRow>
          );
        })}
      </TableBody>
    </FMTable>
  );
}
