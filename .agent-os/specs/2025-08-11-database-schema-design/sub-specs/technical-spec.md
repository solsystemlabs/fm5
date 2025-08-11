# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-11-database-schema-design/spec.md

> Created: 2025-08-11
> Version: 1.0.0

## Technical Requirements

### Database Technology Stack
- **Database**: PostgreSQL (existing setup)
- **ORM**: Prisma ORM (existing setup)
- **File Storage**: AWS S3 (existing setup)
- **Framework**: TanStack Start with TypeScript

### Core Entity Requirements

#### 1. Filament Types and Brands
- **FilamentBrand**: name, website (optional)
- **FilamentType**: name (PLA, PETG, ABS, TPU, etc.), description (optional)
- **Indexes**: Unique names for both brands and types

#### 2. Logical Filaments (Product Definitions)
- **Primary Key**: UUID
- **Required Fields**: name, brandId, typeId, color, diameter
- **Optional Fields**: hexColor, density, description
- **Constraints**: 
  - diameter must be positive decimal (1.75, 2.85, 3.0)
  - hexColor must be valid hex color format if provided
  - unique combination of brand, name, color, diameter
- **Indexes**: brandId, typeId, color

#### 3. Physical Filament Rolls (Inventory)
- **Primary Key**: UUID
- **Required Fields**: filamentId, initialWeight, currentWeight
- **Optional Fields**: spoolWeight, totalCost, costPerGram, purchaseDate, supplier, batchLot, expirationDate, storageLocation, firstUsedDate, conditionNotes
- **Status Fields**: isActive, isEmpty
- **Constraints**: 
  - currentWeight must be <= initialWeight
  - weights must be positive
- **Indexes**: filamentId, isActive, isEmpty, storageLocation

#### 4. Models Table (Enhanced for 3MF Support)
- **Primary Key**: UUID
- **Required Fields**: name, originalFileName, fileHash, fileSize, downloadUrl, uploadedAt
- **Core Model Fields**: description, title, designer, designerUserId, origin, license, copyright
- **3MF Container Metadata**: slicerApplication, slicerVersion, threemfVersion, creationDate, modificationDate, hasGcode, hasThumbnails, hasTextures
- **Physical Properties**: boundingBox (MinX/Y/Z, MaxX/Y/Z), volume, area, units, vertexCount, triangleCount, meshCount
- **Print Planning**: estimatedPrintTime, predictedDuration, layerCount, layerHeight, infillDensity, wallLoops, printSpeed
- **Material Support**: primaryMaterial, totalFilamentUsed (meters/grams), estimatedCost, isMultiMaterial, materialCount
- **Multi-Material Fields**: filamentColors, filamentTypes, filamentBrands, filamentIds, filamentUsage (JSON arrays)
- **Print Settings**: printProfile, nozzleDiameter, nozzleTemperature, bedTemperature, supportEnabled, supportType
- **Printer Compatibility**: compatiblePrinters, printerModel, printableArea, bedType, requiredExtruders
- **File References**: modelPath, gcodePath, configPaths, thumbnailPaths, previewImageUrl
- **Statistics**: downloadCount, printCount, successfulPrints, printSuccessRate, userRating, difficulty
- **Organization**: tags, visibility, featured, searchKeywords, isOriginalDesign, remixParentId
- **File Types**: STL, 3MF, OBJ, GCODE with full 3MF metadata extraction
- **Constraints**:
  - fileSize must be positive
  - estimatedPrintTime must be positive if provided
  - userRating must be 1.0-5.0 if provided
  - fileHash must be unique for deduplication
  - JSON fields for array data (colors, usage, compatibility)
- **Indexes**: name, designer, primaryMaterial, isMultiMaterial, featured, visibility, printCount, downloadCount, difficulty, creationDate, fileHash
- **Full-Text Search**: name, description, tags, searchKeywords

#### 5. Products Table
- **Primary Key**: UUID  
- **Required Fields**: name, modelId (FK), createdAt
- **Optional Fields**: description, price, category, isActive
- **Relationships**: 
  - Many-to-One with Models
  - Many-to-One with Filaments (default)
- **Constraints**: price must be positive if provided
- **Indexes**: name, category, isActive, createdAt

#### 6. Print Jobs Table
- **Primary Key**: UUID
- **Required Fields**: modelId (FK), printerId (FK), status, createdAt
- **Optional Fields**: completedAt, estimatedDurationMinutes, actualDurationMinutes, notes
- **Status Values**: 'queued', 'printing', 'completed', 'failed', 'cancelled'
- **Relationships**: 
  - Many-to-One with Models
  - Many-to-One with Printers
  - One-to-Many with Print Job Materials
- **Indexes**: status, createdAt, printerId

#### 7. Print Job Materials Table (Junction/Usage Tracking)
- **Primary Key**: UUID
- **Required Fields**: printJobId (FK), filamentRollId (FK), estimatedGrams, actualGrams
- **Optional Fields**: extruderNumber
- **Purpose**: Track exact filament usage per print job
- **Constraints**: 
  - estimatedGrams and actualGrams must be positive if provided
  - extruderNumber must be positive if provided
- **Indexes**: printJobId, filamentRollId

