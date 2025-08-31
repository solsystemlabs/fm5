import type { Model, ModelFile, ThreeMFFile, File } from "@prisma/client";
import type { ReactNode } from "react";
import { Cell, TableBody } from "react-aria-components";
import { DocumentIcon, PhotoIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { Link } from "@tanstack/react-router";
import { ImageThumbnailGrid, type ImageFile } from "../ImagePreviewGallery";
import { UploadStatusCell } from "./UploadStatusCell";
import { DeleteConfirmDialog } from "../ui/DeleteConfirmDialog";
import { useDeleteModelTRPC } from "@/lib/trpc-hooks";
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
  ThreeMFFiles: ThreeMFFile[];
}

export default function ModelsTable({ data }: { data: ExtendedModel[] }): ReactNode {
  const deleteModel = useDeleteModelTRPC();

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
          <FMColumn>Filaments</FMColumn>
          <FMColumn>Status</FMColumn>
          <FMColumn className="rounded-tr-lg w-20">
            <span className="sr-only">Actions</span>
          </FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((model) => {
          // Note: Images are now in the tagged union File system and would need to be fetched separately
          const imageFiles: ImageFile[] = [];

          return (
            <FMRow key={model.id} className="hover:bg-muted/50 transition-colors group cursor-pointer">
              {/* Image Thumbnails */}
              <FMCell className="py-4 pr-3 pl-4 sm:pl-6">
                <ImageThumbnailGrid 
                  images={imageFiles} 
                  maxImages={3}
                  className="justify-start group-hover:scale-105 transition-transform"
                />
              </FMCell>

              {/* Model Name */}
              <Cell className="relative py-4 pr-3 text-sm">
                <div className="flex items-center">
                  <div className="text-md text-foreground font-bold group-hover:text-primary transition-colors">
                    {model.name}
                  </div>
                </div>
                <div className="text-muted-foreground mt-1 flex flex-col sm:hidden">
                  <span>{model.Category.name}</span>
                  <span className="text-xs">
                    {model.ModelFiles.length + model.ThreeMFFiles.length} files
                  </span>
                </div>
              </Cell>

              {/* Category */}
              <FMCell className="hidden sm:table-cell text-muted-foreground">
                {model.Category.name}
              </FMCell>

              {/* File Counts */}
              <FMCell className="hidden sm:table-cell">
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  {model.ThreeMFFiles.length > 0 && (
                    <div className="flex items-center space-x-1 group-hover:text-blue-500 transition-colors">
                      <PhotoIcon className="h-4 w-4" />
                      <span>{model.ThreeMFFiles.length}</span>
                    </div>
                  )}
                  {model.ModelFiles.length > 0 && (
                    <div className="flex items-center space-x-1 group-hover:text-green-500 transition-colors">
                      <DocumentIcon className="h-4 w-4" />
                      <span>{model.ModelFiles.length}</span>
                    </div>
                  )}
                  {model.ModelFiles.length === 0 && model.ThreeMFFiles.length === 0 && (
                    <span className="text-xs">No files</span>
                  )}
                </div>
              </FMCell>

              {/* Filaments */}
              <FMCell className="hidden sm:table-cell text-muted-foreground">
                {model.Filaments && model.Filaments.length > 0 ? (
                  <span>
                    {model.Filaments.length} filament
                    {model.Filaments.length !== 1 ? "s" : ""}
                  </span>
                ) : (
                  <span>No filaments</span>
                )}
              </FMCell>

              {/* Upload Status */}
              <UploadStatusCell 
                modelId={model.id}
                className="hidden sm:table-cell"
              />

              {/* Actions */}
              <FMCell className="py-4 pr-4 pl-3 text-right sm:pr-6">
                <div className="flex items-center justify-end gap-2">
                  <DeleteConfirmDialog
                    title="Delete Model"
                    description="Are you sure you want to delete this model? This will also delete all associated files and images."
                    itemName={model.name}
                    onConfirm={() => deleteModel.mutate(model.id)}
                    isLoading={deleteModel.isPending}
                  />
                  <Link 
                    to="/models/$modelId" 
                    params={{ modelId: model.id.toString() }}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                    <span className="sr-only">View model details</span>
                  </Link>
                </div>
              </FMCell>
            </FMRow>
          );
        })}
      </TableBody>
    </FMTable>
  );
}
