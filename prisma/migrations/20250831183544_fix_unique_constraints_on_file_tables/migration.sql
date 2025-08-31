/*
  Warnings:

  - A unique constraint covering the columns `[modelId,name]` on the table `ModelFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[threeMFFileId,name]` on the table `SlicedFile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[modelId,name]` on the table `ThreeMFFile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."ModelFile_name_key";

-- DropIndex
DROP INDEX "public"."SlicedFile_name_key";

-- DropIndex
DROP INDEX "public"."ThreeMFFile_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "ModelFile_modelId_name_key" ON "public"."ModelFile"("modelId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "SlicedFile_threeMFFileId_name_key" ON "public"."SlicedFile"("threeMFFileId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ThreeMFFile_modelId_name_key" ON "public"."ThreeMFFile"("modelId", "name");
