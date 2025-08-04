-- CreateTable
CREATE TABLE "public"."ModelCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ModelCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "modelCategoryId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Filament" (
    "id" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "modelId" TEXT,
    "materialTypeId" TEXT NOT NULL,

    CONSTRAINT "Filament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MaterialType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MaterialType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelCategory_name_key" ON "public"."ModelCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_name_key" ON "public"."Model"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialType_name_key" ON "public"."MaterialType"("name");

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_modelCategoryId_fkey" FOREIGN KEY ("modelCategoryId") REFERENCES "public"."ModelCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_materialTypeId_fkey" FOREIGN KEY ("materialTypeId") REFERENCES "public"."MaterialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "public"."Model"("id") ON DELETE SET NULL ON UPDATE CASCADE;
