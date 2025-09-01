import { useDeleteModelTRPC } from "@/lib/trpc-hooks";
import { DocumentIcon, PhotoIcon, PlayIcon } from "@heroicons/react/24/outline";
import { Prisma } from "@prisma/client";
import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Cell, TableBody } from "react-aria-components";
import { ImageThumbnailGrid, type ImageFile } from "../ImagePreviewGallery";
import { DeleteConfirmDialog } from "../ui/DeleteConfirmDialog";
import FMCell from "../ui/table/FMCell";
import FMColumn from "../ui/table/FMColumn";
import FMRow from "../ui/table/FMRow";
import FMTable from "../ui/table/FMTable";
import FMTableHeader from "../ui/table/FMTableHeader";
import { UploadStatusCell } from "./UploadStatusCell";

type Models = Prisma.ModelGetPayload<{
  include: {
    Category: true;
    Filaments: true;
    ModelFiles: true;
    ThreeMFFiles: { include: { SlicedFiles: true } };
  };
}>;

export default function ModelsTable({
  data,
  imagesByModel = {},
}: {
  data: Models[];
  imagesByModel?: Record<
    number,
    Array<{ id: number; name: string; url: string; size: number }>
  >;
}): ReactNode {
  const deleteModel = useDeleteModelTRPC();
  const navigate = useNavigate();

  const handleRowAction = (key: React.Key) => {
    navigate({ to: "/models/$modelId", params: { modelId: key.toString() } });
  };

  return (
    <FMTable onRowAction={handleRowAction}>
      <FMTableHeader>
        <FMTableHeader.Row>
          <FMColumn className="w-12 rounded-tl-lg py-3.5 pr-3 pl-4 text-left sm:pl-6">
            Images
          </FMColumn>
          <FMColumn>Name</FMColumn>
          <FMColumn>Category</FMColumn>
          <FMColumn>Files</FMColumn>
          <FMColumn>Sliced</FMColumn>
          <FMColumn>Filaments</FMColumn>
          <FMColumn>Status</FMColumn>
          <FMColumn className="w-20 rounded-tr-lg">
            <span className="sr-only">Actions</span>
          </FMColumn>
        </FMTableHeader.Row>
      </FMTableHeader>
      <TableBody>
        {data.map((model) => {
          // Get images for this model
          const modelImages = imagesByModel[model.id] || [];
          const imageFiles: ImageFile[] = modelImages.map((img) => ({
            id: img.id,
            name: img.name,
            url: img.url,
            size: img.size,
          }));

          // Calculate total sliced files count
          const slicedFilesCount = model.ThreeMFFiles.reduce(
            (total, threeMF) => total + threeMF.SlicedFiles.length,
            0,
          );

          return (
            <FMRow
              key={model.id}
              id={model.id}
              className="hover:bg-muted/50 group cursor-pointer transition-colors"
            >
              {/* Image Thumbnails */}
              <FMCell className="py-4 pr-3 pl-4 sm:pl-6">
                <div onClick={(e) => e.stopPropagation()}>
                  <ImageThumbnailGrid
                    images={imageFiles}
                    maxImages={3}
                    className="justify-start transition-transform group-hover:scale-105"
                  />
                </div>
              </FMCell>

              {/* Model Name */}
              <Cell className="relative py-4 pr-3 text-sm">
                <div className="flex items-center">
                  <div className="text-md text-foreground group-hover:text-primary font-bold transition-colors">
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
              <FMCell className="text-muted-foreground hidden sm:table-cell">
                {model.Category.name}
              </FMCell>

              {/* File Counts */}
              <FMCell className="hidden sm:table-cell">
                <div className="text-muted-foreground flex items-center space-x-3 text-sm">
                  {model.ThreeMFFiles.length > 0 && (
                    <div className="flex items-center space-x-1 transition-colors group-hover:text-blue-500">
                      <PhotoIcon className="h-4 w-4" />
                      <span>{model.ThreeMFFiles.length}</span>
                    </div>
                  )}
                  {model.ModelFiles.length > 0 && (
                    <div className="flex items-center space-x-1 transition-colors group-hover:text-green-500">
                      <DocumentIcon className="h-4 w-4" />
                      <span>{model.ModelFiles.length}</span>
                    </div>
                  )}
                  {model.ModelFiles.length === 0 &&
                    model.ThreeMFFiles.length === 0 && (
                      <span className="text-xs">No files</span>
                    )}
                </div>
              </FMCell>

              {/* Sliced Files Count */}
              <FMCell className="hidden sm:table-cell">
                <div className="text-muted-foreground flex items-center space-x-1 text-sm">
                  {slicedFilesCount > 0 ? (
                    <>
                      <PlayIcon className="h-4 w-4 text-green-600" />
                      <span>{slicedFilesCount}</span>
                    </>
                  ) : (
                    <span className="text-xs">No sliced files</span>
                  )}
                </div>
              </FMCell>

              {/* Filaments */}
              <FMCell className="text-muted-foreground hidden sm:table-cell">
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
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DeleteConfirmDialog
                    title="Delete Model"
                    description="Are you sure you want to delete this model? This will also delete all associated files and images."
                    itemName={model.name}
                    onConfirm={() => deleteModel.mutate({ id: model.id })}
                    isLoading={deleteModel.isPending}
                  />
                </div>
              </FMCell>
            </FMRow>
          );
        })}
      </TableBody>
    </FMTable>
  );
}
