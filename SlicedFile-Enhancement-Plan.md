# SlicedFile Schema Enhancement Plan

## Status Update - August 27, 2025
- ✅ **Phase 1 Complete**: Database schema enhanced and tested
- 🔲 **Phase 2 Pending**: 3MF processing library implementation 
- 🔲 **Phase 3 Pending**: API enhancement
- 🔲 **Phase 4 Pending**: Additional features and UI

### Phase 1 Completion Summary - DETAILED
- ✅ **Enhanced SlicedFile model** with 15+ metadata fields (print time, layer info, slicer details, filament totals)
- ✅ **Created SlicedFileFilament junction table** for multi-filament support with composite unique key
- ✅ **Updated Filament model** with new `SlicedFileFilaments` relationship
- ✅ **Fixed migration issue**: Created proper migration `20250827011715_add_sliced_file_enhancements`
- ✅ **Migration reset works**: `npx prisma migrate reset --force` runs successfully with seed
- ✅ **Schema fully tested**: All new fields, relationships, and junction table working correctly
- ✅ **Database seeded successfully** with enhanced schema and backwards compatibility maintained

**Key Migration Files:**
- `prisma/migrations/20250825003825_init/migration.sql` - Initial schema
- `prisma/migrations/20250827011715_add_sliced_file_enhancements/migration.sql` - SlicedFile enhancements

**Current API Route:**
- `src/routes/api/sliced-files.ts` - Basic GET endpoint only, needs POST for Phase 3

**Database Status:** 
- All tables created and seeded
- SlicedFile records exist but with null metadata fields (ready for Phase 2 processing)
- Junction table ready for filament breakdown data

## Project Context
- **Application**: FM5 Manager - 3D printing management app
- **Framework**: TanStack Start (React full-stack) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Current Status**: ✅ **Phase 1 Complete** - Enhanced SlicedFile schema implemented and tested

## Analysis Summary

### Current Schema State - UPDATED (prisma/schema.prisma:38-76)
```prisma
model SlicedFile {
  id                    Int                    @id @unique @default(autoincrement())
  name                  String                 @unique
  modelId               Int
  url                   String
  size                  Int
  
  // Basic print information
  printTimeMinutes      Int?                   // from "model printing time"
  totalTimeMinutes      Int?                   // from "total estimated time"  
  layerCount           Int?                   // from "total layer number"
  layerHeight          Float?                 // from layer_height config
  maxZHeight           Float?                 // from "max_z_height"
  
  // Slicer information
  slicerName           String?                // e.g., "BambuStudio"
  slicerVersion        String?                // e.g., "02.01.01.52"
  profileName          String?                // from filament_settings_id
  
  // Printer settings
  nozzleDiameter       Float?                 // from nozzle_diameter
  bedType              String?                // from bed_type
  bedTemperature       Int?                   // from hot_plate_temp
  
  // Filament totals (aggregated across all filaments)
  totalFilamentLength  Float?                 // total length in mm
  totalFilamentVolume  Float?                 // total volume in cm³ 
  totalFilamentWeight  Float?                 // total weight in grams
  
  // File metadata
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
  
  // Relationships
  ModelFile            ModelFile?             @relation(fields: [modelFileId], references: [id])
  modelFileId          Int?
  Product              Product[]
  SlicedFileFilaments  SlicedFileFilament[]   // Junction table for multi-filament
}
```

### Reference Files Analyzed
- **Location**: `/home/taylor/projects/fm5/referenceFiles/extracted/Metadata/`
- **Key Files**: 
  - `plate_1.gcode` (lines 1-12: header block, lines 14+: config block)
  - `plate_1.json` (structured metadata)
  - `slice_info.config` (XML format printer/filament data)

### Key Metadata Available for Extraction

#### From Gcode Header Block (lines 1-12)
```
; BambuStudio 02.01.01.52
; model printing time: 29m 54s; total estimated time: 36m 10s
; total layer number: 81
; total filament length [mm] : 3418.34,114.26
; total filament volume [cm^3] : 8222.07,274.83
; total filament weight [g] : 10.36,0.35
; filament_density: 1.26,1.26
; filament_diameter: 1.75,1.75
; max_z_height: 16.20
; filament: 1,2
```

#### From Config Block (found at specific lines)
- Line 96: `filament_colour = #00AE42;#FFFF00`
- Line 128: `filament_type = PLA;PLA`  
- Line 129: `filament_vendor = "Bambu Lab";"Bambu Lab"`
- Line 200: `layer_height = 0.2`

#### From JSON Metadata (plate_1.json)
```json
{
  "bed_type": "supertack_plate",
  "filament_colors": ["#00AE42","#FFFF00"],
  "filament_ids": [0,1],
  "nozzle_diameter": 0.4000000059604645,
  "first_extruder": 0,
  "layer_height": 0.20000000298023224
}
```

