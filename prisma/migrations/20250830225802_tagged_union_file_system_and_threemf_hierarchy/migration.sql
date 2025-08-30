/*
  Warnings:

  - You are about to drop the column `modelFileId` on the `SlicedFile` table. All the data in the column will be lost.
  - You are about to drop the column `modelId` on the `SlicedFile` table. All the data in the column will be lost.
  - You are about to drop the `ModelImage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `fileType` to the `ModelFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ModelFile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `threeMFFileId` to the `SlicedFile` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."FileEntityType" AS ENUM ('MODEL', 'THREE_MF', 'SLICED_FILE');

-- DropForeignKey
ALTER TABLE "public"."ModelImage" DROP CONSTRAINT "ModelImage_modelId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SlicedFile" DROP CONSTRAINT "SlicedFile_modelFileId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SlicedFile" DROP CONSTRAINT "SlicedFile_modelId_fkey";

-- DropIndex
DROP INDEX "public"."Brand_id_key";

-- DropIndex
DROP INDEX "public"."DashboardAnalytics_id_key";

-- DropIndex
DROP INDEX "public"."Filament_id_key";

-- DropIndex
DROP INDEX "public"."FilamentType_id_key";

-- DropIndex
DROP INDEX "public"."MaterialType_id_key";

-- DropIndex
DROP INDEX "public"."Model_id_key";

-- DropIndex
DROP INDEX "public"."ModelCategory_id_key";

-- DropIndex
DROP INDEX "public"."ModelFile_id_key";

-- DropIndex
DROP INDEX "public"."Product_id_key";

-- DropIndex
DROP INDEX "public"."RecentActivity_id_key";

-- DropIndex
DROP INDEX "public"."SlicedFile_id_key";

-- DropIndex
DROP INDEX "public"."SlicedFileFilament_id_key";

-- AlterTable
ALTER TABLE "public"."ModelFile" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileType" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."SlicedFile" DROP COLUMN "modelFileId",
DROP COLUMN "modelId",
ADD COLUMN     "threeMFFileId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "public"."ModelImage";

-- CreateTable
CREATE TABLE "public"."ThreeMFFile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3Key" TEXT,
    "modelId" INTEGER NOT NULL,
    "hasGcode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThreeMFFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "s3Key" TEXT,
    "mimeType" TEXT,
    "entityType" "public"."FileEntityType" NOT NULL,
    "entityId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ThreeMFFile_name_key" ON "public"."ThreeMFFile"("name");

-- CreateIndex
CREATE UNIQUE INDEX "File_entityType_entityId_name_key" ON "public"."File"("entityType", "entityId", "name");

-- AddForeignKey
ALTER TABLE "public"."ThreeMFFile" ADD CONSTRAINT "ThreeMFFile_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SlicedFile" ADD CONSTRAINT "SlicedFile_threeMFFileId_fkey" FOREIGN KEY ("threeMFFileId") REFERENCES "public"."ThreeMFFile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
