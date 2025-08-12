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

  // Hash the password using better-auth (same password for all test accounts)
  const hashedPassword = await hashPassword("password");

  // Create development user accounts for testing
  const testUsers = [
    {
      name: "Admin User",
      email: "admin@fm.com",
      role: "admin",
      description: "System administrator with full access"
    },
    {
      name: "John Designer",
      email: "john@designer.com",
      role: "designer",
      description: "3D model designer and creator"
    },
    {
      name: "Sarah Operator",
      email: "sarah@operator.com", 
      role: "operator",
      description: "Print operator managing day-to-day operations"
    },
    {
      name: "Mike Manager",
      email: "mike@manager.com",
      role: "manager", 
      description: "Operations manager overseeing inventory and costs"
    },
    {
      name: "Lisa Tester",
      email: "lisa@tester.com",
      role: "tester",
      description: "Quality assurance and testing account"
    }
  ];

  const createdUsers = [];

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        id: crypto.randomUUID(),
        name: userData.name,
        email: userData.email,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        accounts: {
          create: {
            id: crypto.randomUUID(),
            accountId: userData.email,
            providerId: "credential",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      },
    });
    
    createdUsers.push(user);
    console.log(`✅ ${userData.role} user created: ${user.email}`);
  }

  console.log(`✅ ${createdUsers.length} development users created successfully`);

  // Create comprehensive filament types using createMany
  await prisma.filamentType.createMany({
    data: [
      // Basic Materials
      { name: "PLA", description: "Polylactic Acid - Easy to print, biodegradable, low temperature" },
      { name: "PLA+", description: "Enhanced PLA - Stronger than regular PLA, still easy to print" },
      { name: "PETG", description: "Polyethylene Terephthalate Glycol - Strong, clear, chemical resistant" },
      { name: "ABS", description: "Acrylonitrile Butadiene Styrene - Durable, heat resistant, post-processable" },
      
      // Engineering Materials
      { name: "ASA", description: "Acrylonitrile Styrene Acrylate - UV resistant ABS alternative" },
      { name: "PC", description: "Polycarbonate - High strength engineering plastic, very high temperature" },
      { name: "PEEK", description: "Polyetheretherketone - Aerospace grade, extreme temperature and chemical resistance" },
      { name: "PEI", description: "Polyetherimide (Ultem) - High performance engineering plastic" },
      { name: "PPS", description: "Polyphenylene Sulfide - Chemical resistant engineering plastic" },
      
      // Flexible Materials
      { name: "TPU", description: "Thermoplastic Polyurethane - Flexible and elastic, rubber-like" },
      { name: "TPE", description: "Thermoplastic Elastomer - Soft, flexible, easier to print than TPU" },
      { name: "TPC", description: "Thermoplastic Copolyester - Semi-flexible, chemical resistant" },
      
      // Filled Materials
      { name: "WOOD", description: "Wood-filled PLA - Natural wood appearance, can be stained and sanded" },
      { name: "CARBON FIBER", description: "Carbon fiber reinforced - Ultra strong, lightweight, conductive" },
      { name: "GLASS FIBER", description: "Glass fiber reinforced - High strength, dimensional stability" },
      { name: "METAL", description: "Metal-filled filament - Heavy, metallic appearance, can be polished" },
      
      // Specialty Materials
      { name: "HIPS", description: "High Impact Polystyrene - Lightweight, dissolvable support material" },
      { name: "PVA", description: "Polyvinyl Alcohol - Water-soluble support material" },
      { name: "HATU", description: "High Temperature Support - Dissolvable in limonene" },
      { name: "BVOH", description: "Butenediol Vinyl Alcohol - Water-soluble, better than PVA" },
      
      // Special Properties
      { name: "CONDUCTIVE", description: "Electrically conductive filament - For printed circuits" },
      { name: "MAGNETIC", description: "Magnetic iron-filled filament - Attracted to magnets" },
      { name: "GLOW", description: "Glow-in-the-dark filament - Photoluminescent properties" },
      { name: "TRANSPARENT", description: "Crystal clear filament - High optical clarity" },
      
      // Composite Materials  
      { name: "CERAMIC", description: "Ceramic-filled filament - Heat resistant, ceramic-like properties" },
      { name: "STONE", description: "Stone-filled filament - Heavy, stone-like texture and appearance" },
      { name: "BAMBOO", description: "Bamboo fiber filled - Sustainable, natural texture" },
      { name: "RECYCLED", description: "Recycled plastic filament - Environmentally friendly" }
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
  const polymakerBrand = filamentBrands.find((b) => b.name === "Polymaker")!;

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

  // Get additional material types for comprehensive filament examples
  const tpuType = filamentTypes.find((m) => m.name === "TPU")!;
  const asaType = filamentTypes.find((m) => m.name === "ASA")!;

  // Create logical filaments with realistic material properties
  await prisma.filament.createMany({
    data: [
      // PLA Filaments (density: 1.24 g/cm³)
      {
        name: "True Red PLA",
        brandId: hatchboxBrand.id,
        typeId: plaType.id,
        color: "Red",
        hexColor: "#DC2626",
        diameter: 1.75,
        density: 1.24, // Standard PLA density
        description: "Vibrant red PLA filament - Easy to print, biodegradable"
      },
      {
        name: "Sky Blue PLA",
        brandId: hatchboxBrand.id,
        typeId: plaType.id,
        color: "Blue",
        hexColor: "#2563EB",
        diameter: 1.75,
        density: 1.24,
        description: "Bright blue PLA filament - Consistent quality"
      },
      {
        name: "Matte Black PLA",
        brandId: hatchboxBrand.id,
        typeId: plaType.id,
        color: "Black",
        hexColor: "#000000",
        diameter: 1.75,
        density: 1.24,
        description: "Matte black PLA with reduced layer lines"
      },

      // ABS Filaments (density: 1.04 g/cm³)
      {
        name: "Forest Green ABS",
        brandId: overtureBrand.id,
        typeId: absType.id,
        color: "Green",
        hexColor: "#16A34A",
        diameter: 1.75,
        density: 1.04, // Standard ABS density
        description: "Forest green ABS filament - Heat resistant and durable"
      },
      {
        name: "White ABS",
        brandId: overtureBrand.id,
        typeId: absType.id,
        color: "White",
        hexColor: "#FFFFFF",
        diameter: 1.75,
        density: 1.04,
        description: "Pure white ABS - Perfect for automotive parts"
      },

      // PETG Filaments (density: 1.27 g/cm³)
      {
        name: "Crystal Clear PETG",
        brandId: sunluBrand.id,
        typeId: petgType.id,
        color: "Clear",
        hexColor: "#F8FAFC",
        diameter: 1.75,
        density: 1.27, // Standard PETG density
        description: "Crystal clear PETG - Chemical resistant and strong"
      },
      {
        name: "Stone Gray PETG",
        brandId: sunluBrand.id,
        typeId: petgType.id,
        color: "Gray",
        hexColor: "#6B7280",
        diameter: 1.75,
        density: 1.27,
        description: "Stone gray PETG filament - Industrial strength"
      },

      // TPU Flexible (density: 1.20 g/cm³)
      {
        name: "Shore 95A TPU Red",
        brandId: overtureBrand.id,
        typeId: tpuType.id,
        color: "Red",
        hexColor: "#DC2626",
        diameter: 1.75,
        density: 1.20, // TPU density
        description: "Flexible TPU Shore 95A - Perfect for phone cases and gaskets"
      },

      // ASA Weather-resistant (density: 1.07 g/cm³)
      {
        name: "UV-Resistant Black ASA",
        brandId: polymakerBrand.id,
        typeId: asaType.id,
        color: "Black",
        hexColor: "#000000",
        diameter: 1.75,
        density: 1.07, // ASA density
        description: "UV-resistant black ASA - Perfect for outdoor applications"
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Filaments created");

  // Get created filaments for roll creation
  const filaments = await prisma.filament.findMany({ include: { type: true, brand: true } });
  const redPLA = filaments.find((f) => f.color === "Red" && f.type.name === "PLA")!;
  const bluePLA = filaments.find((f) => f.color === "Blue" && f.type.name === "PLA")!;
  const blackPLA = filaments.find((f) => f.color === "Black" && f.type.name === "PLA")!;
  const greenABS = filaments.find((f) => f.color === "Green" && f.type.name === "ABS")!;
  const whiteABS = filaments.find((f) => f.color === "White" && f.type.name === "ABS")!;
  const clearPETG = filaments.find((f) => f.color === "Clear" && f.type.name === "PETG")!;
  const grayPETG = filaments.find((f) => f.color === "Gray" && f.type.name === "PETG")!;
  const redTPU = filaments.find((f) => f.color === "Red" && f.type.name === "TPU")!;
  const blackASA = filaments.find((f) => f.color === "Black" && f.type.name === "ASA")!;

  // Create physical filament rolls with realistic pricing per material type
  await prisma.filamentRoll.createMany({
    data: [
      // PLA Rolls (Budget-friendly: $20-25/kg)
      {
        filamentId: redPLA.id,
        initialWeight: 1000, // 1kg
        currentWeight: 750,  // 75% remaining
        spoolWeight: 200,
        totalCost: 22.99,    // $22.99/kg for PLA
        costPerGram: 0.023,
        purchaseDate: new Date("2024-01-15"),
        supplier: "Amazon",
        batchLot: "PLA-R-240115",
        storageLocation: "Shelf A-1",
        conditionNotes: "Good condition, stored in dry box",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: bluePLA.id,
        initialWeight: 1000,
        currentWeight: 900,  // 90% remaining
        spoolWeight: 200,
        totalCost: 22.99,
        costPerGram: 0.023,
        purchaseDate: new Date("2024-02-01"),
        supplier: "Amazon",
        batchLot: "PLA-B-240201",
        storageLocation: "Shelf A-2",
        conditionNotes: "Excellent condition",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: blackPLA.id,
        initialWeight: 1000,
        currentWeight: 200,  // Nearly empty
        spoolWeight: 200,
        totalCost: 24.99,    // Premium matte PLA
        costPerGram: 0.025,
        purchaseDate: new Date("2023-12-10"),
        supplier: "Direct from Hatchbox",
        batchLot: "MPLA-BK-231210",
        storageLocation: "Shelf A-3",
        conditionNotes: "Low remaining - reorder soon",
        isActive: true,
        isEmpty: false
      },

      // ABS Rolls (Mid-range: $25-30/kg)
      {
        filamentId: greenABS.id,
        initialWeight: 1000,
        currentWeight: 500,  // 50% remaining
        spoolWeight: 200,
        totalCost: 27.99,    // ABS premium
        costPerGram: 0.028,
        purchaseDate: new Date("2024-01-30"),
        supplier: "Overture Direct",
        batchLot: "ABS-G-240130",
        storageLocation: "Shelf B-1",
        conditionNotes: "Good condition, no moisture issues",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: whiteABS.id,
        initialWeight: 1000,
        currentWeight: 850,
        spoolWeight: 200,
        totalCost: 26.99,
        costPerGram: 0.027,
        purchaseDate: new Date("2024-02-15"),
        supplier: "Local Store",
        batchLot: "ABS-W-240215",
        storageLocation: "Shelf B-2",
        conditionNotes: "Fresh spool, excellent quality",
        isActive: true,
        isEmpty: false
      },

      // PETG Rolls (Mid-premium: $28-35/kg)
      {
        filamentId: clearPETG.id,
        initialWeight: 1000,
        currentWeight: 1000, // Full spool
        spoolWeight: 200,
        totalCost: 32.99,    // Premium clear PETG
        costPerGram: 0.033,
        purchaseDate: new Date("2024-03-01"),
        supplier: "SUNLU Official",
        batchLot: "PETG-CL-240301",
        storageLocation: "Shelf C-1",
        conditionNotes: "Brand new, unopened",
        isActive: true,
        isEmpty: false
      },
      {
        filamentId: grayPETG.id,
        initialWeight: 1000,
        currentWeight: 650,
        spoolWeight: 200,
        totalCost: 31.99,
        costPerGram: 0.032,
        purchaseDate: new Date("2024-02-20"),
        supplier: "SUNLU Official",
        batchLot: "PETG-GY-240220",
        storageLocation: "Shelf C-2",
        conditionNotes: "Good condition",
        isActive: true,
        isEmpty: false
      },

      // TPU Roll (Premium flexible: $40-50/kg)
      {
        filamentId: redTPU.id,
        initialWeight: 500,   // Smaller 0.5kg spool for TPU
        currentWeight: 300,
        spoolWeight: 150,     // Smaller spool
        totalCost: 24.99,     // $49.98/kg equivalent
        costPerGram: 0.050,
        purchaseDate: new Date("2024-02-10"),
        supplier: "Overture Direct",
        batchLot: "TPU95A-R-240210",
        storageLocation: "Shelf D-1 (Flexible)",
        conditionNotes: "Store away from heat, flexible material",
        isActive: true,
        isEmpty: false
      },

      // ASA Roll (Engineering grade: $35-45/kg)
      {
        filamentId: blackASA.id,
        initialWeight: 750,   // 0.75kg spool
        currentWeight: 750,   // Full
        spoolWeight: 180,
        totalCost: 29.99,     // $39.99/kg equivalent
        costPerGram: 0.040,
        purchaseDate: new Date("2024-03-05"),
        supplier: "Polymaker",
        batchLot: "ASA-BK-240305",
        storageLocation: "Shelf E-1 (Engineering)",
        conditionNotes: "UV-resistant grade, premium quality",
        isActive: true,
        isEmpty: false
      }
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

