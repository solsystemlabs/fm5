/*
  Warnings:

  - You are about to drop the `Filament` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MaterialType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Model` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModelCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_FilamentToModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Filament" DROP CONSTRAINT "Filament_materialTypeId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Model" DROP CONSTRAINT "Model_modelCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FilamentToModel" DROP CONSTRAINT "_FilamentToModel_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_FilamentToModel" DROP CONSTRAINT "_FilamentToModel_B_fkey";

-- DropTable
DROP TABLE "public"."Filament";

-- DropTable
DROP TABLE "public"."MaterialType";

-- DropTable
DROP TABLE "public"."Model";

-- DropTable
DROP TABLE "public"."ModelCategory";

-- DropTable
DROP TABLE "public"."_FilamentToModel";

-- CreateTable
CREATE TABLE "public"."filamentBrands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filamentBrands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filamentTypes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filamentTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filaments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "hexColor" TEXT,
    "diameter" DOUBLE PRECISION NOT NULL,
    "density" DOUBLE PRECISION,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filamentRolls" (
    "id" TEXT NOT NULL,
    "filamentId" TEXT NOT NULL,
    "initialWeight" DOUBLE PRECISION NOT NULL,
    "currentWeight" DOUBLE PRECISION NOT NULL,
    "spoolWeight" DOUBLE PRECISION,
    "totalCost" DOUBLE PRECISION,
    "costPerGram" DOUBLE PRECISION,
    "purchaseDate" TIMESTAMP(3),
    "supplier" TEXT,
    "batchLot" TEXT,
    "expirationDate" TIMESTAMP(3),
    "storageLocation" TEXT,
    "firstUsedDate" TIMESTAMP(3),
    "conditionNotes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isEmpty" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "filamentRolls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."modelCategories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelCategories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."models" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "title" TEXT,
    "designer" TEXT,
    "designerUserId" TEXT,
    "origin" TEXT,
    "license" TEXT,
    "copyright" TEXT,
    "categoryId" TEXT,
    "originalFileName" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slicerApplication" TEXT,
    "slicerVersion" TEXT,
    "threemfVersion" TEXT,
    "creationDate" TIMESTAMP(3),
    "modificationDate" TIMESTAMP(3),
    "hasGcode" BOOLEAN NOT NULL DEFAULT false,
    "hasThumbnails" BOOLEAN NOT NULL DEFAULT false,
    "hasTextures" BOOLEAN NOT NULL DEFAULT false,
    "thumbnailPaths" TEXT,
    "boundingBoxMinX" DOUBLE PRECISION,
    "boundingBoxMinY" DOUBLE PRECISION,
    "boundingBoxMinZ" DOUBLE PRECISION,
    "boundingBoxMaxX" DOUBLE PRECISION,
    "boundingBoxMaxY" DOUBLE PRECISION,
    "boundingBoxMaxZ" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "area" DOUBLE PRECISION,
    "units" TEXT NOT NULL DEFAULT 'millimeter',
    "vertexCount" INTEGER,
    "triangleCount" INTEGER,
    "meshCount" INTEGER NOT NULL DEFAULT 1,
    "estimatedPrintTime" INTEGER,
    "predictedDuration" INTEGER,
    "layerCount" INTEGER,
    "layerHeight" DOUBLE PRECISION,
    "infillDensity" TEXT,
    "wallLoops" INTEGER,
    "topShellLayers" INTEGER,
    "bottomShellLayers" INTEGER,
    "printSpeed" INTEGER,
    "primaryMaterial" TEXT,
    "totalFilamentUsedMeters" DOUBLE PRECISION,
    "totalFilamentUsedGrams" DOUBLE PRECISION,
    "estimatedCost" DOUBLE PRECISION,
    "isMultiMaterial" BOOLEAN NOT NULL DEFAULT false,
    "materialCount" INTEGER NOT NULL DEFAULT 1,
    "filamentMapping" TEXT,
    "filamentColors" TEXT,
    "filamentTypes" TEXT,
    "filamentBrands" TEXT,
    "filamentIds" TEXT,
    "filamentUsageMeters" TEXT,
    "filamentUsageGrams" TEXT,
    "layerFilamentMapping" TEXT,
    "flushVolumeMatrix" TEXT,
    "supportMaterial" TEXT,
    "printProfile" TEXT,
    "nozzleDiameter" DOUBLE PRECISION,
    "nozzleTemperature" INTEGER,
    "bedTemperature" INTEGER,
    "supportEnabled" BOOLEAN NOT NULL DEFAULT false,
    "supportType" TEXT,
    "bridgeSupport" BOOLEAN NOT NULL DEFAULT false,
    "raftLayers" INTEGER,
    "brimWidth" DOUBLE PRECISION,
    "compatiblePrinters" TEXT,
    "printerModel" TEXT,
    "printableAreaX" DOUBLE PRECISION,
    "printableAreaY" DOUBLE PRECISION,
    "printableHeight" DOUBLE PRECISION,
    "bedType" TEXT,
    "requiredExtruders" INTEGER NOT NULL DEFAULT 1,
    "extruderTypes" TEXT,
    "nozzleTypes" TEXT,
    "modelPath" TEXT,
    "gcodePath" TEXT,
    "configPaths" TEXT,
    "thumbnailSmallPath" TEXT,
    "thumbnailLargePath" TEXT,
    "plateImagePath" TEXT,
    "stlFileUrl" TEXT,
    "threemfFileUrl" TEXT,
    "previewImageUrl" TEXT,
    "downloadUrl" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "printCount" INTEGER NOT NULL DEFAULT 0,
    "successfulPrints" INTEGER NOT NULL DEFAULT 0,
    "failedPrints" INTEGER NOT NULL DEFAULT 0,
    "averagePrintTime" INTEGER,
    "lastPrintedAt" TIMESTAMP(3),
    "printSuccessRate" DOUBLE PRECISION,
    "userRating" DOUBLE PRECISION,
    "difficulty" TEXT,
    "tags" TEXT,
    "visibility" TEXT NOT NULL DEFAULT 'public',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "searchKeywords" TEXT,
    "isOriginalDesign" BOOLEAN NOT NULL DEFAULT true,
    "sourceUrl" TEXT,
    "remixParentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "modelId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "sellPrice" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "qualityRating" INTEGER,
    "notes" TEXT,
    "photoUrls" TEXT,
    "completedDate" TIMESTAMP(3),
    "soldDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."printerBrands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printerBrands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."printers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT,
    "model" TEXT,
    "buildVolumeX" DOUBLE PRECISION,
    "buildVolumeY" DOUBLE PRECISION,
    "buildVolumeZ" DOUBLE PRECISION,
    "nozzleDiameter" DOUBLE PRECISION,
    "layerHeightMin" DOUBLE PRECISION,
    "layerHeightMax" DOUBLE PRECISION,
    "extruderCount" INTEGER NOT NULL DEFAULT 1,
    "supportsAMS" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'active',
    "location" TEXT,
    "purchaseDate" TIMESTAMP(3),
    "warrantyExpiry" TIMESTAMP(3),
    "totalPrintTime" INTEGER NOT NULL DEFAULT 0,
    "totalFilament" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastMaintenance" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."printJobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "printerId" TEXT NOT NULL,
    "modelId" TEXT,
    "productId" TEXT,
    "layerHeight" DOUBLE PRECISION NOT NULL,
    "infillDensity" INTEGER NOT NULL,
    "printSpeed" INTEGER,
    "nozzleTemp" INTEGER,
    "bedTemp" INTEGER,
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'queued',
    "qualityRating" INTEGER,
    "notes" TEXT,
    "failureReason" TEXT,
    "totalCost" DOUBLE PRECISION,
    "electricityCost" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printJobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."printJobMaterials" (
    "id" TEXT NOT NULL,
    "printJobId" TEXT NOT NULL,
    "filamentRollId" TEXT NOT NULL,
    "estimatedGrams" DOUBLE PRECISION,
    "actualGrams" DOUBLE PRECISION,
    "extruderNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printJobMaterials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "filamentBrands_name_key" ON "public"."filamentBrands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "filamentTypes_name_key" ON "public"."filamentTypes"("name");

-- CreateIndex
CREATE INDEX "filaments_brandId_idx" ON "public"."filaments"("brandId");

-- CreateIndex
CREATE INDEX "filaments_typeId_idx" ON "public"."filaments"("typeId");

-- CreateIndex
CREATE INDEX "filaments_color_idx" ON "public"."filaments"("color");

-- CreateIndex
CREATE UNIQUE INDEX "filaments_brandId_name_color_diameter_key" ON "public"."filaments"("brandId", "name", "color", "diameter");

-- CreateIndex
CREATE INDEX "filamentRolls_filamentId_idx" ON "public"."filamentRolls"("filamentId");

-- CreateIndex
CREATE INDEX "filamentRolls_isActive_idx" ON "public"."filamentRolls"("isActive");

-- CreateIndex
CREATE INDEX "filamentRolls_isEmpty_idx" ON "public"."filamentRolls"("isEmpty");

-- CreateIndex
CREATE INDEX "filamentRolls_storageLocation_idx" ON "public"."filamentRolls"("storageLocation");

-- CreateIndex
CREATE UNIQUE INDEX "modelCategories_name_key" ON "public"."modelCategories"("name");

-- CreateIndex
CREATE INDEX "modelCategories_parentId_idx" ON "public"."modelCategories"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "models_fileHash_key" ON "public"."models"("fileHash");

-- CreateIndex
CREATE INDEX "models_categoryId_idx" ON "public"."models"("categoryId");

-- CreateIndex
CREATE INDEX "models_name_idx" ON "public"."models"("name");

-- CreateIndex
CREATE INDEX "models_designer_idx" ON "public"."models"("designer");

-- CreateIndex
CREATE INDEX "models_designerUserId_idx" ON "public"."models"("designerUserId");

-- CreateIndex
CREATE INDEX "models_primaryMaterial_idx" ON "public"."models"("primaryMaterial");

-- CreateIndex
CREATE INDEX "models_isMultiMaterial_idx" ON "public"."models"("isMultiMaterial");

-- CreateIndex
CREATE INDEX "models_featured_idx" ON "public"."models"("featured");

-- CreateIndex
CREATE INDEX "models_visibility_idx" ON "public"."models"("visibility");

-- CreateIndex
CREATE INDEX "models_printCount_idx" ON "public"."models"("printCount");

-- CreateIndex
CREATE INDEX "models_downloadCount_idx" ON "public"."models"("downloadCount");

-- CreateIndex
CREATE INDEX "models_difficulty_idx" ON "public"."models"("difficulty");

-- CreateIndex
CREATE INDEX "models_creationDate_idx" ON "public"."models"("creationDate");

-- CreateIndex
CREATE INDEX "models_fileHash_idx" ON "public"."models"("fileHash");

-- CreateIndex
CREATE INDEX "products_modelId_idx" ON "public"."products"("modelId");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "public"."products"("status");

-- CreateIndex
CREATE INDEX "products_completedDate_idx" ON "public"."products"("completedDate");

-- CreateIndex
CREATE UNIQUE INDEX "printerBrands_name_key" ON "public"."printerBrands"("name");

-- CreateIndex
CREATE INDEX "printers_brandId_idx" ON "public"."printers"("brandId");

-- CreateIndex
CREATE INDEX "printers_status_idx" ON "public"."printers"("status");

-- CreateIndex
CREATE INDEX "printers_location_idx" ON "public"."printers"("location");

-- CreateIndex
CREATE INDEX "printJobs_printerId_idx" ON "public"."printJobs"("printerId");

-- CreateIndex
CREATE INDEX "printJobs_modelId_idx" ON "public"."printJobs"("modelId");

-- CreateIndex
CREATE INDEX "printJobs_productId_idx" ON "public"."printJobs"("productId");

-- CreateIndex
CREATE INDEX "printJobs_status_idx" ON "public"."printJobs"("status");

-- CreateIndex
CREATE INDEX "printJobs_startTime_idx" ON "public"."printJobs"("startTime");

-- CreateIndex
CREATE INDEX "printJobMaterials_printJobId_idx" ON "public"."printJobMaterials"("printJobId");

-- CreateIndex
CREATE INDEX "printJobMaterials_filamentRollId_idx" ON "public"."printJobMaterials"("filamentRollId");

-- CreateIndex
CREATE UNIQUE INDEX "printJobMaterials_printJobId_filamentRollId_extruderNumber_key" ON "public"."printJobMaterials"("printJobId", "filamentRollId", "extruderNumber");

-- AddForeignKey
ALTER TABLE "public"."filaments" ADD CONSTRAINT "filaments_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."filamentBrands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filaments" ADD CONSTRAINT "filaments_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "public"."filamentTypes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filamentRolls" ADD CONSTRAINT "filamentRolls_filamentId_fkey" FOREIGN KEY ("filamentId") REFERENCES "public"."filaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."modelCategories" ADD CONSTRAINT "modelCategories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."modelCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."modelCategories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_designerUserId_fkey" FOREIGN KEY ("designerUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_remixParentId_fkey" FOREIGN KEY ("remixParentId") REFERENCES "public"."models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."printers" ADD CONSTRAINT "printers_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."printerBrands"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."printJobs" ADD CONSTRAINT "printJobs_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "public"."printers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."printJobs" ADD CONSTRAINT "printJobs_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."models"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."printJobs" ADD CONSTRAINT "printJobs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."printJobMaterials" ADD CONSTRAINT "printJobMaterials_printJobId_fkey" FOREIGN KEY ("printJobId") REFERENCES "public"."printJobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."printJobMaterials" ADD CONSTRAINT "printJobMaterials_filamentRollId_fkey" FOREIGN KEY ("filamentRollId") REFERENCES "public"."filamentRolls"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
