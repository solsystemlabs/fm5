-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'UPLOADED', 'DOWNLOADED');

-- CreateTable
CREATE TABLE "public"."DashboardAnalytics" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalFilaments" INTEGER NOT NULL DEFAULT 0,
    "totalModels" INTEGER NOT NULL DEFAULT 0,
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "totalSlicedFiles" INTEGER NOT NULL DEFAULT 0,
    "totalPrintTimeMinutes" INTEGER,
    "totalFilamentWeight" DOUBLE PRECISION,
    "totalFilamentCost" DOUBLE PRECISION,
    "mostUsedMaterialType" TEXT,
    "mostUsedBrand" TEXT,
    "avgPrintTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecentActivity" (
    "id" SERIAL NOT NULL,
    "type" "public"."ActivityType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecentActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DashboardAnalytics_id_key" ON "public"."DashboardAnalytics"("id");

-- CreateIndex
CREATE UNIQUE INDEX "DashboardAnalytics_date_key" ON "public"."DashboardAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "RecentActivity_id_key" ON "public"."RecentActivity"("id");

-- AddForeignKey
ALTER TABLE "public"."SlicedFile" ADD CONSTRAINT "SlicedFile_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