#### 8. Printers Table
- **Primary Key**: UUID
- **Required Fields**: name, model, status, createdAt
- **Optional Fields**: manufacturer, serialNumber, purchaseDate, maintenanceNotes
- **Status Values**: 'available', 'printing', 'maintenance', 'offline'
- **Constraints**: serialNumber must be unique if provided
- **Indexes**: status, model

#### 9. Hardware Inventory Table
- **Primary Key**: UUID
- **Required Fields**: name, categoryId, quantity, createdAt
- **Optional Fields**: description, costPerUnit, supplier, minimumStock, location
- **Categories**: 'nozzles', 'belts', 'sensors', 'electronics', 'mechanical', 'consumables', 'other'
- **Constraints**: 
  - quantity must be non-negative
  - costPerUnit must be positive if provided
  - minimumStock must be non-negative if provided
- **Indexes**: categoryId, quantity, minimumStock

## Approach

### 1. Database Schema Implementation
```prisma
// Filament management structure
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

// Logical filament definition
model Filament {
  id          String        @id @default(cuid())
  name        String
  brandId     String
  typeId      String
  color       String
  hexColor    String?
  diameter    Float
  density     Float?
  description String?
  
  brand       FilamentBrand @relation(fields: [brandId], references: [id], onDelete: Cascade)
  type        FilamentType  @relation(fields: [typeId], references: [id], onDelete: Restrict)
  rolls       FilamentRoll[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  @@unique([brandId, name, color, diameter])
  @@index([brandId])
  @@index([typeId])
  @@index([color])
  @@map("filaments")
}

// Physical filament roll inventory
model FilamentRoll {
  id                String              @id @default(cuid())
  filamentId        String
  initialWeight     Float
  currentWeight     Float
  spoolWeight       Float?
  totalCost         Float?
  costPerGram       Float?
  purchaseDate      DateTime?
  supplier          String?
  batchLot          String?
  storageLocation   String?
  isActive          Boolean             @default(true)
  isEmpty           Boolean             @default(false)
  
  filament          Filament            @relation(fields: [filamentId], references: [id], onDelete: Cascade)
  printJobMaterials PrintJobMaterial[]
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  @@index([filamentId])
  @@index([isActive])
  @@index([isEmpty])
  @@map("filamentRolls")
}
```

### 2. File Storage Integration
- **S3 Bucket Structure**: 
  - `/models/{uuid}/{filename}.{ext}` for 3D model files
  - Metadata stored in database, files referenced by S3 path
- **File Upload Flow**:
  1. Upload file to S3 with UUID-based naming
  2. Store S3 path and metadata in Models table
  3. Generate signed URLs for download when needed
- **File Parsing**: Integration with existing file parsing service to extract print parameters

### 3. Data Relationships & Integrity
- **Foreign Key Constraints**: All relationships enforced at database level
- **Cascade Rules**:
  - Delete Model → Restrict if referenced by Products or Print Jobs
  - Delete Filament → Restrict if referenced by Print Job Materials
  - Delete Printer → Restrict if has active Print Jobs
- **Check Constraints**: Validate weight relationships, positive values, enum values

### 4. Cost Tracking Implementation
- **Real-time Cost Calculation**: 
  - Calculate cost per print job from actual filament usage
  - Update filament remaining weight after each print
  - Track cost basis at individual filament roll level
- **Cost Queries**: 
  - Total cost per print job across all materials
  - Historical cost trends by material type
  - Filament inventory value calculations

### 5. Performance Considerations
- **Indexing Strategy**: 
  - Primary indexes on foreign keys and status fields
  - Composite indexes for common query patterns
  - GIN indexes for array fields (tags)
- **Query Optimization**:
  - Use database views for complex reporting queries
  - Implement pagination for large result sets
  - Consider materialized views for dashboard metrics

## External Dependencies

### Current Stack (No New Dependencies)
- **PostgreSQL**: Already configured database
- **Prisma ORM**: Already integrated for schema management
- **AWS S3**: Already available for file storage
- **TanStack Start**: Current framework supports database integration

### File Processing Integration
- **3D File Parser**: Integrate with existing file parsing service
- **GCODE Analysis**: Extract print parameters from GCODE files
- **Metadata Extraction**: Parse estimated print times, material requirements

### Database Migration Strategy
- **Prisma Migrations**: Use existing Prisma migration system
- **Seed Data**: Create initial seed data for common materials and hardware
- **Backup Strategy**: Implement database backup procedures before migrations

### Monitoring & Maintenance
- **Database Performance**: Monitor query performance and optimize indexes
- **File Storage**: Implement S3 lifecycle policies for old files
- **Data Integrity**: Regular consistency checks between file storage and database records

## Implementation Phases

### Phase 1: Core Schema
1. Implement Prisma schema for all entities
2. Create and run initial migrations
3. Set up basic seed data

### Phase 2: File Integration
1. Implement S3 upload/download functionality
2. Create file metadata extraction service
3. Build file management API endpoints

### Phase 3: Cost Tracking
1. Implement filament usage tracking
2. Build cost calculation services
3. Create reporting queries and views

### Phase 4: Advanced Features
1. Add inventory management features
2. Implement low-stock alerts
3. Build comprehensive reporting dashboard