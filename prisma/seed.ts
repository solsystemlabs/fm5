import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🧹 Clearing existing data...");
  await prisma.filamentRoll.deleteMany({});
  await prisma.filament.deleteMany({});
  await prisma.filamentType.deleteMany({});
  await prisma.filamentBrand.deleteMany({});
  await prisma.printJobMaterial.deleteMany({});
  await prisma.printJob.deleteMany({});
  await prisma.printer.deleteMany({});
  await prisma.printerBrand.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.model.deleteMany({});
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

  // Create filament types using createMany
  await prisma.filamentType.createMany({
    data: [
      { name: "PLA", description: "Polylactic Acid - Easy to print, biodegradable" },
      { name: "PETG", description: "Polyethylene Terephthalate Glycol - Strong and clear" },
      { name: "ABS", description: "Acrylonitrile Butadiene Styrene - Durable and heat resistant" },
      { name: "TPU", description: "Thermoplastic Polyurethane - Flexible and elastic" },
      { name: "WOOD", description: "Wood-filled filament - Natural appearance" },
      { name: "CARBON FIBER", description: "Carbon fiber reinforced - Ultra strong" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Filament types created");

  // Create filament brands using createMany
  await prisma.filamentBrand.createMany({
    data: [
      { name: "Hatchbox", website: "https://www.hatchbox3d.com" },
      { name: "Overture", website: "https://overture3d.com" },
      { name: "SUNLU", website: "https://www.sunlu.com" },
      { name: "Polymaker", website: "https://polymaker.com" },
      { name: "Prusament", website: "https://prusament.com" },
      { name: "eSUN", website: "https://www.esun3d.com" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Filament brands created");

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
  const filamentTypes = await prisma.filamentType.findMany();
  const filamentBrands = await prisma.filamentBrand.findMany();

  const miniatureCategory = categories.find((c) => c.name === "Miniatures")!;
  const terrainCategory = categories.find((c) => c.name === "Terrain")!;
  const vehicleCategory = categories.find((c) => c.name === "Vehicles")!;
  const accessoryCategory = categories.find((c) => c.name === "Accessories")!;

  const plaType = filamentTypes.find((m) => m.name === "PLA")!;
  const petgType = filamentTypes.find((m) => m.name === "PETG")!;
  const absType = filamentTypes.find((m) => m.name === "ABS")!;

  const hatchboxBrand = filamentBrands.find((b) => b.name === "Hatchbox")!;
  const overtureBrand = filamentBrands.find((b) => b.name === "Overture")!;
  const sunluBrand = filamentBrands.find((b) => b.name === "SUNLU")!;

  // Create models using createMany
  await prisma.model.createMany({
    data: [
      { 
        name: "Ancient Dragon", 
        categoryId: miniatureCategory.id,
        originalFileName: "ancient_dragon.3mf",
        fileHash: "abc123def456",
        fileSize: 1024000,
        description: "Detailed ancient dragon miniature"
      },
      { 
        name: "Medieval Castle", 
        categoryId: terrainCategory.id,
        originalFileName: "medieval_castle.3mf",
        fileHash: "def456ghi789",
        fileSize: 2048000,
        description: "Large medieval castle terrain piece"
      },
      { 
        name: "Battle Tank", 
        categoryId: vehicleCategory.id,
        originalFileName: "battle_tank.3mf",
        fileHash: "ghi789jkl012",
        fileSize: 1536000,
        description: "Modern battle tank vehicle"
      },
      { 
        name: "Wizard Staff", 
        categoryId: accessoryCategory.id,
        originalFileName: "wizard_staff.3mf",
        fileHash: "jkl012mno345",
        fileSize: 512000,
        description: "Magical wizard staff accessory"
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Models created");

  // Create logical filaments
  await prisma.filament.createMany({
    data: [
      {
        name: "True Red PLA",
        brandId: hatchboxBrand.id,
        typeId: plaType.id,
        color: "Red",
        hexColor: "#DC2626",
        diameter: 1.75,
        density: 1.24,
        description: "Vibrant red PLA filament"
      },
      {
        name: "Sky Blue PLA",
        brandId: hatchboxBrand.id,
        typeId: plaType.id,
        color: "Blue",
        hexColor: "#2563EB",
        diameter: 1.75,
        density: 1.24,
        description: "Bright blue PLA filament"
      },
      {
        name: "Forest Green ABS",
        brandId: overtureBrand.id,
        typeId: absType.id,
        color: "Green",
        hexColor: "#16A34A",
        diameter: 1.75,
        density: 1.04,
        description: "Forest green ABS filament"
      },
      {
        name: "Stone Gray PETG",
        brandId: sunluBrand.id,
        typeId: petgType.id,
        color: "Gray",
        hexColor: "#6B7280",
        diameter: 1.75,
        density: 1.27,
        description: "Stone gray PETG filament"
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Filaments created");

  // Get created filaments for roll creation
  const filaments = await prisma.filament.findMany();
  const redFilament = filaments.find((f) => f.color === "Red")!;
  const blueFilament = filaments.find((f) => f.color === "Blue")!;
  const greenFilament = filaments.find((f) => f.color === "Green")!;
  const grayFilament = filaments.find((f) => f.color === "Gray")!;

  // Create physical filament rolls
  await prisma.filamentRoll.createMany({
    data: [
      {
        filamentId: redFilament.id,
        initialWeight: 1000,
        currentWeight: 750,
        spoolWeight: 200,
        totalCost: 22.99,
        costPerGram: 0.023,
        purchaseDate: new Date("2024-01-15"),
        supplier: "Amazon",
        storageLocation: "Shelf A-1",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: blueFilament.id,
        initialWeight: 1000,
        currentWeight: 900,
        spoolWeight: 200,
        totalCost: 22.99,
        costPerGram: 0.023,
        purchaseDate: new Date("2024-02-01"),
        supplier: "Amazon",
        storageLocation: "Shelf A-2",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: greenFilament.id,
        initialWeight: 1000,
        currentWeight: 500,
        spoolWeight: 200,
        totalCost: 24.99,
        costPerGram: 0.025,
        purchaseDate: new Date("2024-01-30"),
        supplier: "Direct",
        storageLocation: "Shelf B-1",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: grayFilament.id,
        initialWeight: 1000,
        currentWeight: 1000,
        spoolWeight: 200,
        totalCost: 26.99,
        costPerGram: 0.027,
        purchaseDate: new Date("2024-03-01"),
        supplier: "Local Store",
        storageLocation: "Shelf B-2",
        isActive: true,
        isEmpty: false
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Filament rolls created");
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

