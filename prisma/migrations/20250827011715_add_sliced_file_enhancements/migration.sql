-- AlterTable
ALTER TABLE "public"."Filament" ADD COLUMN     "modelFileId" INTEGER,
ADD COLUMN     "productId" INTEGER;

-- CreateTable
CREATE TABLE "public"."ModelFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,

    CONSTRAINT "ModelFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SlicedFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "printTimeMinutes" INTEGER,
    "totalTimeMinutes" INTEGER,
    "layerCount" INTEGER,
    "layerHeight" DOUBLE PRECISION,
    "maxZHeight" DOUBLE PRECISION,
    "slicerName" TEXT,
    "slicerVersion" TEXT,
    "profileName" TEXT,
    "nozzleDiameter" DOUBLE PRECISION,
    "bedType" TEXT,
    "bedTemperature" INTEGER,
    "totalFilamentLength" DOUBLE PRECISION,
    "totalFilamentVolume" DOUBLE PRECISION,
    "totalFilamentWeight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "modelFileId" INTEGER,

    CONSTRAINT "SlicedFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SlicedFileFilament" (
    "id" SERIAL NOT NULL,
    "slicedFileId" INTEGER NOT NULL,
    "filamentIndex" INTEGER NOT NULL,
    "lengthUsed" DOUBLE PRECISION,
    "volumeUsed" DOUBLE PRECISION,
    "weightUsed" DOUBLE PRECISION,
    "filamentType" TEXT,
    "filamentColor" TEXT,
    "filamentVendor" TEXT,
    "density" DOUBLE PRECISION,
    "diameter" DOUBLE PRECISION,
    "nozzleTemp" INTEGER,
    "bedTemp" INTEGER,
    "filamentId" INTEGER,

    CONSTRAINT "SlicedFileFilament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "modelId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "slicedFileId" INTEGER NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelFile_id_key" ON "public"."ModelFile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ModelFile_name_key" ON "public"."ModelFile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SlicedFile_id_key" ON "public"."SlicedFile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SlicedFile_name_key" ON "public"."SlicedFile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SlicedFileFilament_id_key" ON "public"."SlicedFileFilament"("id");

-- CreateIndex
CREATE UNIQUE INDEX "SlicedFileFilament_slicedFileId_filamentIndex_key" ON "public"."SlicedFileFilament"("slicedFileId", "filamentIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Product_id_key" ON "public"."Product"("id");

-- AddForeignKey
ALTER TABLE "public"."ModelFile" ADD CONSTRAINT "ModelFile_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlicedFile" ADD CONSTRAINT "SlicedFile_modelFileId_fkey" FOREIGN KEY ("modelFileId") REFERENCES "public"."ModelFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlicedFileFilament" ADD CONSTRAINT "SlicedFileFilament_filamentId_fkey" FOREIGN KEY ("filamentId") REFERENCES "public"."Filament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlicedFileFilament" ADD CONSTRAINT "SlicedFileFilament_slicedFileId_fkey" FOREIGN KEY ("slicedFileId") REFERENCES "public"."SlicedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_modelFileId_fkey" FOREIGN KEY ("modelFileId") REFERENCES "public"."ModelFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_slicedFileId_fkey" FOREIGN KEY ("slicedFileId") REFERENCES "public"."SlicedFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
