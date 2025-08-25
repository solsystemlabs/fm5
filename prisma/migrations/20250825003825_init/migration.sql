-- CreateTable
CREATE TABLE "public"."ModelCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ModelCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Model" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "modelCategoryId" INTEGER NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Filament" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "filamentTypeId" INTEGER NOT NULL,
    "materialTypeId" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION,
    "grams" INTEGER,
    "brandName" TEXT NOT NULL,
    "diameter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Filament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FilamentType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "FilamentType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MaterialType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MaterialType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_FilamentToModel" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_FilamentToModel_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModelCategory_id_key" ON "public"."ModelCategory"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ModelCategory_name_key" ON "public"."ModelCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Model_id_key" ON "public"."Model"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Model_name_key" ON "public"."Model"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Filament_id_key" ON "public"."Filament"("id");

-- CreateIndex
CREATE UNIQUE INDEX "FilamentType_id_key" ON "public"."FilamentType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_id_key" ON "public"."Brand"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "public"."Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialType_id_key" ON "public"."MaterialType"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MaterialType_name_key" ON "public"."MaterialType"("name");

-- CreateIndex
CREATE INDEX "_FilamentToModel_B_index" ON "public"."_FilamentToModel"("B");

-- AddForeignKey
ALTER TABLE "public"."Model" ADD CONSTRAINT "Model_modelCategoryId_fkey" FOREIGN KEY ("modelCategoryId") REFERENCES "public"."ModelCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_filamentTypeId_fkey" FOREIGN KEY ("filamentTypeId") REFERENCES "public"."FilamentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_materialTypeId_fkey" FOREIGN KEY ("materialTypeId") REFERENCES "public"."MaterialType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Filament" ADD CONSTRAINT "Filament_brandName_fkey" FOREIGN KEY ("brandName") REFERENCES "public"."Brand"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FilamentToModel" ADD CONSTRAINT "_FilamentToModel_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Filament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_FilamentToModel" ADD CONSTRAINT "_FilamentToModel_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
