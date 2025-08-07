/*
  Warnings:

  - You are about to drop the column `modelId` on the `Filament` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Filament" DROP CONSTRAINT "Filament_modelId_fkey";

-- AlterTable
ALTER TABLE "public"."Filament" DROP COLUMN "modelId";

-- CreateTable
CREATE TABLE "public"."_FilamentToModel" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FilamentToModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_FilamentToModel_B_index" ON "public"."_FilamentToModel"("B");

-- AddForeignKey
ALTER TABLE "public"."_FilamentToModel" ADD CONSTRAINT "_FilamentToModel_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Filament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FilamentToModel" ADD CONSTRAINT "_FilamentToModel_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
