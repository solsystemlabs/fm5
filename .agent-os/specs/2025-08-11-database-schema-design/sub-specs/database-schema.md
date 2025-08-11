# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-11-database-schema-design/spec.md

> Created: 2025-08-11
> Version: 1.0.0

## Prisma Schema Definition

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// ============================================================================
// FILAMENT MANAGEMENT
// ============================================================================

model FilamentBrand {
  id        String     @id @default(cuid())
  name      String     @unique
  website   String?
  filaments Filament[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@map("filamentBrands")
}

model FilamentType {
  id          String     @id @default(cuid())
  name        String     @unique // PLA, PETG, ABS, TPU, etc.
  description String?
  filaments   Filament[]
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@map("filamentTypes")
}

// Logical filament definition (color, diameter, material properties)
model Filament {
  id          String        @id @default(cuid())
  name        String
  brandId     String
  typeId      String
  color       String
  hexColor    String? // Hex color code for UI display
  diameter    Float // 1.75, 2.85, 3.0
  density     Float? // g/cm³ for weight calculations
  description String?
  
  // Relationships
  brand       FilamentBrand @relation(fields: [brandId], references: [id], onDelete: Cascade)
  type        FilamentType  @relation(fields: [typeId], references: [id], onDelete: Restrict)
  rolls       FilamentRoll[] // Physical inventory rolls of this filament
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@unique([brandId, name, color, diameter])
  @@index([brandId])
  @@index([typeId])
  @@index([color])
  @@map("filaments")
}

// Physical filament roll inventory (individual spools/rolls)
model FilamentRoll {
  id                String              @id @default(cuid())
  filamentId        String
  
  // Physical tracking
  initialWeight     Float // Initial weight in grams (full roll)
  currentWeight     Float // Current weight in grams (remaining)
  spoolWeight       Float? // Weight of empty spool in grams
  
  // Cost tracking (actual purchase cost for this specific roll)
  totalCost         Float? // Total cost of this roll
  costPerGram       Float? // Calculated cost per gram
  
  // Purchase and storage details
  purchaseDate      DateTime?
  supplier          String? // Where purchased from
  batchLot          String? // Manufacturer batch/lot number
  expirationDate    DateTime? // If applicable
  
  // Physical storage and condition
  storageLocation   String? // Where the roll is stored
  firstUsedDate     DateTime? // When first opened/used
  conditionNotes    String? // Quality, moisture, damage notes
  
  // Status tracking
  isActive          Boolean  @default(true) // false when roll is empty/retired
  isEmpty           Boolean  @default(false) // true when no usable filament remains
  
  // Relationships
  filament          Filament            @relation(fields: [filamentId], references: [id], onDelete: Cascade)
  printJobMaterials PrintJobMaterial[]
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  @@index([filamentId])
  @@index([isActive])
  @@index([isEmpty])
  @@index([storageLocation])
  @@map("filamentRolls")
}

// ============================================================================
// MODEL MANAGEMENT
// ============================================================================

model ModelCategory {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  parentId    String? // For hierarchical categories
  parent      ModelCategory? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    ModelCategory[] @relation("CategoryHierarchy")
  models      Model[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([parentId])
  @@map("modelCategories")
}

model Model {
  id                      String        @id @default(cuid())
  
  // Core Model Information
  name                    String
  description             String?
  title                   String? // From 3MF metadata
  designer                String? // Creator/designer name
  designerUserId          String? // Designer's user ID
  origin                  String? // Source/origin information
  license                 String? // License information
  copyright               String? // Copyright information
  categoryId              String?
  
  // File Management
  originalFileName        String // Original uploaded file name
  fileHash                String @unique // SHA-256 hash for deduplication
  fileSize                Int // File size in bytes
  uploadedAt              DateTime @default(now())
  
  // 3MF Container Metadata
  slicerApplication       String? // e.g., "BambuStudio-02.01.01.52"
  slicerVersion           String? // Version number
  threemfVersion          String? // 3MF format version
  creationDate            DateTime? // From 3MF metadata
  modificationDate        DateTime? // Last modified date
  hasGcode                Boolean @default(false) // Contains sliced gcode
  hasThumbnails           Boolean @default(false) // Contains preview images
  hasTextures             Boolean @default(false) // Contains material textures
  thumbnailPaths          String? // JSON array of thumbnail file paths
  
  // Physical Model Properties
  boundingBoxMinX         Float? // Minimum X coordinate in mm
  boundingBoxMinY         Float? // Minimum Y coordinate in mm
  boundingBoxMinZ         Float? // Minimum Z coordinate in mm
  boundingBoxMaxX         Float? // Maximum X coordinate in mm
  boundingBoxMaxY         Float? // Maximum Y coordinate in mm
  boundingBoxMaxZ         Float? // Maximum Z coordinate in mm
  volume                  Float? // Model volume in mm³
  area                    Float? // Surface area in mm²
  units                   String @default("millimeter") // Model units
  vertexCount             Int? // Number of vertices
  triangleCount           Int? // Number of triangles
  meshCount               Int @default(1) // Number of mesh objects
  
  // Print Planning & Time Estimation
  estimatedPrintTime      Int? // Estimated print time in seconds
  predictedDuration       Int? // From slice_info.config prediction field
  layerCount              Int? // Total number of layers
  layerHeight             Float? // Layer height in mm, e.g., 0.2
  infillDensity           String? // e.g., "15%"
  wallLoops               Int? // Number of perimeter walls
  topShellLayers          Int? // Top solid layers
  bottomShellLayers       Int? // Bottom solid layers
  printSpeed              Int? // Overall print speed in mm/min
  
  // Material Requirements
  primaryMaterial         String? // Main material type, e.g., "PLA"
  totalFilamentUsedMeters Float? // Total filament length in meters
  totalFilamentUsedGrams  Float? // Total filament weight in grams
  estimatedCost           Float? // Calculated material cost
  isMultiMaterial         Boolean @default(false) // Uses multiple materials/colors
  materialCount           Int @default(1) // Number of different materials
  filamentMapping         String? // JSON array of filament slot mappings
  
  // Multi-Material & Color Information (JSON fields)
  filamentColors          String? // JSON array of hex color codes
  filamentTypes           String? // JSON array of material types for each extruder
  filamentBrands          String? // JSON array of brand names for each material
  filamentIds             String? // JSON array of filament ID codes
  filamentUsageMeters     String? // JSON array of usage per filament in meters
  filamentUsageGrams      String? // JSON array of usage per filament in grams
  layerFilamentMapping    String? // JSON mapping layers to filament IDs
  flushVolumeMatrix       String? // JSON array of purge volumes between materials
  supportMaterial         String? // Support material type if different
  
  // Print Quality & Settings
  printProfile            String? // e.g., "0.20mm Standard @BBL X1C"
  nozzleDiameter          Float? // Nozzle size in mm, e.g., 0.4
  nozzleTemperature       Int? // Print temperature in °C
  bedTemperature          Int? // Bed temperature in °C
  supportEnabled          Boolean @default(false) // Uses support material
  supportType             String? // Support type, e.g., "tree(auto)"
  bridgeSupport           Boolean @default(false) // Uses bridge support
  raftLayers              Int? // Number of raft layers
  brimWidth               Float? // Brim width in mm
  
  // Machine & Printer Compatibility
  compatiblePrinters      String? // JSON array of compatible printer models
  printerModel            String? // Target printer, e.g., "Bambu Lab P1S"
  printableAreaX          Float? // Required X print area in mm
  printableAreaY          Float? // Required Y print area in mm
  printableHeight         Float? // Required Z height in mm
  bedType                 String? // Bed surface type, e.g., "Supertack Plate"
  requiredExtruders       Int @default(1) // Number of extruders needed
  extruderTypes           String? // JSON array of extruder types required
  nozzleTypes             String? // JSON array of nozzle material types
  
  // File References & Assets
  modelPath               String? // Path to 3D model file within 3MF
  gcodePath               String? // Path to gcode file if present
  configPaths             String? // JSON array of config file paths
  thumbnailSmallPath      String? // Small thumbnail path
  thumbnailLargePath      String? // Large thumbnail path
  plateImagePath          String? // Build plate preview path
  stlFileUrl              String? // URL to original STL file
  threemfFileUrl          String? // URL to 3MF file
  previewImageUrl         String? // Public URL for preview image
  downloadUrl             String // Public download URL
  
  // Print History & Statistics
  downloadCount           Int @default(0) // Download counter
  printCount              Int @default(0) // Times printed
  successfulPrints        Int @default(0) // Successful print counter
  failedPrints            Int @default(0) // Failed print counter
  averagePrintTime        Int? // Average actual print time in seconds
  lastPrintedAt           DateTime? // Last print timestamp
  printSuccessRate        Float? // Success percentage
  userRating              Float? // Average user rating (1.0-5.0)
  difficulty              String? // Print difficulty level (Easy, Medium, Hard)
  
  // Organization & Search
  tags                    String? // JSON array of searchable tags
  visibility              String @default("public") // public/private/unlisted
  featured                Boolean @default(false) // Featured model flag
  searchKeywords          String? // Additional search terms
  isOriginalDesign        Boolean @default(true) // Original vs remix
  sourceUrl               String? // Original source URL
  remixParentId           String? // Parent model if remix
  
  // Relationships
  category                ModelCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  remixParent             Model? @relation("ModelRemix", fields: [remixParentId], references: [id], onDelete: SetNull)
  remixes                 Model[] @relation("ModelRemix")
  products                Product[]
  printJobs               PrintJob[]
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@index([categoryId])
  @@index([name])
  @@index([designer])
  @@index([primaryMaterial])
  @@index([isMultiMaterial])
  @@index([featured])
  @@index([visibility])
  @@index([printCount])
  @@index([downloadCount])
  @@index([difficulty])
  @@index([creationDate])
  @@index([fileHash])
  @@fulltext([name, description, tags, searchKeywords])
  @@map("models")
}

// ============================================================================
// PRODUCT MANAGEMENT (Finished Items)
// ============================================================================

model Product {
  id              String     @id @default(cuid())
  name            String
  description     String?
  modelId         String?
  
  // Product-specific details
  quantity        Int        @default(1) // How many of this product exist
  sellPrice       Float? // If selling the product
  status          String     @default("completed") // completed, sold, gifted, damaged
  
  // Quality and notes
  qualityRating   Int? // 1-5 scale
  notes           String?
  photoUrls       String? // JSON array of photo URLs
  
  // Tracking
  completedDate   DateTime?
  soldDate        DateTime?
  
  // Relationships
  model           Model?     @relation(fields: [modelId], references: [id], onDelete: SetNull)
  printJobs       PrintJob[] // Products can be created from multiple print jobs
  
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([modelId])
  @@index([status])
  @@index([completedDate])
  @@map("products")
}

// ============================================================================
// PRINTER MANAGEMENT
// ============================================================================

model PrinterBrand {
  id        String    @id @default(cuid())
  name      String    @unique
  website   String?
  printers  Printer[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("printerBrands")
}

model Printer {
  id              String       @id @default(cuid())
  name            String
  brandId         String?
  model           String? // Printer model name
  
  // Technical specifications
  buildVolumeX    Float? // mm
  buildVolumeY    Float? // mm  
  buildVolumeZ    Float? // mm
  nozzleDiameter  Float? // mm, default 0.4
  layerHeightMin  Float? // Minimum layer height
  layerHeightMax  Float? // Maximum layer height
  
  // Multi-material support
  extruderCount   Int          @default(1)
  supportsAMS     Boolean      @default(false) // Automatic Material System
  
  // Status and maintenance
  status          String       @default("active") // active, maintenance, retired
  location        String? // Where the printer is located
  purchaseDate    DateTime?
  warrantyExpiry  DateTime?
  
  // Maintenance tracking
  totalPrintTime  Int          @default(0) // Total print time in minutes
  totalFilament   Float        @default(0) // Total filament used in grams
  lastMaintenance DateTime?
  notes           String?
  
  // Relationships
  brand           PrinterBrand? @relation(fields: [brandId], references: [id], onDelete: SetNull)
  printJobs       PrintJob[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([brandId])
  @@index([status])
  @@index([location])
  @@map("printers")
}

// ============================================================================
// PRINT JOB TRACKING
// ============================================================================

model PrintJob {
  id              String             @id @default(cuid())
  name            String
  description     String?
  
  // Job details
  printerId       String
  modelId         String?
  productId       String? // If creating a specific product
  
  // Print settings
  layerHeight     Float // Actual layer height used
  infillDensity   Int // Actual infill percentage used
  printSpeed      Int? // mm/s
  nozzleTemp      Int? // Celsius
  bedTemp         Int? // Celsius
  
  // Time tracking
  estimatedTime   Int? // Estimated print time in minutes
  actualTime      Int? // Actual print time in minutes
  startTime       DateTime?
  endTime         DateTime?
  
  // Status
  status          String @default("queued") // queued, printing, completed, failed, cancelled
  
  // Quality and results
  qualityRating   Int? // 1-5 scale
  notes           String?
  failureReason   String? // If status is failed
  
  // Cost calculation fields
  totalCost       Float? // Calculated total cost
  electricityCost Float? // Estimated electricity cost
  
  // Relationships
  printer         Printer            @relation(fields: [printerId], references: [id], onDelete: Restrict)
  model           Model?             @relation(fields: [modelId], references: [id], onDelete: SetNull)
  product         Product?           @relation(fields: [productId], references: [id], onDelete: SetNull)
  materials       PrintJobMaterial[] // Multi-material support
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([printerId])
  @@index([modelId])
  @@index([productId])
  @@index([status])
  @@index([startTime])
  @@map("printJobs")
}

// Junction table for multi-material print jobs
model PrintJobMaterial {
  id             String       @id @default(cuid())
  printJobId     String
  filamentRollId String
  
  // Material usage
  estimatedGrams Float? // Estimated usage for this material
  actualGrams    Float? // Actual usage (if measured)
  extruderNumber Int      @default(1) // Which extruder used this material
  
  // Relationships
  printJob       PrintJob     @relation(fields: [printJobId], references: [id], onDelete: Cascade)
  filamentRoll   FilamentRoll @relation(fields: [filamentRollId], references: [id], onDelete: Restrict)
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([printJobId, filamentRollId, extruderNumber])
  @@index([printJobId])
  @@index([filamentRollId])
  @@map("printJobMaterials")
}

// ============================================================================
// HARDWARE INVENTORY
// ============================================================================

model HardwareCategory {
  id          String          @id @default(cuid())
  name        String          @unique
  description String?
  items       HardwareItem[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@map("hardwareCategories")
}

model HardwareItem {
  id              String           @id @default(cuid())
  name            String
  categoryId      String
  description     String?
  
  // Inventory tracking
  quantity        Int              @default(0)
  minQuantity     Int? // Reorder threshold
  maxQuantity     Int? // Maximum stock level
  
  // Cost tracking
  unitCost        Float?
  supplier        String?
  supplierPartNo  String?
  
  // Physical properties
  specifications  String? // JSON string for specs
  storageLocation String?
  
  // Relationships
  category        HardwareCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([categoryId])
  @@index([quantity])
  @@index([minQuantity])
  @@fulltext([name, description])
  @@map("hardwareItems")
}
```

## Design Decisions & Rationale

### 1. Cost Tracking Architecture
- **Filament Level**: Base cost per kg for filament type
- **Roll Level**: Actual cost tracking for price variations and bulk purchases
- **Print Job Level**: Calculated costs including material and electricity

**Rationale**: Enables accurate cost analysis while handling real-world price fluctuations and bulk purchase scenarios.

### 2. Multi-Material Print Support
- **PrintJobMaterial Junction Table**: Links print jobs to multiple filament rolls
- **Extruder Tracking**: Records which extruder used which material

**Rationale**: Supports modern multi-color and multi-material printing workflows while maintaining data integrity.

### 3. Hierarchical Organization
- **Categories**: Support parent-child relationships for flexible organization
- **Brands**: Separate entities for both filaments and printers

**Rationale**: Provides flexible organization without deep nesting complexity.

### 4. File Storage Strategy
- **S3 References**: URLs for STL files, thumbnails, and photos
- **No Binary Storage**: Database stores references, not files

**Rationale**: Keeps database performant while supporting cloud storage scalability.

### 5. Status Tracking
- **Enumerated States**: Consistent status fields across entities
- **Soft Deletion**: Uses status flags instead of hard deletes

**Rationale**: Maintains data history and supports workflow management.

## Schema Changes

### Initial Migration: Core Tables
1. Create all base tables with relationships
2. Add indexes for performance-critical queries
3. Set up foreign key constraints with appropriate cascade rules

### Seed Data Requirements
- Default filament types (PLA, PETG, ABS, TPU, etc.)
- Common hardware categories (Nozzles, Build Plates, Tools, etc.)
- Default model categories (Functional, Decorative, etc.)

## Performance Indexes

### High-Traffic Queries
- **Filaments**: Brand, type, and color lookups
- **Print Jobs**: Status and printer filtering
- **Models**: Name and category searches

### Full-Text Search
- **Models**: Name, description, and tags
- **Hardware Items**: Name and description

## Migration Considerations

### Data Integrity
- Foreign key constraints prevent orphaned records
- Cascade deletes for dependent entities (rolls delete with filaments)
- Restrict deletes for referenced entities (prevent printer deletion if active jobs exist)

### Backward Compatibility
- Nullable fields for optional data during migration
- Default values for status fields
- Flexible JSON fields for extensible metadata

### Performance Optimization
- Composite indexes for common query patterns
- Separate junction table for many-to-many relationships
- Strategic use of database-level constraints

This schema provides a comprehensive foundation for 3D printing management while maintaining flexibility for future enhancements and optimizations.