## Implementation Plan

---

## 🎯 READY FOR PHASE 2: 3MF Processing Library

### Phase 2 Context for New Claude Code Session

**Current State:** Database schema is fully implemented and tested. Ready to build the 3MF parsing library.

**Files to Create:**
- `src/lib/3mf-parser.ts` - Main parsing library

**Key Implementation Requirements:**

#### A. File Structure Parsing
3MF files are ZIP archives containing:
- `Metadata/plate_1.gcode` - Main gcode with header and config blocks
- `Metadata/plate_1.json` - Structured metadata (bed type, nozzle diameter, colors)
- `Metadata/slice_info.config` - XML format printer/filament settings

#### B. Required Parsing Functions
```typescript
// Time parsing: "29m 54s" -> 1794 (seconds) -> 29.9 (minutes)
parseTimeToMinutes(timeString: string): number

// Multi-value parsing: "3418.34,114.26" -> [3418.34, 114.26]
parseCommaSeparatedFloats(value: string): number[]

// Color parsing: "#00AE42;#FFFF00" -> ["#00AE42", "#FFFF00"]
parseColorList(colorString: string): string[]

// Slicer info: "BambuStudio 02.01.01.52" -> {name: "BambuStudio", version: "02.01.01.52"}
parseSlicerInfo(headerLine: string): {name: string, version: string}
```

#### C. Main Parser Function Structure
```typescript
interface Parsed3MFMetadata {
  // Basic print info
  printTimeMinutes?: number
  totalTimeMinutes?: number
  layerCount?: number
  layerHeight?: number
  maxZHeight?: number
  
  // Slicer info
  slicerName?: string
  slicerVersion?: string
  
  // Printer settings
  nozzleDiameter?: number
  bedType?: string
  bedTemperature?: number
  
  // Filament aggregates
  totalFilamentLength?: number
  totalFilamentVolume?: number
  totalFilamentWeight?: number
  
  // Per-filament data array
  filaments: Array<{
    filamentIndex: number
    lengthUsed?: number
    volumeUsed?: number
    weightUsed?: number
    filamentType?: string
    filamentColor?: string
    filamentVendor?: string
    density?: number
    diameter?: number
    nozzleTemp?: number
    bedTemp?: number
  }>
}

async function parse3MFMetadata(buffer: Buffer): Promise<Parsed3MFMetadata>
```

#### D. Dependencies Required for Phase 2
**Status: Not installed yet** - Need to add to package.json during Phase 2:
- `jszip` for ZIP extraction (3MF files are ZIP archives)
- `xml2js` for XML parsing (slice_info.config file)

Installation commands for Phase 2:
```bash
npm install jszip xml2js
npm install --save-dev @types/xml2js
```

#### E. Error Handling Strategy
- Graceful degradation: if parsing fails partially, return what was successfully extracted
- Validation: ensure numeric values are valid numbers
- Logging: use existing logger from `src/lib/logger.ts`

#### F. Exact Data Mapping Reference (from reference files analyzed)

**Gcode Header Block (lines 1-12):**
```
; BambuStudio 02.01.01.52                    -> slicerName: "BambuStudio", slicerVersion: "02.01.01.52"
; model printing time: 29m 54s               -> printTimeMinutes: 29.9
; total estimated time: 36m 10s              -> totalTimeMinutes: 36.17
; total layer number: 81                     -> layerCount: 81
; total filament length [mm] : 3418.34,114.26 -> totalFilamentLength: 3532.6, filaments[0].lengthUsed: 3418.34, filaments[1].lengthUsed: 114.26
; total filament volume [cm^3] : 8222.07,274.83 -> totalFilamentVolume: 8496.9, filaments[0].volumeUsed: 8222.07, filaments[1].volumeUsed: 274.83
; total filament weight [g] : 10.36,0.35      -> totalFilamentWeight: 10.71, filaments[0].weightUsed: 10.36, filaments[1].weightUsed: 0.35
; filament_density: 1.26,1.26                -> filaments[0].density: 1.26, filaments[1].density: 1.26
; filament_diameter: 1.75,1.75               -> filaments[0].diameter: 1.75, filaments[1].diameter: 1.75
; max_z_height: 16.20                        -> maxZHeight: 16.20
```

