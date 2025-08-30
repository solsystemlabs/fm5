import { PrismaClient, FileEntityType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting enhanced database seed with proper hierarchy...");

  // Clear existing data in correct order (respecting foreign key constraints)
  console.log("🧹 Clearing existing data...");
  try {
    await prisma.slicedFileFilament.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.slicedFile.deleteMany({});
    await prisma.file.deleteMany({}); // New: tagged union file system
    await prisma.threeMFFile.deleteMany({}); // New: 3MF containers
    await prisma.modelFile.deleteMany({});
    await prisma.filament.deleteMany({});
    await prisma.model.deleteMany({});
    await prisma.materialType.deleteMany({});
    await prisma.filamentType.deleteMany({});
    await prisma.brand.deleteMany({});
    await prisma.modelCategory.deleteMany({});
    await prisma.recentActivity.deleteMany({});
    await prisma.dashboardAnalytics.deleteMany({});
    console.log("✅ Database cleared with proper hierarchy order");
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
      { name: "Bambu Lab" },
      { name: "ELEGOO" },
      { name: "ANYCUBIC" },
      { name: "Creality" },
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
      { name: "Keychains" },
      { name: "Earrings" },
      { name: "Necklaces" },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Model categories created");

  // Get the created categories and material types for foreign key references
  const categories = await prisma.modelCategory.findMany();
  const materials = await prisma.materialType.findMany();
  const filamentTypes = await prisma.filamentType.findMany();
  const brands = await prisma.brand.findMany();

  // Create 14 models with various categories
  await prisma.model.createMany({
    data: [
      { name: "Ancient Dragon", modelCategoryId: categories.find(c => c.name === "Miniatures")!.id },
      { name: "Medieval Castle", modelCategoryId: categories.find(c => c.name === "Terrain")!.id },
      { name: "Battle Tank", modelCategoryId: categories.find(c => c.name === "Vehicles")!.id },
      { name: "Wizard Staff", modelCategoryId: categories.find(c => c.name === "Accessories")!.id },
      { name: "Skull Keychain", modelCategoryId: categories.find(c => c.name === "Keychains")!.id },
      { name: "Celtic Knot Earrings", modelCategoryId: categories.find(c => c.name === "Earrings")!.id },
      { name: "Dragon Pendant", modelCategoryId: categories.find(c => c.name === "Necklaces")!.id },
      { name: "Modular Terrain Set", modelCategoryId: categories.find(c => c.name === "Terrain")!.id },
      { name: "Phone Stand", modelCategoryId: categories.find(c => c.name === "Tools")!.id },
      { name: "Dice Tower", modelCategoryId: categories.find(c => c.name === "Accessories")!.id },
      { name: "Kitchen Utensil Holder", modelCategoryId: categories.find(c => c.name === "Household")!.id },
      { name: "Sports Car", modelCategoryId: categories.find(c => c.name === "Vehicles")!.id },
      { name: "Elf Warrior", modelCategoryId: categories.find(c => c.name === "Miniatures")!.id },
      { name: "Geometric Earrings", modelCategoryId: categories.find(c => c.name === "Earrings")!.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Models created");

  // Get created models for further processing
  const models = await prisma.model.findMany();

  console.log("🏗️  Creating hierarchical file structure for models...");

  // Create proper hierarchical structure for each model
  const createdThreeMFFiles = [];
  for (const model of models) {
    // Create standalone model files (STL, OBJ - non-3MF files)
    await Promise.all([
      prisma.modelFile.create({
        data: {
          name: `${model.name}.stl`,
          modelId: model.id,
          url: `https://s3.aws.com/fm5-models/${model.name.toLowerCase().replace(/ /g, '_')}.stl`,
          size: 2500000 + Math.floor(Math.random() * 1500000),
          s3Key: `models/${model.name.toLowerCase().replace(/ /g, '_')}.stl`,
          fileType: 'stl',
        },
      }),
      prisma.modelFile.create({
        data: {
          name: `${model.name}_lowres.stl`,
          modelId: model.id,
          url: `https://s3.aws.com/fm5-models/${model.name.toLowerCase().replace(/ /g, '_')}_lowres.stl`,
          size: 850000 + Math.floor(Math.random() * 500000),
          s3Key: `models/${model.name.toLowerCase().replace(/ /g, '_')}_lowres.stl`,
          fileType: 'stl',
        },
      }),
      prisma.modelFile.create({
        data: {
          name: `${model.name}.obj`,
          modelId: model.id,
          url: `https://s3.aws.com/fm5-models/${model.name.toLowerCase().replace(/ /g, '_')}.obj`,
          size: 1800000 + Math.floor(Math.random() * 800000),
          s3Key: `models/${model.name.toLowerCase().replace(/ /g, '_')}.obj`,
          fileType: 'obj',
        },
      }),
    ]);

    // Create standalone model images using tagged union File system
    await prisma.file.createMany({
      data: [
        {
          name: `${model.name}_main_view.jpg`,
          url: `https://s3.aws.com/fm5-images/models/${model.name.toLowerCase().replace(/ /g, '_')}_main.jpg`,
          size: 125000 + Math.floor(Math.random() * 50000),
          s3Key: `images/models/${model.name.toLowerCase().replace(/ /g, '_')}_main.jpg`,
          mimeType: 'image/jpeg',
          entityType: 'MODEL' as FileEntityType,
          entityId: model.id,
        },
        {
          name: `${model.name}_detail_view.jpg`,
          url: `https://s3.aws.com/fm5-images/models/${model.name.toLowerCase().replace(/ /g, '_')}_detail.jpg`,
          size: 98000 + Math.floor(Math.random() * 40000),
          s3Key: `images/models/${model.name.toLowerCase().replace(/ /g, '_')}_detail.jpg`,
          mimeType: 'image/jpeg',
          entityType: 'MODEL' as FileEntityType,
          entityId: model.id,
        },
      ],
    });

    // Create ThreeMFFile container for this model
    const threeMFFile = await prisma.threeMFFile.create({
      data: {
        name: `${model.name}.3mf`,
        modelId: model.id,
        url: `https://s3.aws.com/fm5-models/3mf/${model.name.toLowerCase().replace(/ /g, '_')}.3mf`,
        size: 5000000 + Math.floor(Math.random() * 3000000),
        s3Key: `models/3mf/${model.name.toLowerCase().replace(/ /g, '_')}.3mf`,
        hasGcode: false, // This is an unsliced 3MF
      },
    });

    createdThreeMFFiles.push(threeMFFile);

    // Create images extracted from this specific 3MF file
    await prisma.file.createMany({
      data: [
        {
          name: 'thumbnail.png',
          url: `https://s3.aws.com/fm5-images/3mf/${model.name.toLowerCase().replace(/ /g, '_')}_thumbnail.png`,
          size: 85000 + Math.floor(Math.random() * 30000),
          s3Key: `images/3mf/${model.name.toLowerCase().replace(/ /g, '_')}_thumbnail.png`,
          mimeType: 'image/png',
          entityType: 'THREE_MF' as FileEntityType,
          entityId: threeMFFile.id,
        },
        {
          name: 'preview.png',
          url: `https://s3.aws.com/fm5-images/3mf/${model.name.toLowerCase().replace(/ /g, '_')}_preview.png`,
          size: 120000 + Math.floor(Math.random() * 40000),
          s3Key: `images/3mf/${model.name.toLowerCase().replace(/ /g, '_')}_preview.png`,
          mimeType: 'image/png',
          entityType: 'THREE_MF' as FileEntityType,
          entityId: threeMFFile.id,
        },
      ],
    });
  }

  console.log("✅ Hierarchical model structure created");
  console.log(`   📁 ${models.length * 3} model files (STL/OBJ)`);
  console.log(`   🎨 ${models.length * 2} standalone model images`);
  console.log(`   📦 ${createdThreeMFFiles.length} ThreeMF containers`);
  console.log(`   🖼️  ${createdThreeMFFiles.length * 2} 3MF embedded images`);

  // Create 30+ diverse filaments
  const filamentData = [
    // Reds
    { name: "Crimson Red", color: "#DC143C", material: "PLA", type: "Basic", brand: "Hatchbox", cost: 22.99 },
    { name: "Fire Red", color: "#FF4500", material: "ABS", type: "Matte", brand: "Overture", cost: 24.99 },
    { name: "Ruby Sparkle", color: "#E0115F", material: "PLA", type: "Sparkle", brand: "SUNLU", cost: 26.99 },
    
    // Blues
    { name: "Ocean Blue", color: "#006994", material: "PETG", type: "Basic", brand: "Prusament", cost: 28.99 },
    { name: "Electric Blue", color: "#0080FF", material: "PLA", type: "Sparkle", brand: "eSUN", cost: 23.99 },
    { name: "Navy Blue", color: "#000080", material: "ABS", type: "Matte", brand: "Bambu Lab", cost: 29.99 },
    
    // Greens
    { name: "Forest Green", color: "#228B22", material: "PLA", type: "Basic", brand: "ELEGOO", cost: 21.99 },
    { name: "Lime Green", color: "#32CD32", material: "TPU", type: "Basic", brand: "ANYCUBIC", cost: 34.99 },
    { name: "Emerald Green", color: "#50C878", material: "PETG", type: "Sparkle", brand: "Creality", cost: 27.99 },
    
    // Yellows/Oranges
    { name: "Sunshine Yellow", color: "#FFD700", material: "PLA", type: "Basic", brand: "Hatchbox", cost: 22.99 },
    { name: "Sunset Orange", color: "#FF8C00", material: "ABS", type: "Basic", brand: "Overture", cost: 24.99 },
    { name: "Gold Metal", color: "#FFD700", material: "PLA", type: "Metal", brand: "Polymaker", cost: 32.99 },
    
    // Purples
    { name: "Royal Purple", color: "#663399", material: "PLA", type: "Basic", brand: "SUNLU", cost: 23.99 },
    { name: "Lavender", color: "#E6E6FA", material: "PLA", type: "Matte", brand: "Prusament", cost: 25.99 },
    { name: "Deep Violet", color: "#8B008B", material: "PETG", type: "Sparkle", brand: "eSUN", cost: 28.99 },
    
    // Neutrals
    { name: "Pure White", color: "#FFFFFF", material: "PLA", type: "Basic", brand: "Bambu Lab", cost: 21.99 },
    { name: "Jet Black", color: "#000000", material: "ABS", type: "Basic", brand: "ELEGOO", cost: 22.99 },
    { name: "Stone Gray", color: "#808080", material: "PETG", type: "Matte", brand: "ANYCUBIC", cost: 26.99 },
    { name: "Silver Metal", color: "#C0C0C0", material: "PLA", type: "Metal", brand: "Creality", cost: 31.99 },
    { name: "Charcoal", color: "#36454F", material: "ABS", type: "Matte", brand: "Hatchbox", cost: 24.99 },
    
    // Specialty Colors
    { name: "Hot Pink", color: "#FF69B4", material: "PLA", type: "Basic", brand: "Overture", cost: 23.99 },
    { name: "Copper Metal", color: "#B87333", material: "PLA", type: "Metal", brand: "Polymaker", cost: 33.99 },
    { name: "Wood Brown", color: "#8B4513", material: "WOOD", type: "Basic", brand: "SUNLU", cost: 29.99 },
    { name: "Carbon Black", color: "#2F4F4F", material: "CARBON FIBER", type: "Basic", brand: "Prusament", cost: 34.99 },
    { name: "Transparent Clear", color: "#FFFFFF", material: "PETG", type: "Basic", brand: "eSUN", cost: 27.99 },
    { name: "Glow Green", color: "#39FF14", material: "PLA", type: "Basic", brand: "Bambu Lab", cost: 28.99 },
    { name: "Mint Green", color: "#98FB98", material: "TPU", type: "Basic", brand: "ELEGOO", cost: 33.99 },
    { name: "Sky Blue", color: "#87CEEB", material: "PLA", type: "Matte", brand: "ANYCUBIC", cost: 22.99 },
    { name: "Rose Gold", color: "#E8B4B8", material: "PLA", type: "Metal", brand: "Creality", cost: 32.99 },
    { name: "Burgundy", color: "#800020", material: "ABS", type: "Basic", brand: "Hatchbox", cost: 25.99 },
    { name: "Teal", color: "#008080", material: "PETG", type: "Sparkle", brand: "Overture", cost: 27.99 },
    { name: "Beige", color: "#F5F5DC", material: "PLA", type: "Matte", brand: "Polymaker", cost: 23.99 },
  ];

  const filaments = [];
  for (const fData of filamentData) {
    const material = materials.find(m => m.name === fData.material)!;
    const filamentType = filamentTypes.find(ft => ft.name === fData.type)!;
    const brand = brands.find(b => b.name === fData.brand)!;
    
    const filament = await prisma.filament.create({
      data: {
        name: fData.name,
        color: fData.color,
        materialTypeId: material.id,
        filamentTypeId: filamentType.id,
        brandName: brand.name,
        diameter: 1.75,
        cost: fData.cost,
        grams: 1000,
      },
    });
    filaments.push(filament);
  }

  console.log("✅ 30+ Filaments created");

  // Create 32 unique sliced files (one per product)
  const productData = [
    { name: "Premium Red Dragon", model: "Ancient Dragon", price: 34.99, filamentsCount: 1 },
    { name: "Blue Sparkle Dragon", model: "Ancient Dragon", price: 32.99, filamentsCount: 1 },
    { name: "Gold Metal Dragon", model: "Ancient Dragon", price: 35.99, filamentsCount: 1 },
    { name: "Medieval Castle - Stone", model: "Medieval Castle", price: 28.50, filamentsCount: 2 },
    { name: "Medieval Castle - Dark", model: "Medieval Castle", price: 29.99, filamentsCount: 2 },
    { name: "Military Tank - Camo", model: "Battle Tank", price: 22.99, filamentsCount: 2 },
    { name: "Battle Tank - Steel", model: "Battle Tank", price: 24.99, filamentsCount: 1 },
    { name: "Wizard Staff - Mystic", model: "Wizard Staff", price: 18.99, filamentsCount: 2 },
    { name: "Skull Keychain - Black", model: "Skull Keychain", price: 6.99, filamentsCount: 1 },
    { name: "Skull Keychain - Red", model: "Skull Keychain", price: 7.99, filamentsCount: 1 },
    { name: "Skull Keychain - Glow", model: "Skull Keychain", price: 8.99, filamentsCount: 1 },
    { name: "Celtic Earrings - Silver", model: "Celtic Knot Earrings", price: 12.99, filamentsCount: 1 },
    { name: "Celtic Earrings - Gold", model: "Celtic Knot Earrings", price: 13.99, filamentsCount: 1 },
    { name: "Dragon Pendant - Purple", model: "Dragon Pendant", price: 15.99, filamentsCount: 1 },
    { name: "Dragon Pendant - Copper", model: "Dragon Pendant", price: 17.99, filamentsCount: 1 },
    { name: "Modular Terrain - Forest", model: "Modular Terrain Set", price: 25.99, filamentsCount: 3 },
    { name: "Modular Terrain - Desert", model: "Modular Terrain Set", price: 24.99, filamentsCount: 2 },
    { name: "Phone Stand - Black", model: "Phone Stand", price: 11.99, filamentsCount: 1 },
    { name: "Phone Stand - White", model: "Phone Stand", price: 10.99, filamentsCount: 1 },
    { name: "Phone Stand - Wood", model: "Phone Stand", price: 14.99, filamentsCount: 1 },
    { name: "Dice Tower - Classic", model: "Dice Tower", price: 19.99, filamentsCount: 2 },
    { name: "Dice Tower - Sparkle", model: "Dice Tower", price: 22.99, filamentsCount: 1 },
    { name: "Utensil Holder - Modern", model: "Kitchen Utensil Holder", price: 16.99, filamentsCount: 1 },
    { name: "Utensil Holder - Rustic", model: "Kitchen Utensil Holder", price: 18.99, filamentsCount: 1 },
    { name: "Sports Car - Racing", model: "Sports Car", price: 21.99, filamentsCount: 2 },
    { name: "Sports Car - Classic", model: "Sports Car", price: 20.99, filamentsCount: 1 },
    { name: "Elf Warrior - Battle", model: "Elf Warrior", price: 26.99, filamentsCount: 2 },
    { name: "Elf Warrior - Noble", model: "Elf Warrior", price: 28.99, filamentsCount: 3 },
    { name: "Geometric Earrings - Rose Gold", model: "Geometric Earrings", price: 9.99, filamentsCount: 1 },
    { name: "Geometric Earrings - Silver", model: "Geometric Earrings", price: 8.99, filamentsCount: 1 },
    { name: "Geometric Earrings - Multi", model: "Geometric Earrings", price: 11.99, filamentsCount: 2 },
    { name: "Limited Edition Bundle", model: "Ancient Dragon", price: 34.99, filamentsCount: 3 },
  ];

  // Create sliced files and products
  for (let i = 0; i < productData.length; i++) {
    const product = productData[i];
    const model = models.find(m => m.name === product.model)!;
    const threeMFFile = createdThreeMFFiles.find(tmf => tmf.modelId === model.id)!;
    
    // Create unique sliced file for this product (linked to ThreeMFFile)
    const slicedFile = await prisma.slicedFile.create({
      data: {
        name: `${product.name}.gcode`,
        threeMFFileId: threeMFFile.id,
        url: `/uploads/sliced/${product.name.toLowerCase().replace(/ /g, '_')}.gcode`,
        size: 500000 + Math.floor(Math.random() * 5000000),
        s3Key: `sliced/${product.name.toLowerCase().replace(/ /g, '_')}.gcode`,
        printTimeMinutes: 60 + Math.floor(Math.random() * 480), // 1-8 hours
        totalTimeMinutes: 70 + Math.floor(Math.random() * 600), // slightly more than print time
        layerCount: 100 + Math.floor(Math.random() * 1500),
        layerHeight: 0.1 + Math.random() * 0.2, // 0.1-0.3mm
        maxZHeight: 50 + Math.random() * 200, // 50-250mm
        slicerName: "BambuStudio",
        slicerVersion: "02.01.01.52",
        profileName: "Generic PLA @BBL X1C",
        nozzleDiameter: 0.4,
        bedType: "Textured PEI Plate",
        bedTemperature: 60 + Math.floor(Math.random() * 40), // 60-100°C
        totalFilamentWeight: 10 + Math.random() * 200, // 10-210g
        totalFilamentLength: 3000 + Math.random() * 50000, // 3-53m
        totalFilamentVolume: 5 + Math.random() * 80, // 5-85 cm³
      },
    });

    // Create images associated with this sliced file
    await prisma.file.createMany({
      data: [
        {
          name: 'layer_preview.png',
          url: `https://s3.aws.com/fm5-images/sliced/${product.name.toLowerCase().replace(/ /g, '_')}_layers.png`,
          size: 180000 + Math.floor(Math.random() * 60000),
          s3Key: `images/sliced/${product.name.toLowerCase().replace(/ /g, '_')}_layers.png`,
          mimeType: 'image/png',
          entityType: 'SLICED_FILE' as FileEntityType,
          entityId: slicedFile.id,
        },
        {
          name: 'print_preview.jpg',
          url: `https://s3.aws.com/fm5-images/sliced/${product.name.toLowerCase().replace(/ /g, '_')}_preview.jpg`,
          size: 220000 + Math.floor(Math.random() * 80000),
          s3Key: `images/sliced/${product.name.toLowerCase().replace(/ /g, '_')}_preview.jpg`,
          mimeType: 'image/jpeg',
          entityType: 'SLICED_FILE' as FileEntityType,
          entityId: slicedFile.id,
        },
      ],
    });

    // Select random filaments for this product
    const selectedFilaments = [];
    for (let j = 0; j < product.filamentsCount; j++) {
      const availableFilaments = filaments.filter(f => !selectedFilaments.includes(f));
      const randomFilament = availableFilaments[Math.floor(Math.random() * availableFilaments.length)];
      selectedFilaments.push(randomFilament);
    }

    // Create SlicedFileFilament records for detailed filament usage
    for (let j = 0; j < selectedFilaments.length; j++) {
      const filament = selectedFilaments[j];
      const totalWeight = slicedFile.totalFilamentWeight! / selectedFilaments.length; // Distribute weight across filaments
      const totalLength = slicedFile.totalFilamentLength! / selectedFilaments.length;
      const totalVolume = slicedFile.totalFilamentVolume! / selectedFilaments.length;
      
      await prisma.slicedFileFilament.create({
        data: {
          slicedFileId: slicedFile.id,
          filamentIndex: j,
          lengthUsed: totalLength,
          volumeUsed: totalVolume,
          weightUsed: totalWeight,
          // Breakdown by usage type
          modelLength: totalLength * 0.7, // 70% for model
          modelVolume: totalVolume * 0.7,
          modelWeight: totalWeight * 0.7,
          supportLength: totalLength * 0.15, // 15% for supports
          supportVolume: totalVolume * 0.15,
          supportWeight: totalWeight * 0.15,
          infillLength: totalLength * 0.4, // 40% of model for infill
          infillVolume: totalVolume * 0.4,
          infillWeight: totalWeight * 0.4,
          wallLength: totalLength * 0.3, // 30% of model for walls
          wallVolume: totalVolume * 0.3,
          wallWeight: totalWeight * 0.3,
          wasteLength: totalLength * 0.1, // 10% waste
          wasteVolume: totalVolume * 0.1,
          wasteWeight: totalWeight * 0.1,
          towerLength: totalLength * 0.05, // 5% tower (if multi-material)
          towerVolume: totalVolume * 0.05,
          towerWeight: totalWeight * 0.05,
          // Filament properties at slice time  
          filamentType: materials.find(m => m.id === filament.materialTypeId)?.name || "PLA",
          filamentColor: filament.color,
          filamentVendor: filament.brandName,
          density: 1.24, // Typical PLA density
          diameter: filament.diameter,
          nozzleTemp: 210 + Math.floor(Math.random() * 30), // 210-240°C
          bedTemp: 60 + Math.floor(Math.random() * 20), // 60-80°C
          filamentId: filament.id, // Link to existing filament
        },
      });
    }

    // Create the product
    await prisma.product.create({
      data: {
        name: product.name,
        modelId: model.id,
        slicedFileId: slicedFile.id,
        price: product.price,
        Filaments: {
          connect: selectedFilaments.map(f => ({ id: f.id })),
        },
      },
    });
  }

  console.log("✅ 32 Products with unique sliced files created");
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
