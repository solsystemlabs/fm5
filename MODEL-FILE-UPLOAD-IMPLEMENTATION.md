# Model File & Image Upload Implementation Plan

**Date:** 2025-08-28  
**Status:** Plan Approved - Ready for Implementation  
**Priority:** High

## Context & Background

### Project Overview
FM5 Manager is a comprehensive 3D printing management application built with:
- **Framework**: TanStack Start (React full-stack framework)
- **Database**: PostgreSQL with Prisma ORM (ModelFile and ModelImage entities exist)
- **Storage**: S3 integration already implemented in `src/lib/s3-service.ts`
- **UI**: React Aria Components + TailwindCSS
- **File Processing**: 3MF parsing capabilities already exist

### Current State Analysis
- ✅ Database schema has `ModelFile` and `ModelImage` entities with proper relationships
- ✅ S3 service is implemented and functional
- ✅ Basic model management exists (`src/routes/models/index.tsx`)
- ✅ 3MF file processing capabilities exist (SlicedFiles route as reference)
- ✅ Reference files available in `referenceFiles/` directory for testing

### User Requirements
1. **File Upload Support**: ZIP, .3MF, STL, and image files
2. **ZIP Extraction**: Auto-extract and categorize images and model files
3. **Image Previewer**: Nice gallery component for viewing images
4. **File Organization**: Upload to proper S3 directories (`images/` and `modelFiles/`)
5. **Model Table Enhancement**: Show images as avatars, display file counts
6. **Model Files Route**: Dedicated management page similar to sliced-files route

## Implementation Plan

### Phase 1: Core Infrastructure

#### 1.1 File Processing Service (`src/lib/file-processing-service.ts`)
Create comprehensive file processing utilities:

```typescript
interface ProcessedFiles {
  images: Array<{
    file: File;
    name: string;
    size: number;
    preview: string; // blob URL
  }>;
  modelFiles: Array<{
    file: File;
    name: string;
    size: number;
    type: 'stl' | '3mf' | 'gcode';
  }>;
  metadata?: ExtractedMetadata; // from 3MF files
}

// Key functions to implement:
- extractZipFiles(zipFile: File): Promise<ProcessedFiles>
- categorizeFiles(files: File[]): ProcessedFiles
- generateImagePreviews(imageFiles: File[]): Promise<string[]>
- validateFileTypes(files: File[]): ValidationResult
```

#### 1.2 API Routes Enhancement

**Update existing route**: `src/routes/api/models.ts`
- Include ModelFiles and ModelImages in GET queries
- Update POST to handle file uploads

**New routes to create**:
- `src/routes/api/models/$id/files.ts` - File upload endpoint
- `src/routes/api/model-files.ts` - Model files management
- `src/routes/api/models/$id/files/$fileId.ts` - Individual file operations

#### 1.3 S3 Service Updates
Update `src/lib/s3-service.ts` to support the new directory structure and add helper functions for model files and images:

```typescript
// New functions to add:
- generateModelFileS3Key(modelId: number, filename: string): string
- generateModelImageS3Key(modelId: number, filename: string): string
- uploadModelFile(file: File, modelId: number): Promise<UploadResult>
- uploadModelImage(file: File, modelId: number): Promise<UploadResult>
```

### Phase 2: Upload Components

#### 2.1 Enhanced Model Dialog (`src/components/dialogs/AddModelDialog.tsx`)

Based on React Aria examples analyzed, implement:

```tsx
// Key components to use:
import { DropZone, FileTrigger, Button, ListBox, ListBoxItem } from 'react-aria-components';

// File upload section with:
- DropZone for drag-and-drop (supports multiple file types)
- FileTrigger for manual file selection
- Real-time file preview using ListBox
- Progress indicators during upload
- File validation and error display
```

**Supported file types**:
- `.zip` (auto-extract)
- `.3mf` (with metadata extraction)
- `.stl` (model files)
- `.png`, `.jpg`, `.jpeg` (images)

#### 2.2 Image Preview Component (`src/components/ImagePreviewGallery.tsx`)

Implement using React Aria patterns:
- Grid layout using `ListBox` with `layout="grid"`
- Image thumbnails with click-to-expand
- Modal overlay for full-size viewing
- Navigation between images
- Delete individual files functionality

### Phase 3: Model Files Route

#### 3.1 New Route (`src/routes/model-files/index.tsx`)
Follow the established pattern from `src/routes/sliced-files/index.tsx`:
- List all model files across all models
- Search and filter functionality
- Download capabilities
- File management operations

#### 3.2 Model Files Table (`src/components/tables/ModelFilesTable.tsx`)
Display columns:
- File name with type icon
- Associated model (with link)
- File size and upload date
- Preview column (for images)
- Actions (download, delete)

### Phase 4: Enhanced Model Display

#### 4.1 Models Table Updates (`src/components/tables/ModelsTable.tsx`)
- Add image avatar column (first model image as thumbnail)
- Show file counts: "3 files, 5 images"
- Hover states for quick preview