**Config Block (specific lines found):**
```
Line 96:  filament_colour = #00AE42;#FFFF00  -> filaments[0].filamentColor: "#00AE42", filaments[1].filamentColor: "#FFFF00"
Line 128: filament_type = PLA;PLA            -> filaments[0].filamentType: "PLA", filaments[1].filamentType: "PLA"
Line 129: filament_vendor = "Bambu Lab";"Bambu Lab" -> filaments[0].filamentVendor: "Bambu Lab", filaments[1].filamentVendor: "Bambu Lab"
Line 200: layer_height = 0.2                -> layerHeight: 0.2
```

**JSON Metadata (plate_1.json):**
```json
{
  "bed_type": "supertack_plate",              -> bedType: "supertack_plate"
  "nozzle_diameter": 0.4000000059604645,      -> nozzleDiameter: 0.4
  "filament_colors": ["#00AE42","#FFFF00"]    -> confirms filament color mapping
}
```

**Test Data Available:**
- Reference 3MF: `/home/taylor/projects/fm5/referenceFiles/Baby_StarFish_Keychain.gcode.3mf`
- Extracted files: `/home/taylor/projects/fm5/referenceFiles/extracted/Metadata/`

---

### Phase 1: Database Schema Enhancement - ✅ COMPLETED

#### 1.1 Enhanced SlicedFile Model
Update existing SlicedFile model to include:

```prisma
model SlicedFile {
  id                    Int                    @id @unique @default(autoincrement())
  name                  String                 @unique
  modelId               Int
  url                   String
  size                  Int
  
  // Basic print information
  printTimeMinutes      Int?                   // from "model printing time"
  totalTimeMinutes      Int?                   // from "total estimated time"  
  layerCount           Int?                   // from "total layer number"
  layerHeight          Float?                 // from layer_height config
  maxZHeight           Float?                 // from "max_z_height"
  
  // Slicer information
  slicerName           String?                // e.g., "BambuStudio"
  slicerVersion        String?                // e.g., "02.01.01.52"
  profileName          String?                // from filament_settings_id
  
  // Printer settings
  nozzleDiameter       Float?                 // from nozzle_diameter
  bedType              String?                // from bed_type
  bedTemperature       Int?                   // from hot_plate_temp
  
  // Filament totals (aggregated across all filaments)
  totalFilamentLength  Float?                 // total length in mm
  totalFilamentVolume  Float?                 // total volume in cm³ 
  totalFilamentWeight  Float?                 // total weight in grams
  
  // File metadata
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
  
  // Existing relationships
  ModelFile            ModelFile?             @relation(fields: [modelFileId], references: [id])
  modelFileId          Int?
  Product              Product[]
  SlicedFileFilaments  SlicedFileFilament[]   // NEW: Junction table for multi-filament
}
```

#### 1.2 New SlicedFileFilament Junction Table
Create new model for multi-filament support:

```prisma
model SlicedFileFilament {
  id              Int        @id @unique @default(autoincrement())
  slicedFileId    Int
  filamentIndex   Int        // 0, 1, 2, etc. for multi-filament prints
  
  // Per-filament usage
  lengthUsed      Float?     // length in mm for this specific filament
  volumeUsed      Float?     // volume in cm³ for this specific filament  
  weightUsed      Float?     // weight in grams for this specific filament
  
  // Filament properties at slice time
  filamentType    String?    // PLA, ABS, PETG, etc.
  filamentColor   String?    // hex color code
  filamentVendor  String?    // brand name
  density         Float?     // density value
  diameter        Float?     // filament diameter
  
  // Temperature settings
  nozzleTemp      Int?       // nozzle temperature for this filament
  bedTemp         Int?       // bed temperature for this filament
  
  // Optional relationship to existing Filament record
  filamentId      Int?       // Link to existing Filament if identified
  filament        Filament?  @relation(fields: [filamentId], references: [id])
  
  slicedFile      SlicedFile @relation(fields: [slicedFileId], references: [id])
  
  @@unique([slicedFileId, filamentIndex])
}
```

#### 1.3 Update Existing Filament Model
Add relationship to new junction table:

```prisma
model Filament {
  // ... existing fields ...
  SlicedFileFilaments SlicedFileFilament[]  // NEW relationship
}
```

### Phase 2: 3MF Processing Library

#### 2.1 Create src/lib/3mf-parser.ts
Utility functions for:
- Extracting 3MF archives (ZIP format)
- Parsing gcode header blocks (lines 1-12)
- Parsing gcode config blocks (lines 14+)
- Parsing JSON metadata files
- Parsing XML slice info configs
- Type-safe metadata extraction with validation

#### 2.2 Key Parsing Functions Needed
```typescript
// Extract time from "model printing time: 29m 54s"
function parseTimeToMinutes(timeString: string): number

// Parse multi-value fields like "3418.34,114.26" 
function parseCommaSeparatedFloats(value: string): number[]

// Parse hex colors "#00AE42;#FFFF00"
function parseColorList(colorString: string): string[]

// Parse slicer info "BambuStudio 02.01.01.52"
function parseSlicerInfo(headerLine: string): {name: string, version: string}
```

