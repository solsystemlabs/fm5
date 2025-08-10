import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.filament.deleteMany({});
  await prisma.model.deleteMany({});
  await prisma.materialType.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.modelCategory.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("✅ Database cleared");

  // Hash the password using better-auth
  const hashedPassword = await hashPassword("password");

  // Generate consistent user ID
  const userId = crypto.randomUUID();

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@fm.com" },
    update: {},
    create: {
      id: userId,
      name: "Admin User",
      email: "admin@fm.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: crypto.randomUUID(),
          accountId: "admin@fm.com",
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  });

  console.log("✅ Admin user created:", adminUser.email);

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
  const brands = await prisma.brand.findMany();

  const miniatureCategory = categories.find((c) => c.name === "Miniatures")!;
  const terrainCategory = categories.find((c) => c.name === "Terrain")!;
  const vehicleCategory = categories.find((c) => c.name === "Vehicles")!;
  const accessoryCategory = categories.find((c) => c.name === "Accessories")!;

  const plaType = materials.find((m) => m.name === "PLA")!;
  const petgType = materials.find((m) => m.name === "PETG")!;
  const absType = materials.find((m) => m.name === "ABS")!;

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
      materialTypeId: absType.id,
      brandName: overtureBrand.name,
      diameter: 1.75,
      cost: 24.99,
      grams: 1000,
    },
  });

  console.log("✅ Filaments created");

  console.log("✅ Filaments created");
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