#### 4.2 Model Detail Enhancements
- Comprehensive file listing
- Bulk operations interface
- Image gallery integration

## Technical Implementation Details

### File Processing Flow
```
1. Upload → Validate file types and sizes
2. ZIP Extraction → Extract to temp directory, categorize by type
3. 3MF Processing → Extract metadata using existing service
4. S3 Upload → Organized structure (see below)
5. Database → Create ModelFile and ModelImage records
6. Cleanup → Remove temporary files
```

### S3 Directory Structure (CORRECTED)
```
fm5-manager/
└── {environment}/          # dev, prod, etc.
    ├── modelFiles/
    │   └── model-{modelId}/
    │       ├── filename.stl
    │       ├── filename.3mf
    │       └── filename.gcode
    └── images/
        └── model-{modelId}/
            ├── thumbnail.png
            ├── preview1.jpg
            └── preview2.png
```

**Key Change**: Environment is now at the top level under the project, not within file type directories. This provides:
- Better organization and access patterns
- Easier environment-specific management
- More logical hierarchy: Bucket → Project → Environment → File Type → Model

**Updated S3 Key Generation**:
```typescript
// Model files: fm5-manager/{environment}/modelFiles/model-{modelId}/{filename}
// Images: fm5-manager/{environment}/images/model-{modelId}/{filename}
```

### Database Relationships (Already Exist)
```sql
Model (1) -> (Many) ModelFile
Model (1) -> (Many) ModelImage

ModelFile {
  id, name, modelId, url, size
}

ModelImage {
  id, name, modelId, url, size  
}
```

## React Aria Components Usage

Based on documentation analysis, key components to leverage:

### File Upload
```tsx
<DropZone
  onDrop={handleFileDrop}
  getDropOperation={(types) => 
    types.has('application/zip') || 
    types.has('image/png') || 
    types.has('image/jpeg') ? 'copy' : 'cancel'
  }
>
  <FileTrigger
    acceptedFileTypes={['.zip', '.3mf', '.stl', 'image/*']}
    allowsMultiple
    onSelect={handleFileSelect}
  >
    <Button>Select Files</Button>
  </FileTrigger>
</DropZone>
```

### Image Gallery
```tsx
<ListBox
  layout="grid" 
  selectionMode="single"
  items={images}
  className="grid-cols-4 gap-4"
>
  {(image) => (
    <ListBoxItem>
      <img src={image.preview} className="aspect-square object-cover" />
    </ListBoxItem>
  )}
</ListBox>
```

## Reference Files Analysis

From `referenceFiles/` directory analysis:

### 3MF File Structure
```
Baby_StarFish_Keychain.gcode.3mf (ZIP archive containing):
├── [Content_Types].xml
├── _rels/.rels
├── 3D/3dmodel.model
└── Metadata/
    ├── plate_1.gcode (main file)
    ├── plate_1.png (primary thumbnail)
    ├── plate_1_small.png (small thumbnail)
    ├── top_1.png (top view)
    ├── pick_1.png (preview)
    ├── slice_info.config (filament colors, settings)
    └── project_settings.config
```

### File Type Patterns
- **Images**: `plate_*.png`, `top_*.png`, `pick_*.png`
- **Model Files**: `plate_*.gcode`, `*.stl`, `3dmodel.model`
- **Metadata**: `*.config`, `*.json`, `*.xml`

## Development Commands
```bash
npm run dev          # Development server
npm run test         # Run tests
npm run build        # Production build
```

## Files to Create/Modify

### New Files
- `src/lib/file-processing-service.ts`
- `src/routes/api/models/$id/files.ts`
- `src/routes/api/model-files.ts`
- `src/routes/model-files/index.tsx`
- `src/components/tables/ModelFilesTable.tsx`
- `src/components/ImagePreviewGallery.tsx`

### Files to Modify
- `src/lib/s3-service.ts` (add model file/image upload functions)
- `src/components/dialogs/AddModelDialog.tsx`
- `src/components/tables/ModelsTable.tsx`
- `src/routes/api/models.ts`

## Testing Strategy
- Use reference files in `referenceFiles/` for testing
- Test ZIP extraction with `Baby_StarFish.zip`
- Test 3MF processing with `.gcode.3mf` files
- Validate S3 upload/download functionality
- Test image preview and gallery components

## Success Criteria
- [ ] Upload ZIP files and auto-extract contents
- [ ] Upload individual 3MF, STL, and image files
- [ ] Display file lists in upload dialog
- [ ] Preview images in gallery component
- [ ] Store files in organized S3 structure
- [ ] Show model images as avatars in table
- [ ] Model Files route shows all files
- [ ] Download and delete file operations work

---

**Next Steps**: Begin implementation starting with Phase 1 (File Processing Service and S3 Service updates) and work through phases sequentially.