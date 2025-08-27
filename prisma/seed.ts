import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  try {
    await prisma.product.deleteMany({});
    await prisma.slicedFile.deleteMany({});
    await prisma.filament.deleteMany({});
    await prisma.model.deleteMany({});
    await prisma.materialType.deleteMany({});
    await prisma.filamentType.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.modelCategory.deleteMany({});
    console.log("✅ Database cleared");
  } catch (error) {
    console.log("ℹ️  Database tables don't exist yet, skipping cleanup");
  }

  // Create material types using createMany
  await prisma.materialType.createMany({
    data: [
      { name: "PLA" },
      { name: "PETG" },
      { name: "ABS" },
      { name: "TPU" },
      { name: "WOOD" },
      { name: "CARBON FIBER" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Material types created");

  await prisma.filamentType.createMany({
    data: [
      { name: "Basic", description: "Standard finish filament with smooth, glossy surface" },
      { name: "Sparkle", description: "Filament with metallic flakes that create a sparkling effect" },
      { name: "Metal", description: "Metal-filled filament with metallic appearance and weight" },
      { name: "Matte", description: "Low-gloss filament with a smooth, non-reflective finish" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Filament types created");

  // Create brands using createMany
  await prisma.brand.createMany({
    data: [
      { name: "Hatchbox" },
      { name: "Overture" },
      { name: "SUNLU" },
      { name: "Polymaker" },
      { name: "Prusament" },
      { name: "eSUN" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Brands created");

  // Create model categories using createMany
  await prisma.modelCategory.createMany({
    data: [
      { name: "Miniatures" },
      { name: "Terrain" },
      { name: "Vehicles" },
      { name: "Accessories" },
      { name: "Tools" },
      { name: "Household" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Model categories created");

  // Get the created categories and material types for foreign key references
  const categories = await prisma.modelCategory.findMany();
  const materials = await prisma.materialType.findMany();
  const filamentTypes = await prisma.filamentType.findMany();
  const brands = await prisma.brand.findMany();

  const miniatureCategory = categories.find((c) => c.name === "Miniatures")!;
  const terrainCategory = categories.find((c) => c.name === "Terrain")!;
  const vehicleCategory = categories.find((c) => c.name === "Vehicles")!;
  const accessoryCategory = categories.find((c) => c.name === "Accessories")!;

  const plaType = materials.find((m) => m.name === "PLA")!;
  const petgType = materials.find((m) => m.name === "PETG")!;
  const absType = materials.find((m) => m.name === "ABS")!;

  const basicType = filamentTypes.find((ft) => ft.name === "Basic")!;
  const sparkleType = filamentTypes.find((ft) => ft.name === "Sparkle")!;
  const metalType = filamentTypes.find((ft) => ft.name === "Metal")!;
  const matteType = filamentTypes.find((ft) => ft.name === "Matte")!;

  const hatchboxBrand = brands.find((b) => b.name === "Hatchbox")!;
  const overtureBrand = brands.find((b) => b.name === "Overture")!;
  const sunluBrand = brands.find((b) => b.name === "SUNLU")!;

  // Create models using createMany
  await prisma.model.createMany({
    data: [
      { name: "Ancient Dragon", modelCategoryId: miniatureCategory.id },
      { name: "Medieval Castle", modelCategoryId: terrainCategory.id },
      { name: "Battle Tank", modelCategoryId: vehicleCategory.id },
      { name: "Wizard Staff", modelCategoryId: accessoryCategory.id },
      { name: "Knight Helmet", modelCategoryId: accessoryCategory.id },
      { name: "Stone Bridge", modelCategoryId: terrainCategory.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Models created");

  // Get created models for associations
  const models = await prisma.model.findMany();
  const dragonModel = models.find((m) => m.name === "Ancient Dragon")!;
  const castleModel = models.find((m) => m.name === "Medieval Castle")!;
  const tankModel = models.find((m) => m.name === "Battle Tank")!;
  const staffModel = models.find((m) => m.name === "Wizard Staff")!;

  // Create filaments individually with model associations
  const redFilament = await prisma.filament.create({
    data: {
      color: "#DC2626",
      name: "Red",
      filamentTypeId: basicType.id,
      materialTypeId: plaType.id,
      brandName: hatchboxBrand.name,
      diameter: 1.75,
      cost: 22.99,
      grams: 1000,
      Models: {
        connect: [{ id: dragonModel.id }],
      },
    },
  });

  const blueFilament = await prisma.filament.create({
    data: {
      color: "#2563EB",
      name: "Blue",
      filamentTypeId: sparkleType.id,
      materialTypeId: plaType.id,
      brandName: hatchboxBrand.name,
      diameter: 1.75,
      cost: 22.99,
      grams: 1000,
      Models: {
        connect: [{ id: dragonModel.id }, { id: castleModel.id }],
      },
    },
  });

  const greenFilament = await prisma.filament.create({
    data: {
      color: "#16A34A",
      name: "Green",
      filamentTypeId: matteType.id,
      materialTypeId: absType.id,
      brandName: overtureBrand.name,
      diameter: 1.75,
      cost: 24.99,
      grams: 1000,
      Models: {
        connect: [{ id: tankModel.id }],
      },
    },
  });

  const grayFilament = await prisma.filament.create({
    data: {
      color: "#6B7280",
      name: "Gray",
      filamentTypeId: metalType.id,
      materialTypeId: petgType.id,
      brandName: sunluBrand.name,
      diameter: 1.75,
      cost: 26.99,
      grams: 1000,
      Models: {
        connect: [{ id: castleModel.id }],
      },
    },
  });

  const whiteFilament = await prisma.filament.create({
    data: {
      color: "#FFFFFF",
      name: "White",
      filamentTypeId: basicType.id,
      materialTypeId: plaType.id,
      brandName: hatchboxBrand.name,
      diameter: 1.75,
      cost: 22.99,
      grams: 1000,
      Models: {
        connect: [{ id: staffModel.id }],
      },
    },
  });

  const blackFilament = await prisma.filament.create({
    data: {
      color: "#000000",
      name: "Black",
      filamentTypeId: matteType.id,
      materialTypeId: absType.id,
      brandName: overtureBrand.name,
      diameter: 1.75,
      cost: 24.99,
      grams: 1000,
    },
  });

  console.log("✅ Filaments created");

  // Create sliced files for the models
  const slicedFiles = await Promise.all([
    prisma.slicedFile.create({
      data: {
        name: "Ancient Dragon - High Detail.gcode",
        modelId: dragonModel.id,
        url: "/uploads/ancient_dragon_hd.gcode",
        size: 2458672,
      },
    }),
    prisma.slicedFile.create({
      data: {
        name: "Medieval Castle - Walls.gcode",
        modelId: castleModel.id,
        url: "/uploads/castle_walls.gcode",
        size: 5420183,
      },
    }),
    prisma.slicedFile.create({
      data: {
        name: "Battle Tank - Standard.gcode",
        modelId: tankModel.id,
        url: "/uploads/tank_standard.gcode",
        size: 1923847,
      },
    }),
    prisma.slicedFile.create({
      data: {
        name: "Wizard Staff - Detailed.gcode",
        modelId: staffModel.id,
        url: "/uploads/wizard_staff.gcode",
        size: 892365,
      },
    }),
  ]);

  console.log("✅ Sliced files created");

  // Create products linking models, sliced files, and filaments
  await Promise.all([
    prisma.product.create({
      data: {
        name: "Premium Red Dragon",
        modelId: dragonModel.id,
        slicedFileId: slicedFiles[0].id,
        price: 35.99,
        Filaments: {
          connect: [{ id: redFilament.id }],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Blue Sparkle Dragon",
        modelId: dragonModel.id,
        slicedFileId: slicedFiles[0].id,
        price: 42.99,
        Filaments: {
          connect: [{ id: blueFilament.id }],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Medieval Castle Set",
        modelId: castleModel.id,
        slicedFileId: slicedFiles[1].id,
        price: 89.99,
        Filaments: {
          connect: [{ id: blueFilament.id }, { id: grayFilament.id }],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Military Tank Model",
        modelId: tankModel.id,
        slicedFileId: slicedFiles[2].id,
        price: 28.50,
        Filaments: {
          connect: [{ id: greenFilament.id }],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: "Wizard's Staff",
        modelId: staffModel.id,
        slicedFileId: slicedFiles[3].id,
        Filaments: {
          connect: [{ id: whiteFilament.id }],
        },
      },
    }),
  ]);

  console.log("✅ Products created");
  console.log("🎉 Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