### Phase 3: API Enhancement

#### 3.1 Update src/routes/api/sliced-files.ts
- Add POST method for file uploads with 3MF processing
- Enhance GET method to include filament breakdown
- Add metadata extraction during upload
- Implement proper error handling and validation

#### 3.2 API Response Structure
```typescript
interface SlicedFileWithFilaments {
  id: number
  name: string
  // ... all SlicedFile fields
  filaments: SlicedFileFilament[]
}
```

### Phase 4: Database Migration

#### 4.1 Migration Steps
1. Create Prisma migration for new fields and table
2. Ensure backward compatibility with existing SlicedFile records  
3. Test migration on development database
4. Update Prisma client generation

### Phase 5: Future Enhancements (Post-MVP)
- UI components for displaying extracted metadata
- Cost estimation based on filament usage
- Print queue with time estimates
- Smart filament matching to inventory
- Batch processing of existing 3MF files

## Technical Implementation Notes

### Multi-Filament Data Structure
- Reference file shows 2 filaments: Green PLA (3418.34mm, 10.36g) + Yellow PLA (114.26mm, 0.35g)
- Each filament gets separate SlicedFileFilament record with filamentIndex 0,1,2...
- Aggregated totals stored in main SlicedFile record

### Data Validation Requirements
- All numeric values must be validated and sanitized
- Handle missing or malformed metadata gracefully
- Preserve original file if parsing fails partially

### Existing API Route Status
- Current GET endpoint at `/api/sliced-files` only returns basic fields
- No POST endpoint exists yet for uploads
- No include statements for related data

## Questions for Clarification
1. Should we auto-match extracted filament colors/types to existing Filament inventory?
2. What should happen if 3MF parsing fails? Store basic file info only?
3. Do we need versioning/history for re-processed files?
4. Should cost estimation be calculated at upload time or on-demand?

## Next Steps for Implementation
1. **Phase 1**: Update Prisma schema and create migration
2. **Test Phase 1**: Verify schema changes work correctly
3. **Commit Phase 1**: Commit database schema enhancements
4. **Phase 2**: Implement 3MF parsing library
5. **Continue iteratively through each phase...**

## Related Files to Modify
- `prisma/schema.prisma` - Database schema
- `src/routes/api/sliced-files.ts` - API endpoints
- `src/lib/3mf-parser.ts` - New parsing library (to create)
- Database migration files (to create)

## Dependencies Status
- ❌ **ZIP library needed**: `jszip` not installed yet (required for Phase 2)
- ❌ **XML library needed**: `xml2js` not installed yet (required for Phase 2)
- ✅ **Logger available**: `src/lib/logger.ts` exists for error logging
- ✅ **Prisma client**: Enhanced schema generated and ready

---

# 📋 QUICK START GUIDE FOR PHASE 2 (New Claude Session)

## Context Summary
- **Project**: FM5 Manager (3D printing management app)
- **Status**: Phase 1 complete - enhanced database schema implemented and tested
- **Next Task**: Build 3MF metadata extraction library

## What's Ready
- ✅ Enhanced SlicedFile schema with 15+ metadata fields
- ✅ SlicedFileFilament junction table for multi-filament support
- ✅ Database migrated and seeded successfully
- ✅ Reference 3MF files analyzed and mapped

## Phase 2 Checklist
1. **Install dependencies**: `npm install jszip xml2js && npm install --save-dev @types/xml2js`
2. **Create `src/lib/3mf-parser.ts`** with main parsing functions
3. **Implement parsing utilities** (parseTimeToMinutes, parseCommaSeparatedFloats, etc.)
4. **Build main `parse3MFMetadata(buffer: Buffer)` function**
5. **Test with reference file**: `/home/taylor/projects/fm5/referenceFiles/Baby_StarFish_Keychain.gcode.3mf`
6. **Return `Parsed3MFMetadata` interface** matching database schema

## Key Implementation Details
- 3MF files are ZIP archives with `Metadata/plate_1.gcode`, `plate_1.json`, etc.
- Multi-filament support: Parse comma-separated values into per-filament arrays
- Reference data shows 2-filament print: Green PLA (3418.34mm) + Yellow PLA (114.26mm)
- Database ready to store both aggregate totals and per-filament breakdown

**File locations for reference:**
- Database schema: `prisma/schema.prisma` (lines 38-107)
- Test data: `/home/taylor/projects/fm5/referenceFiles/extracted/Metadata/`
- API endpoint: `src/routes/api/sliced-files.ts` (Phase 3 enhancement target)