-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "public"."CategoryEnum" AS ENUM ('keychain', 'earring', 'decoration', 'functional');

-- CreateEnum
CREATE TYPE "public"."MaterialTypeEnum" AS ENUM ('PLA', 'PETG', 'ABS', 'TPU');

-- CreateEnum
CREATE TYPE "public"."JobStatusEnum" AS ENUM ('queued', 'printing', 'completed', 'failed');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "business_name" VARCHAR(255),
    "business_description" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "last_login_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."models" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "designer" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image_urls" TEXT[],
    "category" "public"."CategoryEnum" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."model_variants" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "model_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "sliced_file_url" TEXT NOT NULL,
    "layer_height" DECIMAL(4,2) NOT NULL,
    "nozzle_temperature" INTEGER NOT NULL,
    "bed_temperature" INTEGER NOT NULL,
    "print_duration_minutes" INTEGER NOT NULL,
    "bambu_metadata" JSONB NOT NULL,
    "cost_to_produce_usd" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "success_rate_percentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "model_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filaments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "material_type" "public"."MaterialTypeEnum" NOT NULL,
    "color_name" VARCHAR(100) NOT NULL,
    "color_hex" CHAR(7) NOT NULL,
    "cost_per_gram_base" DECIMAL(8,4) NOT NULL,
    "purchase_url" TEXT,
    "demand_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "filaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filament_inventory" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "filament_id" UUID NOT NULL,
    "batch_identifier" VARCHAR(100),
    "quantity_grams" INTEGER NOT NULL DEFAULT 0,
    "actual_cost_per_gram" DECIMAL(8,4) NOT NULL,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 100,
    "purchase_date" DATE,
    "expiry_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "filament_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."filament_requirements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "variant_id" UUID NOT NULL,
    "filament_id" UUID NOT NULL,
    "ams_slot" INTEGER NOT NULL,
    "usage_model" INTEGER NOT NULL DEFAULT 0,
    "usage_waste" INTEGER NOT NULL DEFAULT 0,
    "usage_purge" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filament_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."print_jobs" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "status" "public"."JobStatusEnum" NOT NULL DEFAULT 'queued',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "estimated_start_time" TIMESTAMPTZ,
    "estimated_completion_time" TIMESTAMPTZ,
    "actual_completion_time" TIMESTAMPTZ,
    "failure_reason" TEXT,
    "completion_percentage" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "print_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "models_user_id_idx" ON "public"."models"("user_id");

-- CreateIndex
CREATE INDEX "model_variants_user_id_idx" ON "public"."model_variants"("user_id");

-- CreateIndex
CREATE INDEX "model_variants_model_id_idx" ON "public"."model_variants"("model_id");

-- CreateIndex
CREATE INDEX "model_variants_layer_height_idx" ON "public"."model_variants"("layer_height");

-- CreateIndex
CREATE INDEX "model_variants_print_duration_minutes_idx" ON "public"."model_variants"("print_duration_minutes");

-- CreateIndex
CREATE UNIQUE INDEX "model_variants_model_id_version_key" ON "public"."model_variants"("model_id", "version");

-- CreateIndex
CREATE INDEX "filaments_user_id_idx" ON "public"."filaments"("user_id");

-- CreateIndex
CREATE INDEX "filaments_material_type_color_hex_idx" ON "public"."filaments"("material_type", "color_hex");

-- CreateIndex
CREATE INDEX "filaments_demand_count_idx" ON "public"."filaments"("demand_count" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "filaments_user_id_brand_material_type_color_hex_key" ON "public"."filaments"("user_id", "brand", "material_type", "color_hex");

-- CreateIndex
CREATE INDEX "filament_inventory_user_id_idx" ON "public"."filament_inventory"("user_id");

-- CreateIndex
CREATE INDEX "filament_inventory_filament_id_idx" ON "public"."filament_inventory"("filament_id");

-- CreateIndex
CREATE INDEX "filament_inventory_quantity_grams_low_stock_threshold_idx" ON "public"."filament_inventory"("quantity_grams", "low_stock_threshold");

-- CreateIndex
CREATE INDEX "filament_requirements_variant_id_idx" ON "public"."filament_requirements"("variant_id");

-- CreateIndex
CREATE INDEX "filament_requirements_filament_id_idx" ON "public"."filament_requirements"("filament_id");

-- CreateIndex
CREATE UNIQUE INDEX "filament_requirements_variant_id_ams_slot_key" ON "public"."filament_requirements"("variant_id", "ams_slot");

-- CreateIndex
CREATE INDEX "print_jobs_user_id_idx" ON "public"."print_jobs"("user_id");

-- CreateIndex
CREATE INDEX "print_jobs_status_idx" ON "public"."print_jobs"("status");

-- CreateIndex
CREATE INDEX "print_jobs_priority_idx" ON "public"."print_jobs"("priority" DESC);

-- CreateIndex
CREATE INDEX "print_jobs_status_priority_created_at_idx" ON "public"."print_jobs"("status", "priority" DESC, "created_at");

-- AddForeignKey
ALTER TABLE "public"."models" ADD CONSTRAINT "models_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."model_variants" ADD CONSTRAINT "model_variants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."model_variants" ADD CONSTRAINT "model_variants_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."models"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filaments" ADD CONSTRAINT "filaments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filament_inventory" ADD CONSTRAINT "filament_inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filament_inventory" ADD CONSTRAINT "filament_inventory_filament_id_fkey" FOREIGN KEY ("filament_id") REFERENCES "public"."filaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filament_requirements" ADD CONSTRAINT "filament_requirements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."model_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."filament_requirements" ADD CONSTRAINT "filament_requirements_filament_id_fkey" FOREIGN KEY ("filament_id") REFERENCES "public"."filaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_jobs" ADD CONSTRAINT "print_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."print_jobs" ADD CONSTRAINT "print_jobs_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."model_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
